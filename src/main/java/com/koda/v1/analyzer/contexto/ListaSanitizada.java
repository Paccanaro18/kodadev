package com.koda.v1.analyzer.contexto;

import java.util.List;

public record ListaSanitizada(List<String> itens, int descartados, boolean truncada) {

    public ListaSanitizada {
        itens = List.copyOf(itens);
    }
}
