package com.koda.v1.plano;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class CicloMensalTest {

    @Test
    void deveIniciarNoPrimeiroDiaDoMesEmSaoPauloEAcabarNoPrimeiroDiaDoSeguinte() {
        CicloMensal ciclo = CicloMensal.contendo(Instant.parse("2026-10-08T15:30:00Z"));

        assertThat(ciclo.inicio()).isEqualTo(Instant.parse("2026-10-01T03:00:00Z"));
        assertThat(ciclo.fim()).isEqualTo(Instant.parse("2026-11-01T03:00:00Z"));
    }

    @Test
    void deveUsarOMesDeSaoPauloQuandoOUtcJaViraOuAindaNaoVirou() {
        CicloMensal aindaOutubroEmSaoPaulo = CicloMensal.contendo(Instant.parse("2026-11-01T02:59:59Z"));
        CicloMensal jaNovembroEmSaoPaulo = CicloMensal.contendo(Instant.parse("2026-11-01T03:00:00Z"));

        assertThat(aindaOutubroEmSaoPaulo.inicio()).isEqualTo(Instant.parse("2026-10-01T03:00:00Z"));
        assertThat(jaNovembroEmSaoPaulo.inicio()).isEqualTo(Instant.parse("2026-11-01T03:00:00Z"));
    }

    @Test
    void deveIncluirOInicioEExcluirOFim() {
        CicloMensal ciclo = CicloMensal.contendo(Instant.parse("2026-10-01T03:00:00Z"));

        assertThat(ciclo.inicio()).isEqualTo(Instant.parse("2026-10-01T03:00:00Z"));
        assertThat(CicloMensal.contendo(ciclo.fim()).inicio()).isEqualTo(ciclo.fim());
    }

    @Test
    void deveVirarOAnoEmDezembro() {
        CicloMensal ciclo = CicloMensal.contendo(Instant.parse("2026-12-20T12:00:00Z"));

        assertThat(ciclo.inicio()).isEqualTo(Instant.parse("2026-12-01T03:00:00Z"));
        assertThat(ciclo.fim()).isEqualTo(Instant.parse("2027-01-01T03:00:00Z"));
    }

    @Test
    void deveTratarFevereiroDeAnoBissexto() {
        CicloMensal ciclo = CicloMensal.contendo(Instant.parse("2028-02-29T12:00:00Z"));

        assertThat(ciclo.inicio()).isEqualTo(Instant.parse("2028-02-01T03:00:00Z"));
        assertThat(ciclo.fim()).isEqualTo(Instant.parse("2028-03-01T03:00:00Z"));
    }
}
