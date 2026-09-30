package com.koda.v1.analyzer;

public class FilaDeAnaliseCheiaException extends RuntimeException {

    public FilaDeAnaliseCheiaException() {
        super("Há análises demais em andamento. Tente novamente em instantes.");
    }
}
