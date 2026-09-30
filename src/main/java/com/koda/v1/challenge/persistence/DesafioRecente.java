package com.koda.v1.challenge.persistence;

import com.koda.v1.challenge.TipoDesafio;

import java.time.Instant;
import java.util.UUID;

public record DesafioRecente(
        UUID id,
        UUID analiseId,
        int numero,
        TipoDesafio tipo,
        StatusGeracao statusGeracao,
        StatusProgresso statusProgresso,
        String titulo,
        String conteudoJson,
        Instant criadoEm
) {
}
