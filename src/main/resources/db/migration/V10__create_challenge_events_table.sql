CREATE TABLE eventos_desafio (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID        NOT NULL REFERENCES usuarios (id),
    desafio_id  UUID        NOT NULL REFERENCES desafios (id),
    tipo        VARCHAR(30) NOT NULL,
    criado_em   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT ck_eventos_desafio_tipo
        CHECK (tipo IN ('DESAFIO_PRONTO', 'DESAFIO_FALHOU', 'PROGRESSO_INICIADO',
                        'PROGRESSO_CONCLUIDO', 'PROGRESSO_REABERTO', 'DICA_USADA'))
);

CREATE INDEX idx_eventos_desafio_usuario_criado
    ON eventos_desafio (usuario_id, criado_em DESC);

CREATE INDEX idx_eventos_desafio_desafio
    ON eventos_desafio (desafio_id, criado_em);
