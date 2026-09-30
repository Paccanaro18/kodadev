package com.koda.v1.challenge;

import org.junit.jupiter.api.Test;
import tools.jackson.core.JacksonException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SerializadorConteudoTest {

    private final SerializadorConteudo serializador = new SerializadorConteudo();

    @Test
    void deveSerializarEVoltarSemPerderNada() {
        ConteudoDesafio original = new ConteudoDesafio(
                "Título", "Contexto", "Cenário", "Objetivo",
                List.of("R1", "R2"), List.of("Q1", "Q2"), List.of("C1", "C2"),
                List.of("T1"), List.of("X1"), List.of("H1", "H2"));

        ConteudoDesafio lido = serializador.deJson(serializador.paraJson(original));

        assertThat(lido).isEqualTo(original);
    }

    @Test
    void deveEscreverOsNomesDeCamposDoEsquema() {
        String json = serializador.paraJson(new ConteudoDesafio(
                "T", "C", "S", "O", List.of("a", "b"), List.of("a", "b"), List.of("a", "b"),
                List.of("a"), List.of("a"), List.of("a")));

        assertThat(json).contains("\"titulo\"", "\"cenarioAtual\"", "\"criteriosDeAceite\"", "\"habilidades\"");
    }

    @Test
    void deveRecusarJsonInvalidoOuIncompleto() {
        assertThatThrownBy(() -> serializador.deJson("isso não é json")).isInstanceOf(JacksonException.class);
        assertThatThrownBy(() -> serializador.deJson("{}")).isInstanceOf(JacksonException.class);
    }
}
