package com.koda.v1.analyzer.detector;

import java.util.List;
import java.util.Set;

public record ResultadoPom(
        String versaoJava,
        String versaoSpringBoot,
        List<String> dependencias,
        Set<Tecnologia> tecnologias
) {

    public ResultadoPom {
        dependencias = List.copyOf(dependencias);
        tecnologias = Set.copyOf(tecnologias);
    }

    public boolean ehSpringBoot() {
        return versaoSpringBoot != null
                || dependencias.stream().anyMatch(d -> d.startsWith("org.springframework.boot:spring-boot-starter"));
    }
}