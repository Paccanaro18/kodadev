package com.koda.v1.challenge.dica;

public class LimiteDiarioDeDicasExcedidoException extends RuntimeException {

    public LimiteDiarioDeDicasExcedidoException(int limite) {
        super("Você atingiu o limite de " + limite + " dicas nas últimas 24 horas. Tente novamente mais tarde.");
    }
}
