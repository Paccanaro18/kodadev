package com.koda.v1.analyzer.ecossistema.python;

import com.koda.v1.analyzer.detector.Tecnologia;

import java.util.List;
import java.util.Set;

public record ResultadoPython(
        String versaoLinguagem,
        String framework,
        String versaoFramework,
        List<String> dependencias,
        Set<Tecnologia> tecnologias
) {

    public ResultadoPython {
        dependencias = List.copyOf(dependencias);
        tecnologias = Set.copyOf(tecnologias);
    }

    public boolean temFramework() {
        return framework != null;
    }
}
