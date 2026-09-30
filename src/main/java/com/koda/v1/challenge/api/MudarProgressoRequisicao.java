package com.koda.v1.challenge.api;

import com.koda.v1.challenge.persistence.StatusProgresso;
import jakarta.validation.constraints.NotNull;

public record MudarProgressoRequisicao(@NotNull StatusProgresso status) {
}
