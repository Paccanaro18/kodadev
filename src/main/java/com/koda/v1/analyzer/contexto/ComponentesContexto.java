package com.koda.v1.analyzer.contexto;

import java.util.List;

public record ComponentesContexto(
        List<String> controllers,
        List<String> services,
        List<String> repositories,
        List<String> entidades,
        List<String> dtos,
        List<String> excecoes,
        boolean temTratadorDeErros
) {

    public ComponentesContexto {
        controllers = List.copyOf(controllers);
        services = List.copyOf(services);
        repositories = List.copyOf(repositories);
        entidades = List.copyOf(entidades);
        dtos = List.copyOf(dtos);
        excecoes = List.copyOf(excecoes);
    }
}
