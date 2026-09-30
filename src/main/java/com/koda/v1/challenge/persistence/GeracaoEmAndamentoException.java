package com.koda.v1.challenge.persistence;

public class GeracaoEmAndamentoException extends RuntimeException {

    public GeracaoEmAndamentoException() {
        super("Já existe um desafio sendo gerado para você. Aguarde ele terminar.");
    }
}
