package com.koda.v1.seguranca;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "resolucoes_seguranca")
public class ResolucaoDeSeguranca {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Column(name = "desafio_slug", nullable = false, updatable = false)
    private String desafioSlug;

    @Column(nullable = false, updatable = false)
    private int pontos;

    @Column(name = "resolvido_em", nullable = false, updatable = false)
    private Instant resolvidoEm;

    protected ResolucaoDeSeguranca() {
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

    public int getPontos() {
        return pontos;
    }

    public Instant getResolvidoEm() {
        return resolvidoEm;
    }
}
