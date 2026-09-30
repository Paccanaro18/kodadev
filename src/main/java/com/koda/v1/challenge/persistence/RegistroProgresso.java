package com.koda.v1.challenge.persistence;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.UUID;

/** Muda o progresso de um ticket do próprio usuário e registra o evento na mesma transação. */
@Service
public class RegistroProgresso {

    private final DesafioRepository repository;
    private final EventoDesafioRepository eventos;

    public RegistroProgresso(DesafioRepository repository, EventoDesafioRepository eventos) {
        this.repository = repository;
        this.eventos = eventos;
    }

    @Transactional
    public ProgressoDesafio mudar(UUID usuarioId, UUID desafioId, StatusProgresso desejado) {
        Objects.requireNonNull(desejado, "O status desejado é obrigatório");
        Desafio desafio = repository.buscarParaAtualizar(desafioId, usuarioId)
                .orElseThrow(() -> new DesafioNaoEncontradoException(desafioId));

        if (desafio.getStatusProgresso() != desejado) {
            TipoEvento evento = aplicar(desafio, desejado);
            eventos.save(new EventoDesafio(usuarioId, desafioId, evento));
        }
        return new ProgressoDesafio(desafio.getStatusProgresso(), desafio.getIniciadoEm(), desafio.getFinalizadoEm());
    }

    private TipoEvento aplicar(Desafio desafio, StatusProgresso desejado) {
        StatusProgresso atual = desafio.getStatusProgresso();

        if (desejado == StatusProgresso.EM_ANDAMENTO && atual == StatusProgresso.NAO_INICIADO) {
            desafio.comecar();
            return TipoEvento.PROGRESSO_INICIADO;
        }
        if (desejado == StatusProgresso.EM_ANDAMENTO && atual == StatusProgresso.CONCLUIDO) {
            desafio.reabrir();
            return TipoEvento.PROGRESSO_REABERTO;
        }
        if (desejado == StatusProgresso.CONCLUIDO && atual == StatusProgresso.EM_ANDAMENTO) {
            desafio.finalizar();
            return TipoEvento.PROGRESSO_CONCLUIDO;
        }
        throw new TransicaoProgressoInvalidaException(atual, desejado);
    }
}
