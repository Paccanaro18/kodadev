CREATE TABLE resolucoes_seguranca (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id     UUID         NOT NULL REFERENCES usuarios (id),
    desafio_slug   VARCHAR(80)  NOT NULL,
    pontos         INTEGER      NOT NULL CHECK (pontos > 0),
    resolvido_em   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uq_resolucoes_seguranca_usuario_desafio UNIQUE (usuario_id, desafio_slug)
);

CREATE INDEX idx_resolucoes_seguranca_usuario ON resolucoes_seguranca (usuario_id);

CREATE TABLE tentativas_seguranca (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id     UUID         NOT NULL REFERENCES usuarios (id),
    desafio_slug   VARCHAR(80)  NOT NULL,
    correta        BOOLEAN      NOT NULL,
    criado_em      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_tentativas_seguranca_usuario_criado ON tentativas_seguranca (usuario_id, criado_em DESC);
