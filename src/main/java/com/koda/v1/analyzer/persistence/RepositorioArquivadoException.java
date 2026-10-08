package com.koda.v1.analyzer.persistence;

public class RepositorioArquivadoException extends RuntimeException {

    public RepositorioArquivadoException() {
        super("Este repositório está arquivado. Conecte-o de novo para gerar novos tickets.");
    }
}
