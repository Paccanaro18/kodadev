package com.koda.v1.analyzer.persistence;

import java.time.Instant;
import java.util.UUID;

public record AnaliseDetalhe(
        UUID id,
        StatusAnalise status,
        String dono,
        String nome,
        String resultadoJson,
        String contextoJson,
        String mensagemErro,
        Instant criadoEm,
        Instant concluidaEm
) {
}
