package com.koda.v1.challenge.catalogo;

import java.util.List;

/**
 * O que muda num ângulo quando o projeto não é Java. Nome, instrução e regra em branco herdam os do ângulo original.
 */
public record Variante(String nome, String instrucao, List<String> habilidades, RegraDeAlvo regra) {

    public Variante {
        habilidades = List.copyOf(habilidades);
    }

    public static Variante habilidades(String... habilidades) {
        return new Variante(null, null, List.of(habilidades), null);
    }

    public static Variante completa(String nome, String instrucao, RegraDeAlvo regra, String... habilidades) {
        return new Variante(nome, instrucao, List.of(habilidades), regra);
    }

    public static Variante comRegra(RegraDeAlvo regra, String... habilidades) {
        return new Variante(null, null, List.of(habilidades), regra);
    }
}
