package com.koda.v1.analyzer.ecossistema;

public enum Linguagem {
    JAVA("Java"),
    TYPESCRIPT("TypeScript"),
    JAVASCRIPT("JavaScript"),
    PYTHON("Python");

    private final String rotulo;

    Linguagem(String rotulo) {
        this.rotulo = rotulo;
    }

    public String rotulo() {
        return rotulo;
    }
}
