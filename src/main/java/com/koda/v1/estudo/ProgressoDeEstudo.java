package com.koda.v1.estudo;

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
@Table(name = "progresso_estudo")
public class ProgressoDeEstudo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Column(nullable = false, updatable = false)
    private String trilha;

    @Column(nullable = false, updatable = false)
    private String item;

    @Column(name = "licao_lida", nullable = false)
    private boolean licaoLida;

    @Column(name = "licao_lida_em")
    private Instant licaoLidaEm;

    @Column(name = "melhor_nota")
    private Double melhorNota;

    @Column(name = "nota_registrada_em")
    private Instant notaRegistradaEm;

    @Column(name = "desafio_declarado", nullable = false)
    private boolean desafioDeclarado;

    @Column(name = "desafio_declarado_em")
    private Instant desafioDeclaradoEm;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    protected ProgressoDeEstudo() {
    }

    public ProgressoDeEstudo(UUID usuarioId, String trilha, String item) {
        this.usuarioId = Objects.requireNonNull(usuarioId, "O usuário é obrigatório");
        this.trilha = Objects.requireNonNull(trilha, "A trilha é obrigatória");
        this.item = Objects.requireNonNull(item, "O item é obrigatório");
        this.criadoEm = Instant.now();
        this.atualizadoEm = this.criadoEm;
    }

    public void marcarLicao(boolean lida) {
        if (lida == licaoLida) {
            return;
        }
        this.licaoLida = lida;
        this.licaoLidaEm = lida ? Instant.now() : null;
        this.atualizadoEm = Instant.now();
    }

    public void registrarNota(double nota) {
        if (melhorNota != null && nota <= melhorNota) {
            return;
        }
        this.melhorNota = nota;
        this.notaRegistradaEm = Instant.now();
        this.atualizadoEm = this.notaRegistradaEm;
    }

    public void declararDesafio(boolean declarado) {
        if (declarado == desafioDeclarado) {
            return;
        }
        this.desafioDeclarado = declarado;
        this.desafioDeclaradoEm = declarado ? Instant.now() : null;
        this.atualizadoEm = Instant.now();
    }

    public boolean vazio() {
        return !licaoLida && melhorNota == null && !desafioDeclarado;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public String getTrilha() {
        return trilha;
    }

    public String getItem() {
        return item;
    }

    public boolean isLicaoLida() {
        return licaoLida;
    }

    public Instant getLicaoLidaEm() {
        return licaoLidaEm;
    }

    public Double getMelhorNota() {
        return melhorNota;
    }

    public Instant getNotaRegistradaEm() {
        return notaRegistradaEm;
    }

    public boolean isDesafioDeclarado() {
        return desafioDeclarado;
    }

    public Instant getDesafioDeclaradoEm() {
        return desafioDeclaradoEm;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }
}
