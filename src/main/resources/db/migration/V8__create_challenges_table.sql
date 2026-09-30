CREATE TABLE desafios (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id              UUID         NOT NULL REFERENCES usuarios (id),
    analise_id              UUID         NOT NULL REFERENCES analises_projeto (id),
    numero                  INTEGER      NOT NULL,
    tipo                    VARCHAR(20)  NOT NULL,
    nivel                   VARCHAR(20)  NOT NULL DEFAULT 'JUNIOR',
    status_geracao          VARCHAR(20)  NOT NULL DEFAULT 'PENDENTE',
    angulo_id               VARCHAR(80)  NOT NULL,
    alvo_chave              VARCHAR(200) NOT NULL,
    perspectiva             VARCHAR(200) NOT NULL,
    titulo                  VARCHAR(120),
    conteudo                JSONB,
    versao_esquema_conteudo INTEGER,
    modelo                  VARCHAR(80),
    tentativas              INTEGER      NOT NULL DEFAULT 0,
    mensagem_erro           TEXT,
    criado_em               TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    concluido_em            TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uk_desafios_usuario_numero UNIQUE (usuario_id, numero),
    CONSTRAINT ck_desafios_numero CHECK (numero > 0),
    CONSTRAINT ck_desafios_tentativas CHECK (tentativas >= 0),
    CONSTRAINT ck_desafios_tipo CHECK (tipo IN ('FEATURE', 'BUG', 'TESTING')),
    CONSTRAINT ck_desafios_nivel CHECK (nivel IN ('JUNIOR')),
    CONSTRAINT ck_desafios_status_geracao
        CHECK (status_geracao IN ('PENDENTE', 'EM_ANDAMENTO', 'PRONTO', 'FALHOU')),
    CONSTRAINT ck_desafios_conteudo
        CHECK ((conteudo IS NULL AND versao_esquema_conteudo IS NULL)
            OR (conteudo IS NOT NULL
                AND versao_esquema_conteudo IS NOT NULL
                AND versao_esquema_conteudo > 0)),
    CONSTRAINT ck_desafios_pronto_com_conteudo
        CHECK (status_geracao <> 'PRONTO' OR conteudo IS NOT NULL)
);

CREATE UNIQUE INDEX ux_desafios_usuario_em_aberto
    ON desafios (usuario_id)
    WHERE status_geracao IN ('PENDENTE', 'EM_ANDAMENTO');

CREATE INDEX idx_desafios_usuario_criado
    ON desafios (usuario_id, criado_em DESC);

CREATE INDEX idx_desafios_analise
    ON desafios (analise_id);
