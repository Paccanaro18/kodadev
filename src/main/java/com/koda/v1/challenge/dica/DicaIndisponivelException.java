package com.koda.v1.challenge.dica;

/** O ticket não está em um estado em que dicas fazem sentido, ou já há uma dica sendo gerada para ele. */
public class DicaIndisponivelException extends RuntimeException {

    public DicaIndisponivelException(String mensagem) {
        super(mensagem);
    }
}
