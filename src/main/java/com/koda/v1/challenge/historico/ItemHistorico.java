package com.koda.v1.challenge.historico;

import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.persistence.StatusGeracao;
import com.koda.v1.challenge.persistence.StatusProgresso;

import java.time.Instant;
import java.util.UUID;

public record ItemHistorico(
        UUID id,
        UUID analiseId,
        String repositorio,
        int numero,
        String codigo,
        TipoDesafio tipo,
        StatusGeracao statusGeracao,
        StatusProgresso statusProgresso,
        String titulo,
        int dicasUsadas,
        Instant criadoEm,
        Instant finalizadoEm
) {
}
