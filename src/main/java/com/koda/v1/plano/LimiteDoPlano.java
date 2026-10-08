package com.koda.v1.plano;

public record LimiteDoPlano(Plano plano, String nome, int ticketsPorMes, int repositorios) {

    static LimiteDoPlano de(Plano plano) {
        return new LimiteDoPlano(plano, plano.nome(), plano.ticketsPorMes(), plano.repositorios());
    }
}
