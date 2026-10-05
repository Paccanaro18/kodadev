CREATE TABLE progresso_estudo (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id             UUID         NOT NULL REFERENCES usuarios (id),
    trilha                 VARCHAR(60)  NOT NULL,
    item                   VARCHAR(100) NOT NULL,
    licao_lida             BOOLEAN      NOT NULL DEFAULT FALSE,
    licao_lida_em          TIMESTAMP WITH TIME ZONE,
    melhor_nota            DOUBLE PRECISION,
    nota_registrada_em     TIMESTAMP WITH TIME ZONE,
    desafio_declarado      BOOLEAN      NOT NULL DEFAULT FALSE,
    desafio_declarado_em   TIMESTAMP WITH TIME ZONE,
    criado_em              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uq_progresso_estudo_usuario_trilha_item UNIQUE (usuario_id, trilha, item),
    CONSTRAINT ck_progresso_estudo_nota CHECK (melhor_nota IS NULL OR (melhor_nota >= 0 AND melhor_nota <= 1))
);

CREATE INDEX idx_progresso_estudo_usuario ON progresso_estudo (usuario_id);
