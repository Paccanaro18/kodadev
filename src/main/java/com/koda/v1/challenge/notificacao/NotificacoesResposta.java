package com.koda.v1.challenge.notificacao;

import java.util.List;

public record NotificacoesResposta(long naoLidas, List<Notificacao> itens) {
}
