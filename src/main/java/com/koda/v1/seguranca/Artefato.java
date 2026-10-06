package com.koda.v1.seguranca;

public record Artefato(String nome, String linguagem, String conteudo) {

    public Artefato {
        exigir(nome, "O nome do artefato é obrigatório");
        exigir(linguagem, "A linguagem do artefato é obrigatória");
        exigir(conteudo, "O conteúdo do artefato é obrigatório");
    }

    private static void exigir(String valor, String mensagem) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException(mensagem);
        }
    }
}
