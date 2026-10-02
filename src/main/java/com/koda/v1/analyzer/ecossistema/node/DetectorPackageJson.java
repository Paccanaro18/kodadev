package com.koda.v1.analyzer.ecossistema.node;

import com.koda.v1.analyzer.detector.ArquivoNaoAnalisavelException;
import com.koda.v1.analyzer.detector.LimitesAnalise;
import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.analyzer.ecossistema.Linguagem;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class DetectorPackageJson {

    static final int MAXIMO_DEPENDENCIAS = 300;
    private static final String NOME_ARQUIVO = "package.json";
    private static final JsonMapper MAPEADOR = JsonMapper.builder().build();
    private static final Pattern NOME_DE_PACOTE = Pattern.compile("[@a-z0-9][a-z0-9._/-]{0,100}");
    private static final Pattern VERSAO = Pattern.compile("(\\d{1,4}(?:\\.\\d{1,4}){0,2})");

    /** Em ordem de prioridade: o primeiro que aparecer nas dependências dá o nome do framework. */
    private static final Map<String, String> FRAMEWORKS = new LinkedHashMap<>();

    static {
        FRAMEWORKS.put("@nestjs/core", "NestJS");
        FRAMEWORKS.put("fastify", "Fastify");
        FRAMEWORKS.put("express", "Express");
        FRAMEWORKS.put("koa", "Koa");
        FRAMEWORKS.put("hono", "Hono");
        FRAMEWORKS.put("@hapi/hapi", "Hapi");
        FRAMEWORKS.put("next", "Next.js");
    }

    private static final Map<String, Tecnologia> TECNOLOGIAS = Map.ofEntries(
            Map.entry("pg", Tecnologia.POSTGRESQL),
            Map.entry("pg-promise", Tecnologia.POSTGRESQL),
            Map.entry("postgres", Tecnologia.POSTGRESQL),
            Map.entry("ioredis", Tecnologia.REDIS),
            Map.entry("redis", Tecnologia.REDIS),
            Map.entry("@redis/client", Tecnologia.REDIS),
            Map.entry("bullmq", Tecnologia.REDIS),
            Map.entry("amqplib", Tecnologia.RABBITMQ),
            Map.entry("amqp-connection-manager", Tecnologia.RABBITMQ));

    public ResultadoPackageJson detectar(String conteudo, boolean temTsconfig) {
        LimitesAnalise.validarTamanho(conteudo, NOME_ARQUIVO);

        JsonNode raiz = ler(conteudo);
        Map<String, String> dependencias = new LinkedHashMap<>();
        for (String grupo : List.of("dependencies", "devDependencies", "peerDependencies")) {
            JsonNode no = raiz.get(grupo);
            if (no != null && no.isObject()) {
                no.properties().forEach(entrada ->
                        dependencias.putIfAbsent(entrada.getKey(), entrada.getValue().asString("")));
            }
        }

        String framework = null;
        String versaoFramework = null;
        for (Map.Entry<String, String> candidato : FRAMEWORKS.entrySet()) {
            if (dependencias.containsKey(candidato.getKey())) {
                framework = candidato.getValue();
                versaoFramework = primeiraVersao(dependencias.get(candidato.getKey()));
                break;
            }
        }

        boolean typescript = temTsconfig || dependencias.containsKey("typescript");
        Linguagem linguagem = typescript ? Linguagem.TYPESCRIPT : Linguagem.JAVASCRIPT;
        String versaoLinguagem = typescript
                ? primeiraVersao(dependencias.get("typescript"))
                : primeiraVersao(textoDe(raiz.path("engines").path("node")));

        List<String> nomes = dependencias.keySet().stream()
                .filter(nome -> NOME_DE_PACOTE.matcher(nome).matches())
                .limit(MAXIMO_DEPENDENCIAS)
                .toList();

        Set<Tecnologia> tecnologias = EnumSet.noneOf(Tecnologia.class);
        for (String nome : dependencias.keySet()) {
            Tecnologia tecnologia = TECNOLOGIAS.get(nome);
            if (tecnologia != null) {
                tecnologias.add(tecnologia);
            }
        }

        return new ResultadoPackageJson(
                linguagem, versaoLinguagem, framework, versaoFramework, List.copyOf(new LinkedHashSet<>(nomes)),
                tecnologias);
    }

    private JsonNode ler(String conteudo) {
        try {
            JsonNode raiz = MAPEADOR.readTree(conteudo);
            if (raiz == null || !raiz.isObject()) {
                throw new ArquivoNaoAnalisavelException(NOME_ARQUIVO, "o conteúdo não é um objeto JSON");
            }
            return raiz;
        } catch (JacksonException e) {
            throw new ArquivoNaoAnalisavelException(NOME_ARQUIVO, "JSON inválido", e);
        }
    }

    private String textoDe(JsonNode no) {
        return no.isMissingNode() || no.isNull() ? null : no.asString("");
    }

    private String primeiraVersao(String texto) {
        if (texto == null) {
            return null;
        }
        Matcher matcher = VERSAO.matcher(texto);
        return matcher.find() ? matcher.group(1) : null;
    }
}
