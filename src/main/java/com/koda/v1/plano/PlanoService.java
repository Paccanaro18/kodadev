package com.koda.v1.plano;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.UUID;

@Service
public class PlanoService {

    private final AssinaturaRepository repository;
    private final Clock relogio;

    @Autowired
    public PlanoService(AssinaturaRepository repository) {
        this(repository, Clock.systemUTC());
    }

    PlanoService(AssinaturaRepository repository, Clock relogio) {
        this.repository = repository;
        this.relogio = relogio;
    }

    @Transactional(readOnly = true)
    public Plano planoDe(UUID usuarioId) {
        return repository.findById(usuarioId)
                .filter(assinatura -> assinatura.vigenteEm(relogio.instant()))
                .map(Assinatura::getPlano)
                .orElse(Plano.GRATIS);
    }

    public void exigirTicket(UUID usuarioId, long usadosNoMes, CicloMensal ciclo) {
        Plano plano = planoDe(usuarioId);
        if (usadosNoMes >= plano.ticketsPorMes()) {
            throw new CotaMensalExcedidaException(plano, ciclo.fim());
        }
    }

    public void exigirRepositorio(UUID usuarioId, long repositoriosAtuais) {
        Plano plano = planoDe(usuarioId);
        if (repositoriosAtuais >= plano.repositorios()) {
            throw new LimiteDeRepositoriosExcedidoException(plano);
        }
    }
}
