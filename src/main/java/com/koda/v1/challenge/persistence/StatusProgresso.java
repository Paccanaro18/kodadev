package com.koda.v1.challenge.persistence;

/** Onde a pessoa está no ticket. É independente do status de geração, e só vale para tickets prontos. */
public enum StatusProgresso {
    NAO_INICIADO,
    EM_ANDAMENTO,
    CONCLUIDO
}
