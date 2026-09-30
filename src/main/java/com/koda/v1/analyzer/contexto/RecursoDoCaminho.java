package com.koda.v1.analyzer.contexto;

import java.util.Optional;
import java.util.regex.Pattern;

public final class RecursoDoCaminho {

    private static final Pattern VERSAO_DA_API = Pattern.compile("v\\d+", Pattern.CASE_INSENSITIVE);

    private RecursoDoCaminho() {
    }

    public static Optional<String> de(String caminho) {
        for (String segmento : caminho.split("/")) {
            if (segmento.isBlank() || segmento.equalsIgnoreCase("api") || VERSAO_DA_API.matcher(segmento).matches()) {
                continue;
            }
            return segmento.startsWith("{") ? Optional.empty() : Optional.of(segmento);
        }
        return Optional.empty();
    }
}
