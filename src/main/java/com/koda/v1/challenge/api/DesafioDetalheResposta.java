package com.koda.v1.challenge.api;

import com.koda.v1.challenge.ConteudoDesafio;
import com.koda.v1.challenge.NivelDesafio;
import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.persistence.StatusGeracao;

import java.time.Instant;
import java.util.UUID;

public record DesafioDetalheResposta(
        UUID id,
        UUID analiseId,
        int numero,
        String codigo,
        TipoDesafio tipo,
        NivelDesafio nivel,
        StatusGeracao statusGeracao,
        String titulo,
        ConteudoDesafio conteudo,
        String mensagemErro,
        Instant criadoEm,
        Instant concluidoEm
) {
}
