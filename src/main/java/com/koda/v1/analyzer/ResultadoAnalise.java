package com.koda.v1.analyzer;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.analyzer.ecossistema.Linguagem;

import java.util.List;

public record ResultadoAnalise(
        Linguagem linguagem,
        String framework,
        @JsonAlias("temCodigoJava") boolean temCodigo,
        @JsonAlias("versaoJava") String versaoLinguagem,
        @JsonAlias("versaoSpringBoot") String versaoFramework,
        String ferramentaDeBuild,
        List<String> dependencias,
        List<Tecnologia> tecnologias,
        List<String> imagensDocker,
        List<String> controllers,
        List<String> services,
        List<String> repositories,
        List<String> entidades,
        List<String> testes,
        List<Endpoint> endpoints,
        boolean parcial
) {

    public static final String FRAMEWORK_JAVA = "Spring Boot";
    public static final String BUILD_JAVA = "maven";

    /** Análises gravadas antes do suporte a outras linguagens não têm estes campos: eram sempre Java com Spring Boot. */
    public ResultadoAnalise {
        if (linguagem == null) {
            linguagem = Linguagem.JAVA;
            framework = framework == null ? FRAMEWORK_JAVA : framework;
            ferramentaDeBuild = ferramentaDeBuild == null ? BUILD_JAVA : ferramentaDeBuild;
        }
        dependencias = List.copyOf(dependencias);
        tecnologias = List.copyOf(tecnologias);
        imagensDocker = List.copyOf(imagensDocker);
        controllers = List.copyOf(controllers);
        services = List.copyOf(services);
        repositories = List.copyOf(repositories);
        entidades = List.copyOf(entidades);
        testes = List.copyOf(testes);
        endpoints = List.copyOf(endpoints);
    }

    /** Atalho para um projeto Java com Spring Boot (o único caso antes do suporte a outras linguagens). */
    public ResultadoAnalise(boolean temCodigoJava, boolean springBoot, String versaoJava, String versaoSpringBoot,
                            List<String> dependencias, List<Tecnologia> tecnologias, List<String> imagensDocker,
                            List<String> controllers, List<String> services, List<String> repositories,
                            List<String> entidades, List<String> testes, List<Endpoint> endpoints, boolean parcial) {
        this(Linguagem.JAVA, springBoot ? FRAMEWORK_JAVA : null, temCodigoJava, versaoJava, versaoSpringBoot,
                BUILD_JAVA, dependencias, tecnologias, imagensDocker, controllers, services, repositories,
                entidades, testes, endpoints, parcial);
    }
}
