package com.koda.v1.challenge.catalogo;

import java.util.Objects;

public record AlvoDesafio(EscopoAlvo escopo, String nome, String complemento) {

    public AlvoDesafio {
        Objects.requireNonNull(escopo, "O escopo do alvo é obrigatório");
        Objects.requireNonNull(nome, "O nome do alvo é obrigatório");
    }

    public String chave() {
        return escopo.name() + ":" + nome;
    }
}
