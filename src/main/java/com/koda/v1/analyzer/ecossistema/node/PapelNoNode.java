package com.koda.v1.analyzer.ecossistema.node;

import java.util.List;
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
    private static final Set<String> PASTAS_DE_ROTAS = Set.of("controllers", "routes", "routers", "handlers", "api");
    private static final List<String> NAO_E_ENTIDADE = List.of("exception", "error", "input", "request", "response", "dto");

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
        boolean pareceEntidade = termina(stem, "entity") || termina(stem, "model") || termina(stem, "schema")
                || naPasta(caminho, PASTAS_DE_ENTIDADE);
        if (pareceEntidade && NAO_E_ENTIDADE.stream().noneMatch(stem::contains)) {
            return ENTIDADE;
        }
        return OUTRO;
    }

    /** Arquivos onde vale procurar rotas: o nome ou qualquer pasta acima indica rotas ou controllers. */
    public static boolean podeTerRotas(String caminho) {
        if (de(caminho) == CONTROLLER) {
            return true;
        }
        String[] partes = caminho.toLowerCase(Locale.ROOT).split("/");
        for (int i = 0; i < partes.length - 1; i++) {
            if (PASTAS_DE_ROTAS.contains(partes[i])) {
                return true;
            }
        }
        return false;
    }

    private static boolean termina(String stem, String papel) {
        return stem.endsWith("." + papel) || stem.endsWith("-" + papel) || stem.endsWith("_" + papel);
    }

    /** Só a pasta que contém o arquivo conta: "routes/article/article.mapper.ts" não é uma rota. */
    private static boolean naPasta(String caminho, Set<String> pastas) {
        String[] partes = caminho.split("/");
        if (partes.length < 2) {
            return false;
        }
        return pastas.contains(partes[partes.length - 2].toLowerCase(Locale.ROOT))
                && !partes[partes.length - 1].toLowerCase(Locale.ROOT).startsWith("index.");
    }
}
