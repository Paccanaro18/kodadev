package com.koda.v1.challenge.api;

public class LimiteDiarioExcedidoException extends RuntimeException {

    public LimiteDiarioExcedidoException(int limite) {
        super("Você atingiu o limite de " + limite + " desafios nas últimas 24 horas. Tente novamente mais tarde.");
    }
}
