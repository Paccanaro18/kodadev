CREATE TABLE dicas_desafio (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID         NOT NULL REFERENCES usuarios (id),
    desafio_id  UUID         NOT NULL REFERENCES desafios (id),
    nivel       INTEGER      NOT NULL,
    texto       VARCHAR(600) NOT NULL,
    modelo      VARCHAR(80),
    criado_em   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uk_dicas_desafio_nivel UNIQUE (desafio_id, nivel),
    CONSTRAINT ck_dicas_desafio_nivel CHECK (nivel BETWEEN 1 AND 3),
    CONSTRAINT ck_dicas_desafio_texto CHECK (length(btrim(texto)) > 0)
);

CREATE INDEX idx_dicas_desafio_usuario_criado
    ON dicas_desafio (usuario_id, criado_em DESC);
