package com.koda.v1.challenge.catalogo;

import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.ecossistema.Linguagem;
import com.koda.v1.challenge.TipoDesafio;

import java.util.List;
import java.util.Map;
import java.util.Objects;

public record AnguloDesafio(
        String id,
        TipoDesafio tipo,
        String nome,
        String instrucao,
        List<String> habilidades,
        RegraDeAlvo regra,
        Map<FamiliaDeLinguagem, Variante> variantes
) {

    public AnguloDesafio {
        Objects.requireNonNull(id, "O id do ângulo é obrigatório");
        Objects.requireNonNull(tipo, "O tipo do ângulo é obrigatório");
        Objects.requireNonNull(nome, "O nome do ângulo é obrigatório");
        Objects.requireNonNull(instrucao, "A instrução do ângulo é obrigatória");
        Objects.requireNonNull(regra, "A regra de aplicabilidade é obrigatória");
        habilidades = List.copyOf(habilidades);
        variantes = Map.copyOf(variantes);
    }

    /** Um ângulo escrito para Java, sem variantes: as outras linguagens herdam o texto e a regra. */
    public AnguloDesafio(String id, TipoDesafio tipo, String nome, String instrucao,
                         List<String> habilidades, RegraDeAlvo regra) {
        this(id, tipo, nome, instrucao, habilidades, regra, Map.of());
    }

    public AnguloDesafio comVariantes(Map<FamiliaDeLinguagem, Variante> novas) {
        return new AnguloDesafio(id, tipo, nome, instrucao, habilidades, regra, novas);
    }

    public List<AlvoDesafio> alvosEm(ContextoProjeto contexto) {
        return para(contexto.linguagem()).regra.alvos(contexto);
    }

    /** O mesmo ângulo, com nome, instrução, habilidades e regra da linguagem do projeto. */
    public AnguloDesafio para(Linguagem linguagem) {
        FamiliaDeLinguagem familia = FamiliaDeLinguagem.de(linguagem);
        Variante variante = variantes.get(familia);
        if (familia == FamiliaDeLinguagem.JAVA || variante == null) {
            return this;
        }
        return new AnguloDesafio(
                id,
                tipo,
                variante.nome() != null ? variante.nome() : nome,
                variante.instrucao() != null ? variante.instrucao() : instrucao,
                variante.habilidades().isEmpty() ? habilidades : variante.habilidades(),
                variante.regra() != null ? variante.regra() : regra,
                variantes);
    }
}
