ALTER TABLE repositorios ADD COLUMN arquivado_em TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_repositorios_usuario_ativos ON repositorios (usuario_id) WHERE arquivado_em IS NULL;
