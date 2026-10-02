package com.koda.v1.analyzer.ecossistema.node;

import java.util.Locale;
import java.util.Set;

/** O papel que um arquivo de código tem, pela convenção de nomes e de pastas do ecossistema Node. */
public enum PapelNoNode {
    CONTROLLER,
    SERVICE,
    REPOSITORY,
    ENTIDADE,
    OUTRO;

    private static final Set<String> PASTAS_DE_CONTROLLER = Set.of("controllers", "routes", "routers", "handlers");
    private static final Set<String> PASTAS_DE_SERVICE = Set.of("services");
    private static final Set<String> PASTAS_DE_REPOSITORY = Set.of("repositories", "repos");
    private static final Set<String> PASTAS_DE_ENTIDADE = Set.of("entities", "models");

    public static PapelNoNode de(String caminho) {
        if (DetectorRotasNode.pareceArquivoDeRotaDoNext(caminho)) {
            return CONTROLLER;
        }
        String arquivo = caminho.substring(caminho.lastIndexOf('/') + 1).toLowerCase(Locale.ROOT);
        int ponto = arquivo.lastIndexOf('.');
        String stem = ponto < 0 ? arquivo : arquivo.substring(0, ponto);

        if (termina(stem, "controller") || termina(stem, "routes") || termina(stem, "router") || termina(stem, "route")
                || naPasta(caminho, PASTAS_DE_CONTROLLER)) {
            return CONTROLLER;
        }
        if (termina(stem, "service") || naPasta(caminho, PASTAS_DE_SERVICE)) {
            return SERVICE;
        }
        if (termina(stem, "repository") || termina(stem, "repo") || naPasta(caminho, PASTAS_DE_REPOSITORY)) {
            return REPOSITORY;
        }
        if (termina(stem, "entity") || termina(stem, "model") || termina(stem, "schema")
                || naPasta(caminho, PASTAS_DE_ENTIDADE)) {
            return ENTIDADE;
        }
        return OUTRO;
    }

    private static boolean termina(String stem, String papel) {
        return stem.endsWith("." + papel) || stem.endsWith("-" + papel) || stem.endsWith("_" + papel);
    }

    private static boolean naPasta(String caminho, Set<String> pastas) {
        String[] partes = caminho.split("/");
        for (int i = 0; i < partes.length - 1; i++) {
            if (pastas.contains(partes[i].toLowerCase(Locale.ROOT))) {
                return !partes[partes.length - 1].toLowerCase(Locale.ROOT).startsWith("index.");
            }
        }
        return false;
    }
}
