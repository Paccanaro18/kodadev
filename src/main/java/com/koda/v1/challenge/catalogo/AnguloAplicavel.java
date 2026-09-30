package com.koda.v1.challenge.catalogo;

import java.util.List;

public record AnguloAplicavel(AnguloDesafio angulo, List<AlvoDesafio> alvos) {

    public AnguloAplicavel {
        alvos = List.copyOf(alvos);
    }
}
