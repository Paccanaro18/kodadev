package com.koda.v1.seguranca;

public record ResumoDeDesafioDeSeguranca(
        String slug,
        String titulo,
        Categoria categoria,
        Dificuldade dificuldade,
        int pontos,
        String resumo,
        boolean resolvido) {

    static ResumoDeDesafioDeSeguranca de(DefinicaoDeDesafio desafio, boolean resolvido) {
        return new ResumoDeDesafioDeSeguranca(
                desafio.slug(), desafio.titulo(), desafio.categoria(), desafio.dificuldade(),
                desafio.pontos(), desafio.resumo(), resolvido);
    }
}
