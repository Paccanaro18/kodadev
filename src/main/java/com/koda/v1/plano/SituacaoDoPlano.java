package com.koda.v1.plano;

import java.time.Instant;
import java.util.List;

public record SituacaoDoPlano(
        Plano plano,
        String nome,
        int ticketsPorMes,
        long ticketsUsados,
        Instant renovaEm,
        int repositorios,
        long repositoriosUsados,
        List<LimiteDoPlano> planos) {

    public SituacaoDoPlano {
        planos = List.copyOf(planos);
    }
}
