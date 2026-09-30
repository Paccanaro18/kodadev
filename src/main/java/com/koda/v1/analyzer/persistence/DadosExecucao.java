package com.koda.v1.analyzer.persistence;

import java.util.UUID;

public record DadosExecucao(UUID usuarioId, String dono, String nome) {
}
