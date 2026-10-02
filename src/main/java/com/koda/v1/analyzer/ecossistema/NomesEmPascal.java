package com.koda.v1.analyzer.ecossistema;

import java.util.Locale;

public final class NomesEmPascal {

    private NomesEmPascal() {
    }

    /** "create-user" e "create_user" viram "CreateUser". Só letras e dígitos sobram. */
    public static String de(String texto) {
        StringBuilder nome = new StringBuilder();
        for (String parte : texto.split("[^A-Za-z0-9]+")) {
            if (!parte.isEmpty()) {
                nome.append(parte.substring(0, 1).toUpperCase(Locale.ROOT)).append(parte.substring(1));
            }
        }
        return nome.toString();
    }
}
