package com.koda.v1.github;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "conexoes_github")
public class ConexaoGithub {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, unique = true)
    private UUID usuarioId;

    @Column(name = "token_criptografado", nullable = false)
    private String tokenCriptografado;

    @Column(nullable = false)
    private String escopos;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    protected ConexaoGithub() {
    }

    public ConexaoGithub(UUID usuarioId, String tokenCriptografado, String escopos) {
        this.usuarioId = usuarioId;
        this.tokenCriptografado = tokenCriptografado;
        this.escopos = escopos;
        this.criadoEm = OffsetDateTime.now();
        this.atualizadoEm = this.criadoEm;
    }

    public void atualizarToken(String tokenCriptografado, String escopos) {
        this.tokenCriptografado = tokenCriptografado;
        this.escopos = escopos;
        this.atualizadoEm = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getUsuarioId() { return usuarioId; }
    public String getTokenCriptografado() { return tokenCriptografado; }
    public String getEscopos() { return escopos; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public OffsetDateTime getAtualizadoEm() { return atualizadoEm; }
}