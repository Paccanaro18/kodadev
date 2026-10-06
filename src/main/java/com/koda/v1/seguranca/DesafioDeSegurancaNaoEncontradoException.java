package com.koda.v1.seguranca;

public class DesafioDeSegurancaNaoEncontradoException extends RuntimeException {

    public DesafioDeSegurancaNaoEncontradoException() {
        super("Desafio de segurança não encontrado");
    }
}
