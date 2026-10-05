package com.koda.v1.estudo;

public class LimiteDeEstudoExcedidoException extends RuntimeException {

    public LimiteDeEstudoExcedidoException(String mensagem) {
        super(mensagem);
    }
}
