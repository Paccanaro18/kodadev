package com.koda.v1.challenge.persistence;

/** Coisas que acontecem com um ticket. Alimentam o histórico, as atividades da home e as notificações. */
public enum TipoEvento {
    DESAFIO_PRONTO,
    DESAFIO_FALHOU,
    PROGRESSO_INICIADO,
    PROGRESSO_CONCLUIDO,
    PROGRESSO_REABERTO,
    DICA_USADA
}
