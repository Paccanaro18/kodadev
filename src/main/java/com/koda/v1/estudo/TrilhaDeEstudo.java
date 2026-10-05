package com.koda.v1.estudo;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public record TrilhaDeEstudo(List<String> licoes, Map<String, Double> notas, List<String> desafios) {

    public TrilhaDeEstudo {
        licoes = licoes == null ? List.of() : licoes.stream().filter(Objects::nonNull).toList();
        desafios = desafios == null ? List.of() : desafios.stream().filter(Objects::nonNull).toList();
        Map<String, Double> semNulos = new LinkedHashMap<>();
        if (notas != null) {
            notas.forEach((item, nota) -> {
                if (item != null && nota != null) {
                    semNulos.put(item, nota);
                }
            });
        }
        notas = Collections.unmodifiableMap(semNulos);
    }
}
