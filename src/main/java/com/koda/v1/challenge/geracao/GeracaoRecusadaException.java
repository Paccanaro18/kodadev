package com.koda.v1.challenge.geracao;

class GeracaoRecusadaException extends RuntimeException {

    GeracaoRecusadaException(String motivo) {
        super(motivo);
    }
}
