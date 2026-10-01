package com.koda.v1.challenge.notificacao;

public class NotificacaoNaoEncontradaException extends RuntimeException {

    public NotificacaoNaoEncontradaException() {
        super("Notificação não encontrada.");
    }
}
