package com.koda.v1.analyzer.contexto;

import java.util.List;

public record TestesContexto(
        int total,
        List<String> servicesSemTeste,
        List<String> controllersSemTeste
) {

    public TestesContexto {
        servicesSemTeste = List.copyOf(servicesSemTeste);
        controllersSemTeste = List.copyOf(controllersSemTeste);
    }
}
