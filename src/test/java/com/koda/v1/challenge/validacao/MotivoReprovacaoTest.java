package com.koda.v1.challenge.validacao;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MotivoReprovacaoTest {

    @Test
    void todoMotivoTemUmaOrientacaoFixaEEscritaComoFrase() {
        for (MotivoReprovacao motivo : MotivoReprovacao.values()) {
            assertThat(motivo.orientacao()).as(motivo.name()).isNotBlank().endsWith(".");
        }
    }

    @Test
    void asOrientacoesSaoTodasDiferentesEnaoCarregamMarcacaoDePrompt() {
        var orientacoes = java.util.Arrays.stream(MotivoReprovacao.values()).map(MotivoReprovacao::orientacao).toList();

        assertThat(orientacoes).doesNotHaveDuplicates();
        assertThat(orientacoes).allSatisfy(texto -> assertThat(texto).doesNotContain("<").doesNotContain(">"));
    }
}
