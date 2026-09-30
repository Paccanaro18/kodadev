package com.koda.v1.analyzer.contexto;

import com.koda.v1.analyzer.detector.Tecnologia;

import java.util.List;
import java.util.Objects;

public record ContextoProjeto(
        int versaoEsquema,
        String versaoJava,
        String versaoSpringBoot,
        String ferramentaDeBuild,
        Arquitetura arquitetura,
        List<String> dominios,
        List<Tecnologia> tecnologias,
        List<String> features,
        List<EndpointContexto> endpoints,
        ComponentesContexto componentes,
        TestesContexto testes,
        InfraContexto infra,
        boolean parcial,
        boolean truncado,
        int itensDescartados
) {

    public static final int VERSAO_ESQUEMA = 1;

    public ContextoProjeto {
        Objects.requireNonNull(arquitetura, "A arquitetura é obrigatória");
        Objects.requireNonNull(componentes, "Os componentes são obrigatórios");
        Objects.requireNonNull(testes, "Os testes são obrigatórios");
        Objects.requireNonNull(infra, "A infra é obrigatória");
        dominios = List.copyOf(dominios);
        tecnologias = List.copyOf(tecnologias);
        features = List.copyOf(features);
        endpoints = List.copyOf(endpoints);
    }
}
