CREATE TABLE repositorios (
                              id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              usuario_id            UUID          NOT NULL REFERENCES usuarios (id),
                              github_id_repositorio BIGINT        NOT NULL,
                              dono                  VARCHAR(255)  NOT NULL,
                              nome                  VARCHAR(255)  NOT NULL,
                              branch_padrao         VARCHAR(255)  NOT NULL,
                              criado_em             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                              atualizado_em         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                              CONSTRAINT uk_repositorios_usuario_github UNIQUE (usuario_id, github_id_repositorio)
);