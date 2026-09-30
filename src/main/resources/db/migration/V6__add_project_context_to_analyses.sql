ALTER TABLE analises_projeto
    ADD COLUMN contexto JSONB,
    ADD COLUMN versao_esquema_contexto INTEGER;

ALTER TABLE analises_projeto
    ADD CONSTRAINT ck_analises_projeto_contexto
        CHECK ((contexto IS NULL AND versao_esquema_contexto IS NULL)
            OR (contexto IS NOT NULL AND versao_esquema_contexto > 0));
