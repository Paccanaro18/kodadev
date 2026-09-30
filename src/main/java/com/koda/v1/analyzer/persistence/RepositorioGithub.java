package com.koda.v1.analyzer.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "repositorios")
public class RepositorioGithub {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Column(name = "github_id_repositorio", nullable = false, updatable = false)
    private Long githubIdRepositorio;

    @Column(nullable = false)
    private String dono;

    @Column(nullable = false)
    private String nome;

    @Column(name = "branch_padrao", nullable = false)
    private String branchPadrao;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    protected RepositorioGithub() {
    }

    public RepositorioGithub(UUID usuarioId, Long githubIdRepositorio,
                             String dono, String nome, String branchPadrao) {
        this.usuarioId = usuarioId;
        this.githubIdRepositorio = githubIdRepositorio;
        this.dono = dono;
        this.nome = nome;
        this.branchPadrao = branchPadrao;
        this.criadoEm = Instant.now();
        this.atualizadoEm = this.criadoEm;
    }

    public void atualizarDados(String dono, String nome, String branchPadrao) {
        this.dono = dono;
        this.nome = nome;
        this.branchPadrao = branchPadrao;
    }

    @PreUpdate
    void aoAtualizar() {
        this.atualizadoEm = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public Long getGithubIdRepositorio() {
        return githubIdRepositorio;
    }

    public String getDono() {
        return dono;
    }

    public String getNome() {
        return nome;
    }

    public String getBranchPadrao() {
        return branchPadrao;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }
}