CREATE TABLE usuarios (
                          id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          github_id      BIGINT       NOT NULL UNIQUE,
                          login          VARCHAR(100) NOT NULL,
                          nome           VARCHAR(255),
                          avatar_url     VARCHAR(500),
                          criado_em      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                          atualizado_em  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);