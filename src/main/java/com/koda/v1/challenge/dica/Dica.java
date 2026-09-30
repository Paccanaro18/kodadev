package com.koda.v1.challenge.dica;

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
@Table(name = "dicas_desafio")
public class Dica {

    public static final int NIVEL_MINIMO = 1;
    public static final int NIVEL_MAXIMO = 3;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private UUID usuarioId;

    @Column(name = "desafio_id", nullable = false, updatable = false)
    private UUID desafioId;

    @Column(nullable = false, updatable = false)
    private int nivel;

    @Column(nullable = false, updatable = false)
    private String texto;

    @Column(updatable = false)
    private String modelo;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm;

    protected Dica() {
    }

    public Dica(UUID usuarioId, UUID desafioId, int nivel, String texto, String modelo) {
        if (nivel < NIVEL_MINIMO || nivel > NIVEL_MAXIMO) {
            throw new IllegalArgumentException("O nível da dica deve ficar entre 1 e 3");
        }
        if (texto == null || texto.isBlank()) {
            throw new IllegalArgumentException("O texto da dica é obrigatório");
        }
        this.usuarioId = Objects.requireNonNull(usuarioId, "O usuário é obrigatório");
        this.desafioId = Objects.requireNonNull(desafioId, "O desafio é obrigatório");
        this.nivel = nivel;
        this.texto = texto;
        this.modelo = modelo;
        this.criadoEm = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public UUID getDesafioId() {
        return desafioId;
    }

    public int getNivel() {
        return nivel;
    }

    public String getTexto() {
        return texto;
    }

    public String getModelo() {
        return modelo;
    }

    public Instant getCriadoEm() {
        return criadoEm;
    }
}
