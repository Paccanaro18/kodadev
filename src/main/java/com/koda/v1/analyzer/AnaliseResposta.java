package com.koda.v1.analyzer;

import com.koda.v1.analyzer.persistence.StatusAnalise;

import java.util.UUID;

public record AnaliseResposta(UUID id, StatusAnalise status) {
}
