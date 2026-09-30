package com.koda.v1.challenge.persistence;

import com.koda.v1.challenge.NivelDesafio;
import com.koda.v1.challenge.TipoDesafio;
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
@Table(name = "desafios")
public class Desafio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Column(name = "analise_id", nullable = false, updatable = false)
    private UUID analiseId;

    @Column(nullable = false, updatable = false)
    private int numero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false)
    private TipoDesafio tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, updatable = false)
    private NivelDesafio nivel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_geracao", nullable = false)
    private StatusGeracao statusGeracao;

    @Column(name = "angulo_id", nullable = false, updatable = false)
    private String anguloId;

    @Column(name = "alvo_chave", nullable = false, updatable = false)
    private String alvoChave;

    @Column(nullable = false, updatable = false)
    private String perspectiva;

    private String titulo;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String conteudo;

    @Column(name = "versao_esquema_conteudo")
    private Integer versaoEsquemaConteudo;

    private String modelo;

    @Column(nullable = false)
    private int tentativas;

    @Column(name = "mensagem_erro")
    private String mensagemErro;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm;

    @Column(name = "concluido_em")
    private Instant concluidoEm;

    protected Desafio() {
    }

    public Desafio(UUID usuarioId, UUID analiseId, int numero, TipoDesafio tipo,
                   String anguloId, String alvoChave, String perspectiva) {
        this.usuarioId = usuarioId;
        this.analiseId = analiseId;
        this.numero = numero;
        this.tipo = tipo;
        this.nivel = NivelDesafio.JUNIOR;
        this.statusGeracao = StatusGeracao.PENDENTE;
        this.anguloId = anguloId;
        this.alvoChave = alvoChave;
        this.perspectiva = perspectiva;
        this.criadoEm = Instant.now();
        this.atualizadoEm = this.criadoEm;
    }

    public void iniciar() {
        exigirStatus(StatusGeracao.EM_ANDAMENTO, StatusGeracao.PENDENTE);
        this.statusGeracao = StatusGeracao.EM_ANDAMENTO;
    }

    public void registrarTentativa() {
        exigirStatus(StatusGeracao.EM_ANDAMENTO, StatusGeracao.EM_ANDAMENTO);
        this.tentativas++;
    }

    public void concluir(String titulo, String conteudoJson, int versaoEsquemaConteudo, String modelo) {
        if (titulo == null || titulo.isBlank()) {
            throw new IllegalArgumentException("O título do desafio é obrigatório");
        }
        if (conteudoJson == null || conteudoJson.isBlank()) {
            throw new IllegalArgumentException("O conteúdo do desafio é obrigatório");
        }
        if (versaoEsquemaConteudo <= 0) {
            throw new IllegalArgumentException("A versão do esquema do conteúdo deve ser positiva");
        }
        exigirStatus(StatusGeracao.PRONTO, StatusGeracao.EM_ANDAMENTO);
        this.statusGeracao = StatusGeracao.PRONTO;
        this.titulo = titulo;
        this.conteudo = conteudoJson;
        this.versaoEsquemaConteudo = versaoEsquemaConteudo;
        this.modelo = modelo;
        this.mensagemErro = null;
        this.concluidoEm = Instant.now();
    }

    public void falhar(String mensagemErro) {
        exigirStatus(StatusGeracao.FALHOU, StatusGeracao.PENDENTE, StatusGeracao.EM_ANDAMENTO);
        this.statusGeracao = StatusGeracao.FALHOU;
        this.mensagemErro = mensagemErro;
        this.concluidoEm = Instant.now();
    }

    private void exigirStatus(StatusGeracao desejado, StatusGeracao... permitidos) {
        for (StatusGeracao permitido : permitidos) {
            if (this.statusGeracao == permitido) {
                return;
            }
        }
        throw new TransicaoDesafioInvalidaException(this.statusGeracao, desejado);
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

    public UUID getAnaliseId() {
        return analiseId;
    }

    public int getNumero() {
        return numero;
    }

    public TipoDesafio getTipo() {
        return tipo;
    }

    public NivelDesafio getNivel() {
        return nivel;
    }

    public StatusGeracao getStatusGeracao() {
        return statusGeracao;
    }

    public String getAnguloId() {
        return anguloId;
    }

    public String getAlvoChave() {
        return alvoChave;
    }

    public String getPerspectiva() {
        return perspectiva;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getConteudo() {
        return conteudo;
    }

    public Integer getVersaoEsquemaConteudo() {
        return versaoEsquemaConteudo;
    }

    public String getModelo() {
        return modelo;
    }

    public int getTentativas() {
        return tentativas;
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

    public Instant getConcluidoEm() {
        return concluidoEm;
    }
}
