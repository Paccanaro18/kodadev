package com.koda.v1.challenge.ia;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MetricasDeIaTest {

    private final SimpleMeterRegistry registro = new SimpleMeterRegistry();
    private final MetricasDeIa metricas = new MetricasDeIa(registro);

    @Test
    void deveSomarGeracoesPorOrigemEResultado() {
        metricas.geracao(MetricasDeIa.ORIGEM_DESAFIO, true);
        metricas.geracao(MetricasDeIa.ORIGEM_DESAFIO, true);
        metricas.geracao(MetricasDeIa.ORIGEM_DESAFIO, false);
        metricas.geracao(MetricasDeIa.ORIGEM_DICA, true);

        assertThat(registro.get("koda.ia.geracoes").tag("origem", "desafio").tag("resultado", "pronto").counter().count()).isEqualTo(2);
        assertThat(registro.get("koda.ia.geracoes").tag("origem", "desafio").tag("resultado", "falhou").counter().count()).isEqualTo(1);
        assertThat(registro.get("koda.ia.geracoes").tag("origem", "dica").tag("resultado", "pronto").counter().count()).isEqualTo(1);
    }

    @Test
    void deveSomarTentativasDescartadasEReprovacoesPorMotivo() {
        metricas.tentativaDescartada("desafio", "MUITO_PARECIDO");
        metricas.tentativaDescartada("desafio", "MUITO_PARECIDO");
        metricas.reprovacaoDoValidador("dica", "SOLUCAO_ENTREGUE");

        assertThat(registro.get("koda.ia.tentativas.descartadas").tag("motivo", "MUITO_PARECIDO").counter().count()).isEqualTo(2);
        assertThat(registro.get("koda.ia.validador.reprovacoes").tag("origem", "dica").counter().count()).isEqualTo(1);
    }

    @Test
    void deveMedirAChamadaEDevolverOResultado() {
        String devolvido = metricas.medirChamada("desafio", () -> "resposta");

        assertThat(devolvido).isEqualTo("resposta");
        assertThat(registro.get("koda.ia.chamadas").tag("resultado", "ok").timer().count()).isEqualTo(1);
    }

    @Test
    void deveMedirAChamadaQueFalhaEPropagarOErroSemMudarEle() {
        IllegalStateException erro = new IllegalStateException("falhou");

        assertThatThrownBy(() -> metricas.medirChamada("dica", () -> { throw erro; })).isSameAs(erro);

        assertThat(registro.get("koda.ia.chamadas").tag("origem", "dica").tag("resultado", "erro").timer().count()).isEqualTo(1);
        assertThat(registro.find("koda.ia.chamadas").tag("resultado", "ok").timer()).isNull();
    }
}
