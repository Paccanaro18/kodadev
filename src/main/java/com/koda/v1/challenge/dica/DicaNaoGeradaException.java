package com.koda.v1.challenge.dica;

/** A IA não entregou uma dica aceitável. A mensagem é sempre fixa, nunca o que a IA escreveu. */
public class DicaNaoGeradaException extends RuntimeException {

    public DicaNaoGeradaException(String mensagem) {
        super(mensagem);
    }
}
