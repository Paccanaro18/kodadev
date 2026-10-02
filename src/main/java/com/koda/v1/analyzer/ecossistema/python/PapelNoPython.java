package com.koda.v1.analyzer.ecossistema.python;

import java.util.Locale;
import java.util.Set;

/** O papel de um arquivo Python, pela convenção de nomes e de pastas de FastAPI, Flask e Django. */
public enum PapelNoPython {
    CONTROLLER,
    SERVICE,
    REPOSITORY,
    MODELO,
    SCHEMA,
    EXCECAO,
    OUTRO;

    private static final Set<String> NOMES_DE_CONTROLLER =
            Set.of("router", "routers", "routes", "views", "urls", "endpoints", "api", "controllers");
    private static final Set<String> NOMES_DE_SERVICE = Set.of("service", "services");
    private static final Set<String> NOMES_DE_REPOSITORY = Set.of("repository", "repositories", "crud");
    private static final Set<String> NOMES_DE_MODELO = Set.of("model", "models", "entities", "entity");
    private static final Set<String> NOMES_DE_SCHEMA = Set.of("schema", "schemas", "dto", "dtos", "serializers");
    private static final Set<String> NOMES_DE_EXCECAO = Set.of("exceptions", "errors", "exception");

    public static PapelNoPython de(String caminho) {
        String arquivo = caminho.substring(caminho.lastIndexOf('/') + 1).toLowerCase(Locale.ROOT);
        String stem = arquivo.endsWith(".py") ? arquivo.substring(0, arquivo.length() - 3) : arquivo;

        PapelNoPython pelaNome = pelo(stem, true);
        if (pelaNome != OUTRO) {
            return pelaNome;
        }
        String[] partes = caminho.toLowerCase(Locale.ROOT).split("/");
        for (int i = partes.length - 2; i >= 0; i--) {
            PapelNoPython pelaPasta = pelo(partes[i], false);
            if (pelaPasta != OUTRO) {
                return pelaPasta;
            }
        }
        return OUTRO;
    }

    private static PapelNoPython pelo(String nome, boolean ehArquivo) {
        if (NOMES_DE_CONTROLLER.contains(nome) || (ehArquivo && terminaCom(nome, "router", "routes", "views",
                "controller", "endpoints"))) {
            return CONTROLLER;
        }
        if (NOMES_DE_SERVICE.contains(nome) || (ehArquivo && terminaCom(nome, "service", "services"))) {
            return SERVICE;
        }
        if (NOMES_DE_REPOSITORY.contains(nome) || (ehArquivo && terminaCom(nome, "repository", "repo"))) {
            return REPOSITORY;
        }
        if (NOMES_DE_MODELO.contains(nome) || (ehArquivo && terminaCom(nome, "model", "models", "entity"))) {
            return MODELO;
        }
        if (NOMES_DE_SCHEMA.contains(nome) || (ehArquivo && terminaCom(nome, "schema", "schemas", "dto"))) {
            return SCHEMA;
        }
        if (NOMES_DE_EXCECAO.contains(nome) || (ehArquivo && terminaCom(nome, "exceptions", "errors"))) {
            return EXCECAO;
        }
        return OUTRO;
    }

    private static boolean terminaCom(String nome, String... sufixos) {
        for (String sufixo : sufixos) {
            if (nome.endsWith("_" + sufixo)) {
                return true;
            }
        }
        return false;
    }
}
