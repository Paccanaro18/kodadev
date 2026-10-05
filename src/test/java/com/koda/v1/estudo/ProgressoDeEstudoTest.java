package com.koda.v1.estudo;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProgressoDeEstudoTest {

    private final ProgressoDeEstudo registro = new ProgressoDeEstudo(UUID.randomUUID(), "java", "primeiros-passos");

    @Test
    void deveNascerVazio() {
        assertThat(registro.vazio()).isTrue();
        assertThat(registro.isLicaoLida()).isFalse();
        assertThat(registro.getMelhorNota()).isNull();
        assertThat(registro.isDesafioDeclarado()).isFalse();
    }

    @Test
    void deveExigirUsuarioTrilhaEItem() {
        assertThatThrownBy(() -> new ProgressoDeEstudo(null, "java", "x")).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new ProgressoDeEstudo(UUID.randomUUID(), null, "x")).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new ProgressoDeEstudo(UUID.randomUUID(), "java", null)).isInstanceOf(NullPointerException.class);
    }

    @Test
    void deveMarcarELiberarALicaoGuardandoQuando() {
        registro.marcarLicao(true);
        assertThat(registro.isLicaoLida()).isTrue();
        assertThat(registro.getLicaoLidaEm()).isNotNull();
        assertThat(registro.vazio()).isFalse();

        registro.marcarLicao(false);
        assertThat(registro.isLicaoLida()).isFalse();
        assertThat(registro.getLicaoLidaEm()).isNull();
    }

    @Test
    void naoDeveMudarOMomentoQuandoALicaoJaEstavaMarcada() throws InterruptedException {
        registro.marcarLicao(true);
        var primeiraVez = registro.getLicaoLidaEm();
        Thread.sleep(5);

        registro.marcarLicao(true);

        assertThat(registro.getLicaoLidaEm()).isEqualTo(primeiraVez);
    }

    @Test
    void deveGuardarSoAMelhorNota() {
        registro.registrarNota(0.6);
        var primeiroMomento = registro.getNotaRegistradaEm();
        registro.registrarNota(0.4);
        registro.registrarNota(0.6);

        assertThat(registro.getMelhorNota()).isEqualTo(0.6);
        assertThat(registro.getNotaRegistradaEm()).isEqualTo(primeiroMomento);

        registro.registrarNota(0.9);
        assertThat(registro.getMelhorNota()).isEqualTo(0.9);
        assertThat(registro.vazio()).isFalse();
    }

    @Test
    void deveAceitarNotaZeroComoPrimeiroRegistro() {
        registro.registrarNota(0.0);

        assertThat(registro.getMelhorNota()).isEqualTo(0.0);
        assertThat(registro.vazio()).isFalse();
    }

    @Test
    void deveDeclararEDesfazerODesafio() {
        registro.declararDesafio(true);
        assertThat(registro.isDesafioDeclarado()).isTrue();
        assertThat(registro.getDesafioDeclaradoEm()).isNotNull();
        assertThat(registro.vazio()).isFalse();

        registro.declararDesafio(true);
        registro.declararDesafio(false);
        assertThat(registro.isDesafioDeclarado()).isFalse();
        assertThat(registro.getDesafioDeclaradoEm()).isNull();
    }

    @Test
    void deveExporOsDadosDeIdentificacao() {
        assertThat(registro.getTrilha()).isEqualTo("java");
        assertThat(registro.getItem()).isEqualTo("primeiros-passos");
        assertThat(registro.getUsuarioId()).isNotNull();
        assertThat(registro.getCriadoEm()).isNotNull();
        assertThat(registro.getAtualizadoEm()).isNotNull();
        assertThat(registro.getId()).isNull();
    }
}
