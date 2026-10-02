package com.koda.v1.analyzer.ecossistema.node;

import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.analyzer.ecossistema.Linguagem;

import java.util.List;
import java.util.Set;

public record ResultadoPackageJson(
        Linguagem linguagem,
        String versaoLinguagem,
        String framework,
        String versaoFramework,
        List<String> dependencias,
        Set<Tecnologia> tecnologias
) {

    public ResultadoPackageJson {
        dependencias = List.copyOf(dependencias);
        tecnologias = Set.copyOf(tecnologias);
    }

    public boolean temFramework() {
        return framework != null;
    }
}
