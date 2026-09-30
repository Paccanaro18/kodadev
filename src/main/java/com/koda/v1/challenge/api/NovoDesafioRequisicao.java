package com.koda.v1.challenge.api;

import jakarta.validation.constraints.NotNull;

public record NovoDesafioRequisicao(@NotNull TipoPedido tipo) {
}
