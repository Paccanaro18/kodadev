package com.koda.v1.seguranca;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "tentativas_seguranca")
public class TentativaDeSeguranca {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Column(name = "desafio_slug", nullable = false, updatable = false)
    private String desafioSlug;

    @Column(nullable = false, updatable = false)
    private boolean correta;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected TentativaDeSeguranca() {
    }

    public TentativaDeSeguranca(UUID usuarioId, String desafioSlug, boolean correta) {
        this.usuarioId = Objects.requireNonNull(usuarioId, "O usuário é obrigatório");
        this.desafioSlug = Objects.requireNonNull(desafioSlug, "O desafio é obrigatório");
        this.correta = correta;
        this.criadoEm = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public String getDesafioSlug() {
        return desafioSlug;
    }

    public boolean isCorreta() {
        return correta;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }
}
