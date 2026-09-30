package com.koda.v1.challenge.persistence;

import java.time.Instant;

public record ProgressoDesafio(StatusProgresso status, Instant iniciadoEm, Instant finalizadoEm) {
}
