ALTER TABLE desafios
    ADD COLUMN status_progresso VARCHAR(20) NOT NULL DEFAULT 'NAO_INICIADO',
    ADD COLUMN iniciado_em      TIMESTAMP WITH TIME ZONE,
    ADD COLUMN finalizado_em    TIMESTAMP WITH TIME ZONE;

ALTER TABLE desafios
    ADD CONSTRAINT ck_desafios_status_progresso
        CHECK (status_progresso IN ('NAO_INICIADO', 'EM_ANDAMENTO', 'CONCLUIDO')),
    ADD CONSTRAINT ck_desafios_progresso_datas
        CHECK ((status_progresso = 'NAO_INICIADO' AND iniciado_em IS NULL AND finalizado_em IS NULL)
            OR (status_progresso = 'EM_ANDAMENTO' AND iniciado_em IS NOT NULL AND finalizado_em IS NULL)
            OR (status_progresso = 'CONCLUIDO' AND iniciado_em IS NOT NULL AND finalizado_em IS NOT NULL)),
    ADD CONSTRAINT ck_desafios_progresso_so_se_pronto
        CHECK (status_progresso = 'NAO_INICIADO' OR status_geracao = 'PRONTO');

CREATE INDEX idx_desafios_usuario_progresso
    ON desafios (usuario_id, status_progresso);
