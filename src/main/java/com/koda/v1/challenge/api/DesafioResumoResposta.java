package com.koda.v1.challenge.api;

import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.persistence.StatusGeracao;

import java.time.Instant;
import java.util.UUID;

public record DesafioResumoResposta(
        UUID id,
        int numero,
        String codigo,
        TipoDesafio tipo,
        StatusGeracao statusGeracao,
        String titulo,
        String mensagemErro,
        Instant criadoEm
) {
}
