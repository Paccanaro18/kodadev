package com.koda.v1.seguranca;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
public class CatalogoDeSeguranca {

    private static final JsonMapper MAPEADOR = JsonMapper.builder().build();

    private final List<DefinicaoDeDesafio> desafios;

    public CatalogoDeSeguranca(@Value("${koda.seguranca.desafios:classpath:seguranca/desafios/*.json}") String padrao) {
        this.desafios = carregar(padrao);
    }

    public List<DefinicaoDeDesafio> todos() {
        return desafios;
    }

    public Optional<DefinicaoDeDesafio> buscar(String slug) {
        return desafios.stream().filter(desafio -> desafio.slug().equals(slug)).findFirst();
    }

    private static List<DefinicaoDeDesafio> carregar(String padrao) {
        Resource[] arquivos;
        try {
            arquivos = new PathMatchingResourcePatternResolver().getResources(padrao);
        } catch (IOException excecao) {
            throw new IllegalStateException("Não foi possível listar os desafios de segurança", excecao);
        }
        List<Resource> ordenados = Arrays.stream(arquivos)
                .sorted(Comparator.comparing(recurso -> String.valueOf(recurso.getFilename())))
                .toList();

        Set<String> slugs = new HashSet<>();
        List<DefinicaoDeDesafio> lidos = ordenados.stream().map(CatalogoDeSeguranca::ler).toList();
        for (DefinicaoDeDesafio desafio : lidos) {
            if (!slugs.add(desafio.slug())) {
                throw new IllegalStateException("Slug de desafio repetido: " + desafio.slug());
            }
        }
        return List.copyOf(lidos);
    }

    private static DefinicaoDeDesafio ler(Resource recurso) {
        try (InputStream entrada = recurso.getInputStream()) {
            return MAPEADOR.readValue(entrada, DefinicaoDeDesafio.class);
        } catch (IOException excecao) {
            throw new IllegalStateException("Não foi possível ler o desafio " + recurso.getFilename(), excecao);
        } catch (RuntimeException excecao) {
            throw new IllegalStateException("Desafio inválido: " + recurso.getFilename(), excecao);
        }
    }
}
