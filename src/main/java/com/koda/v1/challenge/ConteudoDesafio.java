package com.koda.v1.challenge;

import java.util.List;
import java.util.Objects;

public record ConteudoDesafio(
        String titulo,
        String contexto,
        String cenarioAtual,
        String objetivo,
        List<String> regrasDeNegocio,
        List<String> requisitosTecnicos,
        List<String> criteriosDeAceite,
        List<String> testesEsperados,
        List<String> restricoes,
        List<String> habilidades
) {

    public static final int VERSAO_ESQUEMA = 1;

    public ConteudoDesafio {
        Objects.requireNonNull(titulo, "O título é obrigatório");
        Objects.requireNonNull(contexto, "O contexto é obrigatório");
        Objects.requireNonNull(cenarioAtual, "O cenário atual é obrigatório");
        Objects.requireNonNull(objetivo, "O objetivo é obrigatório");
        regrasDeNegocio = List.copyOf(regrasDeNegocio);
        requisitosTecnicos = List.copyOf(requisitosTecnicos);
        criteriosDeAceite = List.copyOf(criteriosDeAceite);
        testesEsperados = List.copyOf(testesEsperados);
        restricoes = List.copyOf(restricoes);
        habilidades = List.copyOf(habilidades);
    }
}
