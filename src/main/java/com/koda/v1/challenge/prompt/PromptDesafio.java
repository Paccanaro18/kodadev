package com.koda.v1.challenge.prompt;

import java.util.Objects;

public record PromptDesafio(String sistema, String usuario) {

    public PromptDesafio {
        Objects.requireNonNull(sistema, "O prompt de sistema é obrigatório");
        Objects.requireNonNull(usuario, "O prompt do usuário é obrigatório");
    }
}
