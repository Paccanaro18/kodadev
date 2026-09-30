package com.koda.v1.challenge.api;

import com.koda.v1.challenge.persistence.StatusProgresso;

import java.time.Instant;

public record ProgressoResposta(StatusProgresso statusProgresso, Instant iniciadoEm, Instant finalizadoEm) {
}
