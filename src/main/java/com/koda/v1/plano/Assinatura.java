package com.koda.v1.plano;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "assinaturas")
public class Assinatura {

    @Id
    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Plano plano;

    @Column(name = "iniciada_em", nullable = false, updatable = false)
    private Instant iniciadaEm;

    @Column(name = "expira_em")
    private Instant expiraEm;

    protected Assinatura() {
    }

    public Assinatura(UUID usuarioId, Plano plano, Instant iniciadaEm, Instant expiraEm) {
        this.usuarioId = Objects.requireNonNull(usuarioId, "O usuário é obrigatório");
        this.plano = Objects.requireNonNull(plano, "O plano é obrigatório");
        this.iniciadaEm = Objects.requireNonNull(iniciadaEm, "O início é obrigatório");
        this.expiraEm = expiraEm;
    }

    public boolean vigenteEm(Instant momento) {
        return !momento.isBefore(iniciadaEm) && (expiraEm == null || momento.isBefore(expiraEm));
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public Plano getPlano() {
        return plano;
    }

    public Instant getIniciadaEm() {
        return iniciadaEm;
    }

    public Instant getExpiraEm() {
        return expiraEm;
    }
}
