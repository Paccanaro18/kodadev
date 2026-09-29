package com.koda.v1.analyzer.estrutura;

import java.util.List;

public record ResultadoEstrutura(
        boolean temCodigoJava,
        List<String> controllers,
        List<String> services,
        List<String> repositories,
        List<String> entidades,
        List<String> testes
) {

    public ResultadoEstrutura {
        controllers = List.copyOf(controllers);
        services = List.copyOf(services);
        repositories = List.copyOf(repositories);
        entidades = List.copyOf(entidades);
        testes = List.copyOf(testes);
    }
}
