package com.koda.v1.challenge.geracao;

public class FilaDeDesafiosCheiaException extends RuntimeException {

    public FilaDeDesafiosCheiaException() {
        super("Há desafios demais sendo gerados. Tente novamente em instantes.");
    }
}
