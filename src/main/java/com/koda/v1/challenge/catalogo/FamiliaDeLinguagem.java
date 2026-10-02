package com.koda.v1.challenge.catalogo;

import com.koda.v1.analyzer.ecossistema.Linguagem;

/** TypeScript e JavaScript são escritos do mesmo jeito nos tickets: formam uma família só. */
public enum FamiliaDeLinguagem {
    JAVA,
    NODE,
    PYTHON;

    public static FamiliaDeLinguagem de(Linguagem linguagem) {
        return switch (linguagem) {
            case JAVA -> JAVA;
            case TYPESCRIPT, JAVASCRIPT -> NODE;
            case PYTHON -> PYTHON;
        };
    }
}
