package com.koda.v1.challenge.persistence;

import com.koda.v1.challenge.TipoDesafio;

import java.time.Instant;
import java.util.UUID;

public record DesafioResumo(
        UUID id,
        int numero,
        TipoDesafio tipo,
        StatusGeracao statusGeracao,
        StatusProgresso statusProgresso,
        String titulo,
        String mensagemErro,
        Instant criadoEm
) {
}
