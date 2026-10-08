package com.koda.v1.analyzer.persistence;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ArquivamentoDeRepositorioTest {

    private static final long GITHUB_ID_DO_REPOSITORIO = 4242L;

    @Autowired
    private RegistroAnalise registro;

    @Autowired
    private ConsultaAnalise consulta;

    @Autowired
    private RepositorioGithubRepository repositorioRepository;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager entityManager;

    @Test
    void deveArquivarUmRepositorioSemApagarAAnalise() {
        UUID usuarioId = criarUsuario();
        UUID analiseId = analiseTerminada(usuarioId);

        registro.arquivarRepositorio(usuarioId, analiseId);
        entityManager.flush();
        entityManager.clear();

        assertThat(consulta.repositorioArquivado(usuarioId, analiseId)).isTrue();
        assertThat(consulta.buscarDoUsuario(usuarioId, analiseId).id()).isEqualTo(analiseId);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM analises_projeto WHERE id = ?", Integer.class, analiseId)).isEqualTo(1);
    }

    @Test
    void naoDeveContarNemListarRepositorioArquivado() {
        UUID usuarioId = criarUsuario();
        UUID analiseId = analiseTerminada(usuarioId);
        assertThat(consulta.contarRepositorios(usuarioId)).isEqualTo(1);
        assertThat(consulta.repositorioRegistrado(usuarioId, GITHUB_ID_DO_REPOSITORIO)).isTrue();
        assertThat(consulta.listarUltimasDoUsuario(usuarioId)).hasSize(1);

        registro.arquivarRepositorio(usuarioId, analiseId);
        entityManager.flush();
        entityManager.clear();

        assertThat(consulta.contarRepositorios(usuarioId)).isZero();
        assertThat(consulta.repositorioRegistrado(usuarioId, GITHUB_ID_DO_REPOSITORIO)).isFalse();
        assertThat(consulta.listarUltimasDoUsuario(usuarioId)).isEmpty();
    }

    @Test
    void deveLiberarAVagaParaOutroRepositorio() {
        UUID usuarioId = criarUsuario();
        UUID primeira = analiseTerminada(usuarioId);
        registro.arquivarRepositorio(usuarioId, primeira);
        entityManager.flush();

        registro.registrarNovaAnalise(usuarioId, GITHUB_ID_DO_REPOSITORIO + 1, "artur", "outro", "main");
        entityManager.flush();
        entityManager.clear();

        assertThat(consulta.contarRepositorios(usuarioId)).isEqualTo(1);
        assertThat(repositorioRepository.count()).isGreaterThanOrEqualTo(2);
    }

    @Test
    void deveReativarOMesmoRepositorioAoConectarDeNovoMantendoOHistorico() {
        UUID usuarioId = criarUsuario();
        UUID antiga = analiseTerminada(usuarioId);
        registro.arquivarRepositorio(usuarioId, antiga);
        entityManager.flush();

        UUID nova = registro.registrarNovaAnalise(usuarioId, GITHUB_ID_DO_REPOSITORIO, "artur", "koda", "main");
        entityManager.flush();
        entityManager.clear();

        assertThat(consulta.repositorioArquivado(usuarioId, nova)).isFalse();
        assertThat(consulta.repositorioArquivado(usuarioId, antiga)).isFalse();
        assertThat(consulta.contarRepositorios(usuarioId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM repositorios WHERE usuario_id = ?", Integer.class, usuarioId)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM analises_projeto a JOIN repositorios r ON r.id = a.repositorio_id WHERE r.usuario_id = ?", Integer.class, usuarioId)).isEqualTo(2);
    }

    @Test
    void naoDeveArquivarEnquantoHouverAnaliseEmAberto() {
        UUID usuarioId = criarUsuario();
        UUID analiseId = registro.registrarNovaAnalise(usuarioId, GITHUB_ID_DO_REPOSITORIO, "artur", "koda", "main");

        assertThatThrownBy(() -> registro.arquivarRepositorio(usuarioId, analiseId))
                .isInstanceOf(AnaliseEmAndamentoException.class);
        assertThat(consulta.repositorioArquivado(usuarioId, analiseId)).isFalse();
    }

    @Test
    void naoDeveArquivarRepositorioDeOutraPessoaNemAnaliseInexistente() {
        UUID dono = criarUsuario();
        UUID intruso = criarUsuario();
        UUID analiseId = analiseTerminada(dono);

        assertThatThrownBy(() -> registro.arquivarRepositorio(intruso, analiseId))
                .isInstanceOf(AnaliseNaoEncontradaException.class);
        assertThatThrownBy(() -> registro.arquivarRepositorio(dono, UUID.randomUUID()))
                .isInstanceOf(AnaliseNaoEncontradaException.class);
        assertThatThrownBy(() -> consulta.repositorioArquivado(intruso, analiseId))
                .isInstanceOf(AnaliseNaoEncontradaException.class);
        assertThat(consulta.repositorioArquivado(dono, analiseId)).isFalse();
    }

    @Test
    void arquivarDeNovoNaoDeveMudarADataDoArquivamento() {
        UUID usuarioId = criarUsuario();
        UUID analiseId = analiseTerminada(usuarioId);
        registro.arquivarRepositorio(usuarioId, analiseId);
        entityManager.flush();
        Instant primeira = jdbc.queryForObject("SELECT arquivado_em FROM repositorios WHERE usuario_id = ?", java.sql.Timestamp.class, usuarioId).toInstant();

        registro.arquivarRepositorio(usuarioId, analiseId);
        entityManager.flush();

        Instant depois = jdbc.queryForObject("SELECT arquivado_em FROM repositorios WHERE usuario_id = ?", java.sql.Timestamp.class, usuarioId).toInstant();
        assertThat(depois).isEqualTo(primeira);
    }

    @Test
    void entidadeDeveArquivarEReativar() {
        RepositorioGithub repositorio = new RepositorioGithub(UUID.randomUUID(), 1L, "artur", "koda", "main");
        Instant momento = Instant.parse("2026-10-08T12:00:00Z");

        assertThat(repositorio.arquivado()).isFalse();
        repositorio.arquivar(momento);
        repositorio.arquivar(momento.plusSeconds(60));
        assertThat(repositorio.arquivado()).isTrue();
        assertThat(repositorio.getArquivadoEm()).isEqualTo(momento);

        repositorio.reativar();
        assertThat(repositorio.arquivado()).isFalse();
        assertThat(repositorio.getArquivadoEm()).isNull();
    }

    private UUID analiseTerminada(UUID usuarioId) {
        UUID analiseId = registro.registrarNovaAnalise(usuarioId, GITHUB_ID_DO_REPOSITORIO, "artur", "koda", "main");
        registro.iniciar(analiseId);
        registro.concluir(analiseId, "{}", "{}", 1);
        entityManager.flush();
        return analiseId;
    }

    private UUID criarUsuario() {
        return jdbc.queryForObject("INSERT INTO usuarios (github_id, login) VALUES (?, 'artur') RETURNING id",
                UUID.class, ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE - 1));
    }
}
