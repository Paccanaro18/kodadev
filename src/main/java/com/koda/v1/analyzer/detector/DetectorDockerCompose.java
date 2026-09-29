package com.koda.v1.analyzer.detector;

import org.springframework.stereotype.Component;
import org.yaml.snakeyaml.LoaderOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.SafeConstructor;
import org.yaml.snakeyaml.error.YAMLException;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class DetectorDockerCompose {

    private static final String NOME_ARQUIVO = "docker-compose.yml";
    private static final int MAXIMO_ALIASES = 10;

    private static final Map<String, Tecnologia> IMAGENS_CONHECIDAS = Map.of(
            "postgres", Tecnologia.POSTGRESQL,
            "postgresql", Tecnologia.POSTGRESQL,
            "postgis", Tecnologia.POSTGRESQL,
            "rabbitmq", Tecnologia.RABBITMQ,
            "redis", Tecnologia.REDIS,
            "redis-stack", Tecnologia.REDIS,
            "redis-stack-server", Tecnologia.REDIS
    );

    public ResultadoCompose detectar(String conteudo) {
        LimitesAnalise.validarTamanho(conteudo, NOME_ARQUIVO);

        Map<?, ?> raiz = lerRaiz(conteudo);
        List<String> imagens = listarImagens(raiz);
        Set<Tecnologia> tecnologias = detectarTecnologias(imagens);

        return new ResultadoCompose(imagens, tecnologias);
    }

    private Map<?, ?> lerRaiz(String conteudo) {
        try {
            LoaderOptions opcoes = new LoaderOptions();
            opcoes.setMaxAliasesForCollections(MAXIMO_ALIASES);
            opcoes.setCodePointLimit(LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO);

            Object lido = new Yaml(new SafeConstructor(opcoes)).load(conteudo);

            if (lido instanceof Map<?, ?> mapa) {
                return mapa;
            }
            throw new ArquivoNaoAnalisavelException(NOME_ARQUIVO, "o conteúdo não é um mapa YAML");
        } catch (YAMLException e) {
            throw new ArquivoNaoAnalisavelException(NOME_ARQUIVO, "YAML inválido ou não permitido", e);
        }
    }

    private List<String> listarImagens(Map<?, ?> raiz) {
        List<String> imagens = new ArrayList<>();
        if (!(raiz.get("services") instanceof Map<?, ?> servicos)) {
            return imagens;
        }
        for (Object servico : servicos.values()) {
            if (servico instanceof Map<?, ?> dados && dados.get("image") instanceof String imagem) {
                imagens.add(nomeDaImagem(imagem));
            }
        }
        return imagens;
    }

    private String nomeDaImagem(String imagem) {
        String semDigest = imagem.split("@")[0];
        String ultimoSegmento = semDigest.substring(semDigest.lastIndexOf('/') + 1);
        int doisPontos = ultimoSegmento.indexOf(':');
        String nome = doisPontos >= 0 ? ultimoSegmento.substring(0, doisPontos) : ultimoSegmento;
        return nome.toLowerCase();
    }

    private Set<Tecnologia> detectarTecnologias(List<String> imagens) {
        Set<Tecnologia> tecnologias = EnumSet.noneOf(Tecnologia.class);
        for (String imagem : imagens) {
            Tecnologia tecnologia = IMAGENS_CONHECIDAS.get(imagem);
            if (tecnologia != null) {
                tecnologias.add(tecnologia);
            }
        }
        return tecnologias;
    }
}