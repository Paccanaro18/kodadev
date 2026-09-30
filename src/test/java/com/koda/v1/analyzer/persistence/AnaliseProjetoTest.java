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
        analise.concluir("{}", "{}", 1);

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
        assertThatThrownBy(() -> nova().concluir("{}", "{}", 1)).isInstanceOf(TransicaoInvalidaException.class);
    }

    @Test
    void naoDeveMudarDepoisDeConcluidaOuFalhada() {
        AnaliseProjeto concluida = nova();
        concluida.iniciar();
        concluida.concluir("{}", "{}", 1);
        AnaliseProjeto falhada = nova();
        falhada.falhar("erro");

        assertThatThrownBy(() -> concluida.falhar("x")).isInstanceOf(TransicaoInvalidaException.class);
        assertThatThrownBy(concluida::iniciar).isInstanceOf(TransicaoInvalidaException.class);
        assertThatThrownBy(() -> falhada.concluir("{}", "{}", 1)).isInstanceOf(TransicaoInvalidaException.class);
        assertThatThrownBy(falhada::iniciar).isInstanceOf(TransicaoInvalidaException.class);
    }

    @Test
    void deveConcluirGuardandoOContextoEASuaVersao() {
        AnaliseProjeto analise = nova();
        analise.iniciar();

        analise.concluir("{\"a\":1}", "{\"versaoEsquema\":1}", 1);

        assertThat(analise.getStatus()).isEqualTo(StatusAnalise.CONCLUIDA);
        assertThat(analise.getResultado()).isEqualTo("{\"a\":1}");
        assertThat(analise.getContexto()).isEqualTo("{\"versaoEsquema\":1}");
        assertThat(analise.getVersaoEsquemaContexto()).isEqualTo(1);
    }

    @Test
    void naoDeveConcluirComContextoOuVersaoInvalidosENemMudarOStatus() {
        AnaliseProjeto analise = nova();
        analise.iniciar();

        assertThatThrownBy(() -> analise.concluir("{}", null, 1)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> analise.concluir("{}", "  ", 1)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> analise.concluir("{}", "{}", 0)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> analise.concluir("{}", "{}", -1)).isInstanceOf(IllegalArgumentException.class);

        assertThat(analise.getStatus()).isEqualTo(StatusAnalise.EM_ANDAMENTO);
        assertThat(analise.getContexto()).isNull();
    }

    @Test
    void naoDeveGuardarContextoQuandoATransicaoForInvalida() {
        AnaliseProjeto pendente = nova();

        assertThatThrownBy(() -> pendente.concluir("{}", "{}", 1)).isInstanceOf(TransicaoInvalidaException.class);

        assertThat(pendente.getContexto()).isNull();
        assertThat(pendente.getVersaoEsquemaContexto()).isNull();
    }
}
