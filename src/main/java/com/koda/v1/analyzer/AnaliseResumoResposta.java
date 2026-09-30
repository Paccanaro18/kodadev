package com.koda.v1.analyzer;

import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.analyzer.persistence.StatusAnalise;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AnaliseResumoResposta(
        UUID id,
        StatusAnalise status,
        String dono,
        String nome,
        boolean springBoot,
        String versaoJava,
        List<Tecnologia> tecnologias,
        boolean parcial,
        String mensagemErro,
        Instant criadoEm,
        Instant concluidaEm
) {

    public AnaliseResumoResposta {
        tecnologias = List.copyOf(tecnologias);
    }
}
