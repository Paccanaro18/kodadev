package com.koda.v1.challenge.persistence;

import com.koda.v1.challenge.NivelDesafio;
import com.koda.v1.challenge.TipoDesafio;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DesafioTest {

    private Desafio novo() {
        return new Desafio(UUID.randomUUID(), UUID.randomUUID(), 1, TipoDesafio.FEATURE,
                "FEATURE_PAGINACAO", "ENDPOINT:GET /pedidos", "a equipe financeira");
    }

    @Test
    void deveNascerPendenteComNivelJuniorESemTentativas() {
        Desafio desafio = novo();

        assertThat(desafio.getStatusGeracao()).isEqualTo(StatusGeracao.PENDENTE);
        assertThat(desafio.getNivel()).isEqualTo(NivelDesafio.JUNIOR);
        assertThat(desafio.getTentativas()).isZero();
        assertThat(desafio.getCriadoEm()).isNotNull();
        assertThat(desafio.getConteudo()).isNull();
    }

    @Test
    void deveSeguirOCaminhoPendenteEmAndamentoPronto() {
        Desafio desafio = novo();

        desafio.iniciar();
        desafio.registrarTentativa();
        desafio.registrarTentativa();
        desafio.concluir("Título", "{}", 1, "modelo-x");

        assertThat(desafio.getStatusGeracao()).isEqualTo(StatusGeracao.PRONTO);
        assertThat(desafio.getTentativas()).isEqualTo(2);
        assertThat(desafio.getTitulo()).isEqualTo("Título");
        assertThat(desafio.getConteudo()).isEqualTo("{}");
        assertThat(desafio.getVersaoEsquemaConteudo()).isEqualTo(1);
        assertThat(desafio.getModelo()).isEqualTo("modelo-x");
        assertThat(desafio.getConcluidoEm()).isNotNull();
    }

    @Test
    void devePermitirFalharTantoPendenteQuantoEmAndamento() {
        Desafio pendente = novo();
        Desafio emAndamento = novo();
        emAndamento.iniciar();

        pendente.falhar("fila cheia");
        emAndamento.falhar("IA indisponível");

        assertThat(pendente.getStatusGeracao()).isEqualTo(StatusGeracao.FALHOU);
        assertThat(emAndamento.getMensagemErro()).isEqualTo("IA indisponível");
        assertThat(emAndamento.getConteudo()).isNull();
    }

    @Test
    void naoDeveIniciarConcluirNemTentarForaDaOrdem() {
        Desafio pendente = novo();
        Desafio emAndamento = novo();
        emAndamento.iniciar();

        assertThatThrownBy(() -> pendente.concluir("T", "{}", 1, null)).isInstanceOf(TransicaoDesafioInvalidaException.class);
        assertThatThrownBy(pendente::registrarTentativa).isInstanceOf(TransicaoDesafioInvalidaException.class);
        assertThatThrownBy(emAndamento::iniciar).isInstanceOf(TransicaoDesafioInvalidaException.class);
    }

    @Test
    void naoDeveMudarDepoisDeProntoOuFalhado() {
        Desafio pronto = novo();
        pronto.iniciar();
        pronto.concluir("T", "{}", 1, null);
        Desafio falhado = novo();
        falhado.falhar("erro");

        assertThatThrownBy(() -> pronto.falhar("x")).isInstanceOf(TransicaoDesafioInvalidaException.class);
        assertThatThrownBy(pronto::iniciar).isInstanceOf(TransicaoDesafioInvalidaException.class);
        assertThatThrownBy(() -> falhado.concluir("T", "{}", 1, null)).isInstanceOf(TransicaoDesafioInvalidaException.class);
        assertThatThrownBy(falhado::iniciar).isInstanceOf(TransicaoDesafioInvalidaException.class);
    }

    @Test
    void deveReselecionarAnguloAlvoEPerspectivaSoEmAndamento() {
        Desafio desafio = novo();

        assertThatThrownBy(() -> desafio.reselecionar("OUTRO", "CLASSE:B", "outra"))
                .isInstanceOf(TransicaoDesafioInvalidaException.class);

        desafio.iniciar();
        desafio.reselecionar("OUTRO", "CLASSE:B", "outra");

        assertThat(desafio.getAnguloId()).isEqualTo("OUTRO");
        assertThat(desafio.getAlvoChave()).isEqualTo("CLASSE:B");
        assertThat(desafio.getPerspectiva()).isEqualTo("outra");
        desafio.concluir("T", "{}", 1, null);
        assertThatThrownBy(() -> desafio.reselecionar("X", "Y", "Z")).isInstanceOf(TransicaoDesafioInvalidaException.class);
    }

    @Test
    void naoDeveReselecionarComValoresVaziosENemAlterarONada() {
        Desafio desafio = novo();
        desafio.iniciar();

        assertThatThrownBy(() -> desafio.reselecionar(null, "CLASSE:B", "p")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> desafio.reselecionar("A", " ", "p")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> desafio.reselecionar("A", "CLASSE:B", "")).isInstanceOf(IllegalArgumentException.class);

        assertThat(desafio.getAnguloId()).isEqualTo("FEATURE_PAGINACAO");
    }

    @Test
    void naoDeveConcluirComTituloConteudoOuVersaoInvalidosENemMudarOEstado() {
        Desafio desafio = novo();
        desafio.iniciar();

        assertThatThrownBy(() -> desafio.concluir(null, "{}", 1, null)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> desafio.concluir("  ", "{}", 1, null)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> desafio.concluir("T", null, 1, null)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> desafio.concluir("T", " ", 1, null)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> desafio.concluir("T", "{}", 0, null)).isInstanceOf(IllegalArgumentException.class);

        assertThat(desafio.getStatusGeracao()).isEqualTo(StatusGeracao.EM_ANDAMENTO);
        assertThat(desafio.getConteudo()).isNull();
    }
}
