package com.koda.v1.challenge.persistence;

public class TransicaoProgressoInvalidaException extends RuntimeException {

    public TransicaoProgressoInvalidaException(StatusProgresso atual, StatusProgresso desejado) {
        super("Um desafio " + atual + " não pode passar para " + desejado);
    }

    public TransicaoProgressoInvalidaException(StatusGeracao geracao) {
        super("Só é possível acompanhar o progresso de um desafio pronto, e este está " + geracao);
    }
}
