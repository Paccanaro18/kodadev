package com.koda.v1.estudo;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public record EstadoDeEstudo(Map<String, TrilhaDeEstudo> trilhas) {

    public EstadoDeEstudo {
        Map<String, TrilhaDeEstudo> semNulos = new LinkedHashMap<>();
        if (trilhas != null) {
            trilhas.forEach((slug, trilha) -> {
                if (slug != null && trilha != null) {
                    semNulos.put(slug, trilha);
                }
            });
        }
        trilhas = Collections.unmodifiableMap(semNulos);
    }
}
