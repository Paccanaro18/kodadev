package com.koda.v1.challenge.api;

import com.koda.v1.challenge.persistence.StatusGeracao;

import java.util.UUID;

public record DesafioResposta(UUID id, StatusGeracao statusGeracao) {
}
