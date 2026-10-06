package com.koda.v1.seguranca;

public class FlagInvalidaException extends RuntimeException {

    public FlagInvalidaException(String mensagem) {
        super(mensagem);
    }
}
