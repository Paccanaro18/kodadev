package com.koda.v1.analyzer;

import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.detector.Tecnologia;

import java.util.List;

public record ResultadoAnalise(
        boolean temCodigoJava,
        boolean springBoot,
        String versaoJava,
        String versaoSpringBoot,
        List<String> dependencias,
        List<Tecnologia> tecnologias,
        List<String> imagensDocker,
        List<String> controllers,
        List<String> services,
        List<String> repositories,
        List<String> entidades,
        List<String> testes,
        List<Endpoint> endpoints
) {

    public ResultadoAnalise {
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
}
