package com.koda.v1.analyzer;

import com.koda.v1.analyzer.estrutura.ResultadoEstrutura;

import java.util.List;
import java.util.Objects;

public record ArquivosSelecionados(
        ResultadoEstrutura estrutura,
        ArquivoParaAbrir pom,
        ArquivoParaAbrir compose,
        List<ArquivoParaAbrir> controllers,
        List<ArquivoParaAbrir> candidatasEntidade,
        boolean limitesAplicados
) {

    public ArquivosSelecionados {
        Objects.requireNonNull(estrutura, "A estrutura é obrigatória");
        controllers = List.copyOf(controllers);
        candidatasEntidade = List.copyOf(candidatasEntidade);
    }
}
