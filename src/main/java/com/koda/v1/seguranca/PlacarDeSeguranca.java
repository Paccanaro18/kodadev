package com.koda.v1.seguranca;

import java.util.List;

public record PlacarDeSeguranca(List<PosicaoNoPlacar> melhores, PosicaoNoPlacar voce) {

    public PlacarDeSeguranca {
        melhores = List.copyOf(melhores);
    }
}
