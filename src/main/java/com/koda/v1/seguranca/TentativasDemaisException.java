package com.koda.v1.seguranca;

public class TentativasDemaisException extends RuntimeException {

    public TentativasDemaisException() {
        super("Muitas tentativas incorretas. Aguarde alguns minutos e tente de novo");
    }
}
