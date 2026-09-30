package com.koda.v1.challenge;

public class DesafiosEsgotadosException extends RuntimeException {

    public DesafiosEsgotadosException() {
        super("Você já praticou tudo o que este projeto oferece para esse tipo. "
                + "Escolha outro tipo ou analise outro repositório.");
    }
}
