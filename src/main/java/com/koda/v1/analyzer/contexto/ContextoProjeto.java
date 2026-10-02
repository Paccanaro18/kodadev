package com.koda.v1.analyzer.contexto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.analyzer.ecossistema.Linguagem;

import java.util.List;
import java.util.Objects;

public record ContextoProjeto(
        int versaoEsquema,
        Linguagem linguagem,
        String framework,
        @JsonAlias("versaoJava") String versaoLinguagem,
        @JsonAlias("versaoSpringBoot") String versaoFramework,
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

    public static final int VERSAO_ESQUEMA = 2;

    /** O esquema 1 não tinha linguagem: todo contexto gravado até então é de um projeto Java com Spring Boot. */
    public ContextoProjeto {
        if (linguagem == null) {
            linguagem = Linguagem.JAVA;
            framework = framework == null ? "Spring Boot" : framework;
        }
        Objects.requireNonNull(arquitetura, "A arquitetura é obrigatória");
        Objects.requireNonNull(componentes, "Os componentes são obrigatórios");
        Objects.requireNonNull(testes, "Os testes são obrigatórios");
        Objects.requireNonNull(infra, "A infra é obrigatória");
        dominios = List.copyOf(dominios);
        tecnologias = List.copyOf(tecnologias);
        features = List.copyOf(features);
        endpoints = List.copyOf(endpoints);
    }

    /** Atalho para um projeto Java com Spring Boot. */
    public ContextoProjeto(int versaoEsquema, String versaoJava, String versaoSpringBoot, String ferramentaDeBuild,
                           Arquitetura arquitetura, List<String> dominios, List<Tecnologia> tecnologias,
                           List<String> features, List<EndpointContexto> endpoints, ComponentesContexto componentes,
                           TestesContexto testes, InfraContexto infra, boolean parcial, boolean truncado,
                           int itensDescartados) {
        this(versaoEsquema, Linguagem.JAVA, "Spring Boot", versaoJava, versaoSpringBoot, ferramentaDeBuild,
                arquitetura, dominios, tecnologias, features, endpoints, componentes, testes, infra,
                parcial, truncado, itensDescartados);
    }
}
