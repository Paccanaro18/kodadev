package com.koda.v1.analyzer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class IniciadorAnalise {

    private static final Logger LOGGER = LoggerFactory.getLogger(IniciadorAnalise.class);

    private final FilaAnalises fila;
    private final AnalisadorRepositorio analisador;

    public IniciadorAnalise(FilaAnalises fila, AnalisadorRepositorio analisador) {
        this.fila = fila;
        this.analisador = analisador;
    }

    public void disparar(UUID analiseId) {
        fila.enfileirar(() -> executar(analiseId));
    }

    private void executar(UUID analiseId) {
        try {
            analisador.analisar(analiseId);
        } catch (RuntimeException e) {
            LOGGER.error("Falha inesperada ao executar a análise {} ({})",
                    analiseId, e.getClass().getSimpleName());
        }
    }
}
