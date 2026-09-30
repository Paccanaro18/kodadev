package com.koda.v1.challenge.dica;

public class LimiteDeDicasDoDesafioException extends RuntimeException {

    public LimiteDeDicasDoDesafioException() {
        super("Você já usou todas as dicas deste desafio.");
    }
}
