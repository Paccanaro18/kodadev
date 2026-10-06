package com.koda.v1.seguranca;

public enum Dificuldade {
    FACIL(100),
    MEDIO(200),
    DIFICIL(300);

    private final int pontos;

    Dificuldade(int pontos) {
        this.pontos = pontos;
    }

    public int pontos() {
        return pontos;
    }
}
