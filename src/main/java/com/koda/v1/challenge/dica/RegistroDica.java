package com.koda.v1.challenge.dica;

import com.koda.v1.challenge.persistence.EventoDesafio;
import com.koda.v1.challenge.persistence.EventoDesafioRepository;
import com.koda.v1.challenge.persistence.TipoEvento;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/** Grava a dica e o evento "dica usada" na mesma transação. */
@Service
public class RegistroDica {

    private final DicaRepository dicas;
    private final EventoDesafioRepository eventos;

    public RegistroDica(DicaRepository dicas, EventoDesafioRepository eventos) {
        this.dicas = dicas;
        this.eventos = eventos;
    }

    @Transactional
    public Dica registrar(UUID usuarioId, UUID desafioId, int nivel, String texto, String modelo) {
        Dica dica = dicas.saveAndFlush(new Dica(usuarioId, desafioId, nivel, texto, modelo));
        eventos.save(new EventoDesafio(usuarioId, desafioId, TipoEvento.DICA_USADA));
        return dica;
    }
}
