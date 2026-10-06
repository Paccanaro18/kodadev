package com.koda.v1.seguranca;

import java.util.List;
import java.util.Objects;
import java.util.regex.Pattern;

public record DefinicaoDeDesafio(
        String slug,
        String titulo,
        Categoria categoria,
        Dificuldade dificuldade,
        String resumo,
        List<String> enunciado,
        String formatoDaFlag,
        List<Artefato> artefatos,
        List<String> dicas,
        List<String> solucao,
        String flagHash) {

    private static final Pattern SLUG = Pattern.compile("[a-z0-9]+(-[a-z0-9]+)*");
    private static final Pattern HASH = Pattern.compile("[0-9a-f]{64}");

    public DefinicaoDeDesafio {
        exigirTexto(slug, "O slug é obrigatório");
        if (slug.length() > 80 || !SLUG.matcher(slug).matches()) {
            throw new IllegalArgumentException("Slug inválido: " + slug);
        }
        exigirTexto(titulo, "O título é obrigatório");
        Objects.requireNonNull(categoria, "A categoria é obrigatória");
        Objects.requireNonNull(dificuldade, "A dificuldade é obrigatória");
        exigirTexto(resumo, "O resumo é obrigatório");
        exigirTexto(formatoDaFlag, "O formato da flag é obrigatório");
        enunciado = exigirLista(enunciado, "O enunciado é obrigatório");
        artefatos = exigirLista(artefatos, "Os artefatos são obrigatórios");
        dicas = exigirLista(dicas, "As dicas são obrigatórias");
        solucao = exigirLista(solucao, "A solução é obrigatória");
        if (flagHash == null || !HASH.matcher(flagHash).matches()) {
            throw new IllegalArgumentException("O hash da flag deve ser um SHA-256 em hexadecimal minúsculo");
        }
    }

    public int pontos() {
        return dificuldade.pontos();
    }

    private static void exigirTexto(String valor, String mensagem) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException(mensagem);
        }
    }

    private static <T> List<T> exigirLista(List<T> valor, String mensagem) {
        if (valor == null || valor.isEmpty()) {
            throw new IllegalArgumentException(mensagem);
        }
        return List.copyOf(valor);
    }
}
