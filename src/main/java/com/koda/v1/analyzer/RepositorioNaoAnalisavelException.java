package com.koda.v1.analyzer;

public class RepositorioNaoAnalisavelException extends RuntimeException {

    public RepositorioNaoAnalisavelException(String motivo) {
        super(motivo);
    }
}
