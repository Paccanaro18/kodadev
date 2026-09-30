package com.koda.v1.challenge.persistence;

import com.koda.v1.challenge.TipoDesafio;

import java.util.UUID;

public record DadosGeracao(
        UUID desafioId,
        UUID usuarioId,
        UUID analiseId,
        TipoDesafio tipo,
        String anguloId,
        String alvoChave,
        String perspectiva
) {
}
