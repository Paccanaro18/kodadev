package com.koda.v1.challenge.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "eventos_desafio")
public class EventoDesafio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Column(name = "desafio_id", nullable = false, updatable = false)
    private UUID desafioId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false)
    private TipoEvento tipo;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected EventoDesafio() {
    }

    public EventoDesafio(UUID usuarioId, UUID desafioId, TipoEvento tipo) {
        this.usuarioId = Objects.requireNonNull(usuarioId, "O usuário é obrigatório");
        this.desafioId = Objects.requireNonNull(desafioId, "O desafio é obrigatório");
        this.tipo = Objects.requireNonNull(tipo, "O tipo do evento é obrigatório");
        this.criadoEm = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public UUID getDesafioId() {
        return desafioId;
    }

    public TipoEvento getTipo() {
        return tipo;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }
}
