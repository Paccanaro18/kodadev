package com.koda.v1.analyzer.contexto;

import java.util.Objects;

public record EndpointContexto(String metodoHttp, String caminho, String controller) {

    public EndpointContexto {
        Objects.requireNonNull(metodoHttp, "O método HTTP é obrigatório");
        Objects.requireNonNull(caminho, "O caminho é obrigatório");
        Objects.requireNonNull(controller, "O controller é obrigatório");
    }
}
