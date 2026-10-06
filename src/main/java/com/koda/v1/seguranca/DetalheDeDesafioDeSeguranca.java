package com.koda.v1.seguranca;

import java.util.List;

public record DetalheDeDesafioDeSeguranca(
        String slug,
        String titulo,
        Categoria categoria,
        Dificuldade dificuldade,
        int pontos,
        String resumo,
        List<String> enunciado,
        String formatoDaFlag,
        List<Artefato> artefatos,
        List<String> dicas,
        boolean resolvido,
        List<String> solucao) {

    static DetalheDeDesafioDeSeguranca de(DefinicaoDeDesafio desafio, boolean resolvido) {
        return new DetalheDeDesafioDeSeguranca(
                desafio.slug(), desafio.titulo(), desafio.categoria(), desafio.dificuldade(), desafio.pontos(),
                desafio.resumo(), desafio.enunciado(), desafio.formatoDaFlag(), desafio.artefatos(), desafio.dicas(),
                resolvido, resolvido ? desafio.solucao() : null);
    }
}
