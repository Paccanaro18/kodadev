package com.koda.v1.challenge.notificacao;

import com.koda.v1.challenge.persistence.TipoEvento;

import java.time.Instant;
import java.util.UUID;

public record Notificacao(
        UUID id,
        TipoEvento tipo,
        UUID desafioId,
        String codigo,
        String titulo,
        boolean lida,
        Instant criadoEm
) {
}
