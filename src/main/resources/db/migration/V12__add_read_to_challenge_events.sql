ALTER TABLE eventos_desafio
    ADD COLUMN lida_em TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_eventos_desafio_nao_lidos
    ON eventos_desafio (usuario_id, criado_em DESC)
    WHERE lida_em IS NULL;
