package com.koda.v1.challenge.ia;

import java.util.Objects;

public record RespostaIa(String texto, String modelo) {

    public RespostaIa {
        Objects.requireNonNull(texto, "O texto da resposta é obrigatório");
    }
}
