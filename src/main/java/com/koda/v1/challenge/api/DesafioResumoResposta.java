package com.koda.v1.challenge.api;

import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.persistence.StatusGeracao;
import com.koda.v1.challenge.persistence.StatusProgresso;

import java.time.Instant;
import java.util.UUID;

public record DesafioResumoResposta(
        UUID id,
        int numero,
        String codigo,
        TipoDesafio tipo,
        StatusGeracao statusGeracao,
        StatusProgresso statusProgresso,
        String titulo,
        String mensagemErro,
        Instant criadoEm
) {
}
