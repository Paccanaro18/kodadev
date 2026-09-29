CREATE TABLE conexoes_github (
                                 id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                 usuario_id          UUID          NOT NULL UNIQUE REFERENCES usuarios (id),
                                 token_criptografado TEXT          NOT NULL,
                                 escopos             VARCHAR(255)  NOT NULL DEFAULT '',
                                 criado_em           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                 atualizado_em       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);