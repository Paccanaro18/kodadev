CREATE TABLE analises_projeto (
                                  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  repositorio_id UUID         NOT NULL REFERENCES repositorios (id),
                                  status         VARCHAR(20)  NOT NULL DEFAULT 'PENDENTE',
                                  resultado      JSONB,
                                  mensagem_erro  TEXT,
                                  criado_em      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                  atualizado_em  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                  concluida_em   TIMESTAMP WITH TIME ZONE,
                                  CONSTRAINT ck_analises_projeto_status
                                      CHECK (status IN ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA', 'FALHOU'))
);

CREATE INDEX idx_analises_projeto_repositorio_criado
    ON analises_projeto (repositorio_id, criado_em DESC);