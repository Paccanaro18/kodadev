package com.koda.v1.plano;

import com.koda.v1.analyzer.persistence.ConsultaAnalise;
import com.koda.v1.challenge.persistence.ConsultaDesafio;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SituacaoDoPlanoServiceTest {

    private static final Instant AGORA = Instant.parse("2026-10-08T15:00:00Z");

    @Test
    void deveReunirPlanoUsoDoMesERenovacao() {
        UUID usuarioId = UUID.randomUUID();
        PlanoService planos = mock(PlanoService.class);
        ConsultaDesafio consultaDesafio = mock(ConsultaDesafio.class);
        ConsultaAnalise consultaAnalise = mock(ConsultaAnalise.class);
        CicloMensal ciclo = CicloMensal.contendo(AGORA);
        when(planos.planoDe(usuarioId)).thenReturn(Plano.GRATIS);
        when(consultaDesafio.contarQueGastaramCotaDesde(usuarioId, ciclo.inicio())).thenReturn(2L);
        when(consultaAnalise.contarRepositorios(usuarioId)).thenReturn(1L);
        SituacaoDoPlanoService service = new SituacaoDoPlanoService(
                planos, consultaDesafio, consultaAnalise, Clock.fixed(AGORA, ZoneOffset.UTC));

        SituacaoDoPlano situacao = service.situacaoDe(usuarioId);

        assertThat(situacao).isEqualTo(new SituacaoDoPlano(
                Plano.GRATIS, "Grátis", 3, 2, Instant.parse("2026-11-01T03:00:00Z"), 1, 1,
                List.of(new LimiteDoPlano(Plano.GRATIS, "Grátis", 3, 1), new LimiteDoPlano(Plano.PRO, "Pro", 60, 20))));
    }
}
