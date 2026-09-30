package com.koda.v1.analyzer.detector;

public final class LimitesAnalise {

    public static final int MAXIMO_CARACTERES_ARQUIVO = 256 * 1024;

    private LimitesAnalise() {
    }

    static void validarTamanho(String conteudo, String nomeArquivo) {
        if (conteudo == null || conteudo.isBlank()) {
            throw new ArquivoNaoAnalisavelException(nomeArquivo, "arquivo vazio");
        }
        if (conteudo.length() > MAXIMO_CARACTERES_ARQUIVO) {
            throw new ArquivoNaoAnalisavelException(nomeArquivo,
                    "arquivo maior que o limite de " + MAXIMO_CARACTERES_ARQUIVO + " caracteres");
        }
    }
}
