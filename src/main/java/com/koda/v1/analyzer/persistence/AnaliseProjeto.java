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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String contexto;

    @Column(name = "versao_esquema_contexto")
    private Integer versaoEsquemaContexto;

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
        exigirStatus(StatusAnalise.EM_ANDAMENTO, StatusAnalise.PENDENTE);
        this.status = StatusAnalise.EM_ANDAMENTO;
    }

    public void concluir(String resultadoJson) {
        exigirStatus(StatusAnalise.CONCLUIDA, StatusAnalise.EM_ANDAMENTO);
        this.status = StatusAnalise.CONCLUIDA;
        this.resultado = resultadoJson;
        this.mensagemErro = null;
        this.concluidaEm = Instant.now();
    }

    public void concluir(String resultadoJson, String contextoJson, int versaoEsquemaContexto) {
        if (contextoJson == null || contextoJson.isBlank()) {
            throw new IllegalArgumentException("O contexto do projeto é obrigatório");
        }
        if (versaoEsquemaContexto <= 0) {
            throw new IllegalArgumentException("A versão do esquema do contexto deve ser positiva");
        }
        concluir(resultadoJson);
        this.contexto = contextoJson;
        this.versaoEsquemaContexto = versaoEsquemaContexto;
    }

    public void falhar(String mensagemErro) {
        exigirStatus(StatusAnalise.FALHOU, StatusAnalise.PENDENTE, StatusAnalise.EM_ANDAMENTO);
        this.status = StatusAnalise.FALHOU;
        this.mensagemErro = mensagemErro;
        this.concluidaEm = Instant.now();
    }

    private void exigirStatus(StatusAnalise desejado, StatusAnalise... permitidos) {
        for (StatusAnalise permitido : permitidos) {
            if (this.status == permitido) {
                return;
            }
        }
        throw new TransicaoInvalidaException(this.status, desejado);
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

    public String getContexto() {
        return contexto;
    }

    public Integer getVersaoEsquemaContexto() {
        return versaoEsquemaContexto;
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
