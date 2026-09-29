package com.koda.v1.analyzer.detector;

public class ArquivoNaoAnalisavelException extends RuntimeException {

    public ArquivoNaoAnalisavelException(String nomeArquivo, String motivo) {
        super("Não foi possível analisar " + nomeArquivo + ": " + motivo);
    }

    public ArquivoNaoAnalisavelException(String nomeArquivo, String motivo, Throwable causa) {
        super("Não foi possível analisar " + nomeArquivo + ": " + motivo, causa);
    }
}
