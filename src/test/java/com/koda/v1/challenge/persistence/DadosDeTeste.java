package com.koda.v1.challenge.persistence;

import com.koda.v1.challenge.ConteudoDesafio;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

final class DadosDeTeste {

    private DadosDeTeste() {
    }

    static UUID usuario(JdbcTemplate jdbc) {
        return jdbc.queryForObject(
                "INSERT INTO usuarios (github_id, login) VALUES (?, ?) RETURNING id",
                UUID.class, ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE), "usuario-teste");
    }

    static UUID analise(JdbcTemplate jdbc, UUID usuarioId) {
        UUID repositorioId = jdbc.queryForObject(
                "INSERT INTO repositorios (usuario_id, github_id_repositorio, dono, nome, branch_padrao) "
                        + "VALUES (?, ?, 'artur', 'koda', 'main') RETURNING id",
                UUID.class, usuarioId, ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE));
        return jdbc.queryForObject(
                "INSERT INTO analises_projeto (repositorio_id) VALUES (?) RETURNING id", UUID.class, repositorioId);
    }

    static ConteudoDesafio conteudo(String titulo) {
        return new ConteudoDesafio(
                titulo, "Contexto do módulo.", "Cenário atual do sistema.", "Objetivo do ticket.",
                List.of("Regra 1", "Regra 2"), List.of("Requisito 1", "Requisito 2"),
                List.of("Critério 1", "Critério 2"), List.of("Teste 1"), List.of("Restrição 1"), List.of("Habilidade 1"));
    }
}
