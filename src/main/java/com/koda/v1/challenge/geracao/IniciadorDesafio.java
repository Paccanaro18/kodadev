package com.koda.v1.challenge.geracao;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class IniciadorDesafio {

    private static final Logger LOGGER = LoggerFactory.getLogger(IniciadorDesafio.class);

    private final FilaDesafios fila;
    private final GeradorDesafio gerador;

    public IniciadorDesafio(FilaDesafios fila, GeradorDesafio gerador) {
        this.fila = fila;
        this.gerador = gerador;
    }

    public void disparar(UUID desafioId) {
        fila.enfileirar(() -> executar(desafioId));
    }

    private void executar(UUID desafioId) {
        try {
            gerador.gerar(desafioId);
        } catch (RuntimeException e) {
            LOGGER.error("Falha inesperada ao gerar o desafio {} ({})", desafioId, e.getClass().getSimpleName());
        }
    }
}
