package com.koda.v1.analyzer.persistence;

public class TransicaoInvalidaException extends RuntimeException {

    public TransicaoInvalidaException(StatusAnalise atual, StatusAnalise desejado) {
        super("Uma análise " + atual + " não pode passar para " + desejado);
    }
}
