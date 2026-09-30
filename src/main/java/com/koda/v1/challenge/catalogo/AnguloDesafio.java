package com.koda.v1.challenge.catalogo;

import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.challenge.TipoDesafio;

import java.util.List;
import java.util.Objects;

public record AnguloDesafio(
        String id,
        TipoDesafio tipo,
        String nome,
        String instrucao,
        List<String> habilidades,
        RegraDeAlvo regra
) {

    public AnguloDesafio {
        Objects.requireNonNull(id, "O id do ângulo é obrigatório");
        Objects.requireNonNull(tipo, "O tipo do ângulo é obrigatório");
        Objects.requireNonNull(nome, "O nome do ângulo é obrigatório");
        Objects.requireNonNull(instrucao, "A instrução do ângulo é obrigatória");
        Objects.requireNonNull(regra, "A regra de aplicabilidade é obrigatória");
        habilidades = List.copyOf(habilidades);
    }

    public List<AlvoDesafio> alvosEm(ContextoProjeto contexto) {
        return regra.alvos(contexto);
    }
}
