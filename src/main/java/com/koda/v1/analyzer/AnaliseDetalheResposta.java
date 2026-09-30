package com.koda.v1.analyzer;

import com.koda.v1.analyzer.persistence.StatusAnalise;

import java.time.Instant;
import java.util.UUID;

public record AnaliseDetalheResposta(
        UUID id,
        StatusAnalise status,
        String dono,
        String nome,
        ResultadoAnalise resultado,
        String mensagemErro,
        Instant criadoEm,
        Instant concluidaEm
) {
}
