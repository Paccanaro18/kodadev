package com.koda.v1.challenge.geracao;

public class ContextoIndisponivelException extends RuntimeException {

    public ContextoIndisponivelException() {
        super("A análise deste repositório ainda não tem contexto para gerar desafios.");
    }
}
