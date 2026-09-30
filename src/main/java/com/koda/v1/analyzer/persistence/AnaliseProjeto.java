package com.koda.v1.analyzer.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "analises_projeto")
public class AnaliseProjeto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "repositorio_id", nullable = false, updatable = false)
    private UUID repositorioId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusAnalise status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String resultado;

    @Column(name = "mensagem_erro")
    private String mensagemErro;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @Column(name = "concluida_em")
    private Instant concluidaEm;

    protected AnaliseProjeto() {
    }

    public AnaliseProjeto(UUID repositorioId) {
        this.repositorioId = repositorioId;
        this.status = StatusAnalise.PENDENTE;
        this.criadoEm = Instant.now();
        this.atualizadoEm = this.criadoEm;
    }

    public void iniciar() {
        this.status = StatusAnalise.EM_ANDAMENTO;
    }

    public void concluir(String resultadoJson) {
        this.status = StatusAnalise.CONCLUIDA;
        this.resultado = resultadoJson;
        this.mensagemErro = null;
        this.concluidaEm = Instant.now();
    }

    public void falhar(String mensagemErro) {
        this.status = StatusAnalise.FALHOU;
        this.mensagemErro = mensagemErro;
        this.concluidaEm = Instant.now();
    }

    @PreUpdate
    void aoAtualizar() {
        this.atualizadoEm = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getRepositorioId() {
        return repositorioId;
    }

    public StatusAnalise getStatus() {
        return status;
    }

    public String getResultado() {
        return resultado;
    }

    public String getMensagemErro() {
        return mensagemErro;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }

    public Instant getAtualizadoEm() {
        return atualizadoEm;
    }

    public Instant getConcluidaEm() {
        return concluidaEm;
    }
}
