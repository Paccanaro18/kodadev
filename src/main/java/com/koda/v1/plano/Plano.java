package com.koda.v1.plano;

public enum Plano {

    GRATIS("Grátis", 3, 1),
    PRO("Pro", 60, 20);

    private final String nome;
    private final int ticketsPorMes;
    private final int repositorios;

    Plano(String nome, int ticketsPorMes, int repositorios) {
        this.nome = nome;
        this.ticketsPorMes = ticketsPorMes;
        this.repositorios = repositorios;
    }

    public String nome() {
        return nome;
    }

    public int ticketsPorMes() {
        return ticketsPorMes;
    }

    public int repositorios() {
        return repositorios;
    }
}
