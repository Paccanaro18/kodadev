CREATE TABLE assinaturas (
    usuario_id   UUID PRIMARY KEY REFERENCES usuarios (id),
    plano        VARCHAR(20) NOT NULL,
    iniciada_em  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expira_em    TIMESTAMP WITH TIME ZONE,
    CONSTRAINT ck_assinaturas_plano CHECK (plano IN ('GRATIS', 'PRO')),
    CONSTRAINT ck_assinaturas_validade CHECK (expira_em IS NULL OR expira_em > iniciada_em)
);
