package com.koda.v1.challenge.persistence;

import com.koda.v1.challenge.NivelDesafio;
import com.koda.v1.challenge.TipoDesafio;

import java.time.Instant;
import java.util.UUID;

public record DesafioDetalhe(
        UUID id,
        UUID analiseId,
        int numero,
        TipoDesafio tipo,
        NivelDesafio nivel,
        StatusGeracao statusGeracao,
        String titulo,
        String conteudoJson,
        String modelo,
        String mensagemErro,
        Instant criadoEm,
        Instant concluidoEm,
        StatusProgresso statusProgresso,
        Instant iniciadoEm,
        Instant finalizadoEm
) {
}
