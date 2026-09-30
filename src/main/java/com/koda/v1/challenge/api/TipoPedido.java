package com.koda.v1.challenge.api;

import com.koda.v1.challenge.TipoDesafio;

public enum TipoPedido {
    FEATURE(TipoDesafio.FEATURE),
    BUG(TipoDesafio.BUG),
    TESTING(TipoDesafio.TESTING),
    ALEATORIO(null);

    private final TipoDesafio tipo;

    TipoPedido(TipoDesafio tipo) {
        this.tipo = tipo;
    }

    public TipoDesafio tipo() {
        return tipo;
    }
}
