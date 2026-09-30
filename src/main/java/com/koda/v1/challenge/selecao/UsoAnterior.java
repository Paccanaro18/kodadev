package com.koda.v1.challenge.selecao;

import java.util.Objects;

public record UsoAnterior(String anguloId, String alvoChave, boolean mesmaAnalise) {

    public UsoAnterior {
        Objects.requireNonNull(anguloId, "O ângulo é obrigatório");
        Objects.requireNonNull(alvoChave, "A chave do alvo é obrigatória");
    }

    String combinacao() {
        return anguloId + "|" + alvoChave;
    }
}
