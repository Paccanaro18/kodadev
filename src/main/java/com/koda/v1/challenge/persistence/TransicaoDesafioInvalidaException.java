package com.koda.v1.challenge.persistence;

public class TransicaoDesafioInvalidaException extends RuntimeException {

    public TransicaoDesafioInvalidaException(StatusGeracao atual, StatusGeracao desejado) {
        super("Um desafio " + atual + " não pode passar para " + desejado);
    }
}
