package com.koda.v1.challenge;

public class ConteudoInvalidoException extends RuntimeException {

    public ConteudoInvalidoException(String motivo) {
        super(motivo);
    }
}
