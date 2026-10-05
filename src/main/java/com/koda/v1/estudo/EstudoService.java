package com.koda.v1.estudo;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class EstudoService {

    static final int LIMITE_DE_ITENS_POR_USUARIO = 1000;
    static final int LIMITE_DE_TRILHAS_NA_IMPORTACAO = 30;
    static final int LIMITE_DE_ITENS_POR_TRILHA_NA_IMPORTACAO = 300;
    private static final int TAMANHO_MAXIMO_DA_TRILHA = 60;
    private static final int TAMANHO_MAXIMO_DO_ITEM = 100;
    private static final Pattern SLUG = Pattern.compile("[a-z0-9]+(-[a-z0-9]+)*");

    private final ProgressoDeEstudoRepository repositorio;

    public EstudoService(ProgressoDeEstudoRepository repositorio) {
        this.repositorio = repositorio;
    }

    @Transactional(readOnly = true)
    public EstadoDeEstudo consultar(UUID usuarioId) {
        Map<String, List<String>> licoes = new LinkedHashMap<>();
        Map<String, Map<String, Double>> notas = new LinkedHashMap<>();
        Map<String, List<String>> desafios = new LinkedHashMap<>();
        Set<String> trilhas = new LinkedHashSet<>();

        for (ProgressoDeEstudo registro : repositorio.findByUsuarioId(usuarioId)) {
            if (registro.vazio()) {
                continue;
            }
            String trilha = registro.getTrilha();
            trilhas.add(trilha);
            if (registro.isLicaoLida()) {
                licoes.computeIfAbsent(trilha, chave -> new ArrayList<>()).add(registro.getItem());
            }
            if (registro.getMelhorNota() != null) {
                notas.computeIfAbsent(trilha, chave -> new LinkedHashMap<>()).put(registro.getItem(), registro.getMelhorNota());
            }
            if (registro.isDesafioDeclarado()) {
                desafios.computeIfAbsent(trilha, chave -> new ArrayList<>()).add(registro.getItem());
            }
        }

        Map<String, TrilhaDeEstudo> resultado = new LinkedHashMap<>();
        for (String trilha : trilhas) {
            resultado.put(trilha, new TrilhaDeEstudo(
                    ordenada(licoes.get(trilha)), notas.get(trilha), ordenada(desafios.get(trilha))));
        }
        return new EstadoDeEstudo(resultado);
    }

    @Transactional
    public void registrar(UUID usuarioId, String trilha, String item, AtualizacaoDeEstudo atualizacao) {
        validarSlug(trilha, TAMANHO_MAXIMO_DA_TRILHA, "trilha");
        validarSlug(item, TAMANHO_MAXIMO_DO_ITEM, "item");
        validarNota(atualizacao.nota());

        ProgressoDeEstudo registro = buscarOuCriar(usuarioId, trilha, item);
        if (atualizacao.licaoLida() != null) {
            registro.marcarLicao(atualizacao.licaoLida());
        }
        if (atualizacao.nota() != null) {
            registro.registrarNota(atualizacao.nota());
        }
        if (atualizacao.desafioDeclarado() != null) {
            registro.declararDesafio(atualizacao.desafioDeclarado());
        }
        repositorio.save(registro);
    }

    @Transactional
    public EstadoDeEstudo importar(UUID usuarioId, EstadoDeEstudo estado) {
        validarImportacao(estado);

        for (Map.Entry<String, TrilhaDeEstudo> entrada : estado.trilhas().entrySet()) {
            String trilha = entrada.getKey();
            TrilhaDeEstudo conteudo = entrada.getValue();
            for (String item : conteudo.licoes()) {
                buscarOuCriar(usuarioId, trilha, item).marcarLicao(true);
            }
            for (String item : conteudo.desafios()) {
                buscarOuCriar(usuarioId, trilha, item).declararDesafio(true);
            }
            conteudo.notas().forEach((item, nota) -> buscarOuCriar(usuarioId, trilha, item).registrarNota(nota));
        }
        repositorio.flush();
        return consultar(usuarioId);
    }

    private ProgressoDeEstudo buscarOuCriar(UUID usuarioId, String trilha, String item) {
        return repositorio.findByUsuarioIdAndTrilhaAndItem(usuarioId, trilha, item).orElseGet(() -> {
            if (repositorio.countByUsuarioId(usuarioId) >= LIMITE_DE_ITENS_POR_USUARIO) {
                throw new LimiteDeEstudoExcedidoException("Limite de itens de estudo atingido");
            }
            return repositorio.saveAndFlush(new ProgressoDeEstudo(usuarioId, trilha, item));
        });
    }

    private void validarImportacao(EstadoDeEstudo estado) {
        if (estado.trilhas().size() > LIMITE_DE_TRILHAS_NA_IMPORTACAO) {
            throw new DadosDeEstudoInvalidosException("Trilhas demais na importação");
        }
        for (Map.Entry<String, TrilhaDeEstudo> entrada : estado.trilhas().entrySet()) {
            validarSlug(entrada.getKey(), TAMANHO_MAXIMO_DA_TRILHA, "trilha");
            TrilhaDeEstudo conteudo = entrada.getValue();
            int total = conteudo.licoes().size() + conteudo.desafios().size() + conteudo.notas().size();
            if (total > LIMITE_DE_ITENS_POR_TRILHA_NA_IMPORTACAO) {
                throw new DadosDeEstudoInvalidosException("Itens demais na trilha " + entrada.getKey());
            }
            conteudo.licoes().forEach(item -> validarSlug(item, TAMANHO_MAXIMO_DO_ITEM, "item"));
            conteudo.desafios().forEach(item -> validarSlug(item, TAMANHO_MAXIMO_DO_ITEM, "item"));
            conteudo.notas().forEach((item, nota) -> {
                validarSlug(item, TAMANHO_MAXIMO_DO_ITEM, "item");
                validarNota(nota);
            });
        }
    }

    private void validarSlug(String valor, int tamanhoMaximo, String campo) {
        if (valor == null || valor.length() > tamanhoMaximo || !SLUG.matcher(valor).matches()) {
            throw new DadosDeEstudoInvalidosException("Valor inválido para " + campo);
        }
    }

    private void validarNota(Double nota) {
        if (nota != null && (nota.isNaN() || nota < 0 || nota > 1)) {
            throw new DadosDeEstudoInvalidosException("A nota deve estar entre 0 e 1");
        }
    }

    private List<String> ordenada(List<String> itens) {
        if (itens == null) {
            return List.of();
        }
        return itens.stream().sorted().toList();
    }
}
