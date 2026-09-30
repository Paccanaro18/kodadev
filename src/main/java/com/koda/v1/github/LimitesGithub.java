package com.koda.v1.github;

final class LimitesGithub {

    static final int TAMANHO_MAXIMO_ARQUIVO_BYTES = 256 * 1024;
    static final int TAMANHO_MAXIMO_RESPOSTA_BLOB_BYTES = TAMANHO_MAXIMO_ARQUIVO_BYTES * 2;

    private LimitesGithub() {
    }
}
