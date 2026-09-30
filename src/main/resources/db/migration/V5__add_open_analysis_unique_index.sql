CREATE UNIQUE INDEX ux_analises_projeto_repositorio_em_aberto
    ON analises_projeto (repositorio_id)
    WHERE status IN ('PENDENTE', 'EM_ANDAMENTO');
