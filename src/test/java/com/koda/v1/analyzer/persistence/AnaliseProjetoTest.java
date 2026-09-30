package com.koda.v1.analyzer.persistence;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AnaliseProjetoTest {

    private AnaliseProjeto nova() {
        return new AnaliseProjeto(UUID.randomUUID());
    }

    @Test
    void deveSeguirOCaminhoPendenteEmAndamentoConcluida() {
        AnaliseProjeto analise = nova();

        analise.iniciar();
        analise.concluir("{}");

        assertThat(analise.getStatus()).isEqualTo(StatusAnalise.CONCLUIDA);
        assertThat(analise.getConcluidaEm()).isNotNull();
        assertThat(analise.getResultado()).isEqualTo("{}");
    }

    @Test
    void devePermitirFalharTantoPendenteQuantoEmAndamento() {
        AnaliseProjeto pendente = nova();
        AnaliseProjeto emAndamento = nova();
        emAndamento.iniciar();

        pendente.falhar("motivo");
        emAndamento.falhar("outro motivo");

        assertThat(pendente.getStatus()).isEqualTo(StatusAnalise.FALHOU);
        assertThat(emAndamento.getStatus()).isEqualTo(StatusAnalise.FALHOU);
        assertThat(emAndamento.getMensagemErro()).isEqualTo("outro motivo");
    }

    @Test
    void naoDeveIniciarDuasVezes() {
        AnaliseProjeto analise = nova();
        analise.iniciar();

        assertThatThrownBy(analise::iniciar).isInstanceOf(TransicaoInvalidaException.class);
    }

    @Test
    void naoDeveConcluirAnalisePendente() {
        assertThatThrownBy(() -> nova().concluir("{}")).isInstanceOf(TransicaoInvalidaException.class);
    }

    @Test
    void naoDeveMudarDepoisDeConcluidaOuFalhada() {
        AnaliseProjeto concluida = nova();
        concluida.iniciar();
        concluida.concluir("{}");
        AnaliseProjeto falhada = nova();
        falhada.falhar("erro");

        assertThatThrownBy(() -> concluida.falhar("x")).isInstanceOf(TransicaoInvalidaException.class);
        assertThatThrownBy(concluida::iniciar).isInstanceOf(TransicaoInvalidaException.class);
        assertThatThrownBy(() -> falhada.concluir("{}")).isInstanceOf(TransicaoInvalidaException.class);
        assertThatThrownBy(falhada::iniciar).isInstanceOf(TransicaoInvalidaException.class);
    }
}
