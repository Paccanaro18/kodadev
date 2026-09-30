package com.koda.v1.challenge.persistence;

import java.util.UUID;

public class DesafioNaoEncontradoException extends RuntimeException {

    public DesafioNaoEncontradoException(UUID desafioId) {
        super("Desafio não encontrado: " + desafioId);
    }
}
