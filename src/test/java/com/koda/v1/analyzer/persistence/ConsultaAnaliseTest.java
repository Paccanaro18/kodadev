package com.koda.v1.analyzer.persistence;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ConsultaAnaliseTest {

    @Autowired
    private ConsultaAnalise consulta;

    @Autowired
    private RepositorioGithubRepository repositorioRepository;

    @Autowired
    private AnaliseProjetoRepository analiseRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void deveDevolverADaAnaliseParaODonoDoRepositorio() {
        UUID dono = criarUsuario();
        UUID analiseId = criarAnalise(dono);

        AnaliseDetalhe detalhe = consulta.buscarDoUsuario(dono, analiseId);

        assertThat(detalhe.id()).isEqualTo(analiseId);
        assertThat(detalhe.status()).isEqualTo(StatusAnalise.PENDENTE);
        assertThat(detalhe.dono()).isEqualTo("artur");
        assertThat(detalhe.nome()).isEqualTo("koda");
        assertThat(detalhe.resultadoJson()).isNull();
        assertThat(detalhe.criadoEm()).isNotNull();
    }

    @Test
    void naoDeveDevolverAAnaliseDeOutroUsuarioComoSeNaoExistisse() {
        UUID dono = criarUsuario();
        UUID outro = criarUsuario();
        UUID analiseId = criarAnalise(dono);

        assertThatThrownBy(() -> consulta.buscarDoUsuario(outro, analiseId))
                .isInstanceOf(AnaliseNaoEncontradaException.class);
    }

    @Test
    void deveRecusarAnaliseInexistente() {
        assertThatThrownBy(() -> consulta.buscarDoUsuario(criarUsuario(), UUID.randomUUID()))
                .isInstanceOf(AnaliseNaoEncontradaException.class);
    }

    private UUID criarAnalise(UUID usuarioId) {
        RepositorioGithub repositorio = repositorioRepository.saveAndFlush(new RepositorioGithub(
                usuarioId, ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE), "artur", "koda", "main"));
        return analiseRepository.saveAndFlush(new AnaliseProjeto(repositorio.getId())).getId();
    }

    private UUID criarUsuario() {
        return jdbcTemplate.queryForObject(
                "INSERT INTO usuarios (github_id, login) VALUES (?, ?) RETURNING id",
                UUID.class, ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE), "usuario-teste");
    }
}
