package com.koda.v1.analyzer.detector;

import java.util.List;
import java.util.Set;

public record ResultadoCompose(
        List<String> imagens,
        Set<Tecnologia> tecnologias
) {

    public ResultadoCompose {
        imagens = List.copyOf(imagens);
        tecnologias = Set.copyOf(tecnologias);
    }
}