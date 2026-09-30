package com.koda.v1.analyzer.persistence;

public class AnaliseEmAndamentoException extends RuntimeException {

    public AnaliseEmAndamentoException() {
        super("Já existe uma análise em andamento para este repositório.");
    }
}
