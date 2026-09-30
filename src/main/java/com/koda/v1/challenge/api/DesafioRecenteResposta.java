package com.koda.v1.challenge.api;

import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.persistence.StatusGeracao;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DesafioRecenteResposta(
        UUID id,
        UUID analiseId,
        int numero,
        String codigo,
        TipoDesafio tipo,
        StatusGeracao statusGeracao,
        String titulo,
        List<String> habilidades,
        Instant criadoEm
) {
}
