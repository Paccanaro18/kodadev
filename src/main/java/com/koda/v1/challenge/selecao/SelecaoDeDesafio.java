package com.koda.v1.challenge.selecao;

import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.catalogo.AlvoDesafio;
import com.koda.v1.challenge.catalogo.AnguloDesafio;

import java.util.Objects;

public record SelecaoDeDesafio(AnguloDesafio angulo, AlvoDesafio alvo) {

    public SelecaoDeDesafio {
        Objects.requireNonNull(angulo, "O ângulo é obrigatório");
        Objects.requireNonNull(alvo, "O alvo é obrigatório");
    }

    public TipoDesafio tipo() {
        return angulo.tipo();
    }
}
