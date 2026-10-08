package com.koda.v1.plano;

import com.koda.v1.analyzer.persistence.ConsultaAnalise;
import com.koda.v1.challenge.persistence.ConsultaDesafio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.util.Arrays;
import java.util.UUID;

@Service
public class SituacaoDoPlanoService {

    private final PlanoService planos;
    private final ConsultaDesafio consultaDesafio;
    private final ConsultaAnalise consultaAnalise;
    private final Clock relogio;

    @Autowired
    public SituacaoDoPlanoService(PlanoService planos, ConsultaDesafio consultaDesafio, ConsultaAnalise consultaAnalise) {
        this(planos, consultaDesafio, consultaAnalise, Clock.systemUTC());
    }

    SituacaoDoPlanoService(PlanoService planos, ConsultaDesafio consultaDesafio, ConsultaAnalise consultaAnalise, Clock relogio) {
        this.planos = planos;
        this.consultaDesafio = consultaDesafio;
        this.consultaAnalise = consultaAnalise;
        this.relogio = relogio;
    }

    public SituacaoDoPlano situacaoDe(UUID usuarioId) {
        Plano plano = planos.planoDe(usuarioId);
        CicloMensal ciclo = CicloMensal.contendo(relogio.instant());

        return new SituacaoDoPlano(
                plano,
                plano.nome(),
                plano.ticketsPorMes(),
                consultaDesafio.contarQueGastaramCotaDesde(usuarioId, ciclo.inicio()),
                ciclo.fim(),
                plano.repositorios(),
                consultaAnalise.contarRepositorios(usuarioId),
                Arrays.stream(Plano.values()).map(LimiteDoPlano::de).toList());
    }
}
