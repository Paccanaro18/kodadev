package com.koda.v1.user;


import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "usuarios")
public class Usuario {


    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID ID;


    @Column(name = "github_id", nullable = false, unique = true)
    private Long githubId;


    @Column(nullable = false)
    private String login;

    private String nome;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    protected Usuario() {
    }

    public Usuario(Long githubId, String login, String nome, String avatarUrl) {
        this.githubId = githubId;
        this.login = login;
        this.nome = nome;
        this.avatarUrl = avatarUrl;
        this.criadoEm = OffsetDateTime.now();
        this.atualizadoEm = this.criadoEm;
    }

    public void atualizarPerfil(String login, String nome, String avatarUrl) {
        this.login = login;
        this.nome = nome;
        this.avatarUrl = avatarUrl;
        this.atualizadoEm = OffsetDateTime.now();
    }

    public UUID getID() {
        return ID;
    }

    public Long getGithubId() {
        return githubId;
    }

    public String getLogin() {
        return login;
    }

    public String getNome() {
        return nome;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }

    public OffsetDateTime getAtualizadoEm() {
        return atualizadoEm;
    }
}
