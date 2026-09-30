package com.koda.v1.analyzer;

import java.util.Objects;

public record ArquivoParaAbrir(String caminho, String sha) {

    public ArquivoParaAbrir {
        Objects.requireNonNull(caminho, "O caminho é obrigatório");
        Objects.requireNonNull(sha, "O sha é obrigatório");
    }
}
