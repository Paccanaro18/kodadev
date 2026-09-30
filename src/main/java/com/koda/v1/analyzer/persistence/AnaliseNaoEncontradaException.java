package com.koda.v1.analyzer.persistence;

import java.util.UUID;

public class AnaliseNaoEncontradaException extends RuntimeException {

    public AnaliseNaoEncontradaException(UUID analiseId) {
        super("Análise não encontrada: " + analiseId);
    }
}
