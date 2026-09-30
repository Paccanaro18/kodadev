package com.koda.v1.analyzer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record NovaAnaliseRequisicao(
        @NotBlank @Size(max = 100) @Pattern(regexp = "[A-Za-z0-9._-]+") String dono,
        @NotBlank @Size(max = 100) @Pattern(regexp = "[A-Za-z0-9._-]+") String nome
) {
}
