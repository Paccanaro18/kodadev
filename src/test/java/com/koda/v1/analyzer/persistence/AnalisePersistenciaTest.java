package com.koda.v1.analyzer.persistence;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AnalisePersistenciaTest {

    @Autowired
    private RepositorioGithubRepository repositorioRepository;

    @Autowired
    private AnaliseProjetoRepository analiseRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void deveGravarELerRepositorio() {
        UUID usuarioId = criarUsuario();
        RepositorioGithub novo = new RepositorioGithub(usuarioId, 12345L, "artur", "koda", "main");

        repositorioRepository.saveAndFlush(novo);
        entityManager.clear();

        RepositorioGithub lido = repositorioRepository
                .findByUsuarioIdAndGithubIdRepositorio(usuarioId, 12345L)
                .orElseThrow();

        assertThat(lido.getId()).isNotNull();
        assertThat(lido.getDono()).isEqualTo("artur");
        assertThat(lido.getNome()).isEqualTo("koda");
        assertThat(lido.getBranchPadrao()).isEqualTo("main");
        assertThat(lido.getCriadoEm()).isNotNull();
    }

    @Test
    void deveAtualizarNomeQuandoRepositorioForRenomeado() {
        UUID usuarioId = criarUsuario();
        RepositorioGithub salvo = repositorioRepository.saveAndFlush(
                new RepositorioGithub(usuarioId, 777L, "artur", "nome-antigo", "main"));

        salvo.atualizarDados("artur", "nome-novo", "develop");
        repositorioRepository.saveAndFlush(salvo);
        entityManager.clear();

        RepositorioGithub lido = repositorioRepository
                .findByUsuarioIdAndGithubIdRepositorio(usuarioId, 777L)
                .orElseThrow();

        assertThat(lido.getNome()).isEqualTo("nome-novo");
        assertThat(lido.getBranchPadrao()).isEqualTo("develop");
    }

    @Test
    void naoDeveConectarOMesmoRepositorioDuasVezesParaOMesmoUsuario() {
        UUID usuarioId = criarUsuario();
        repositorioRepository.saveAndFlush(
                new RepositorioGithub(usuarioId, 999L, "artur", "koda", "main"));

        assertThatThrownBy(() -> repositorioRepository.saveAndFlush(
                new RepositorioGithub(usuarioId, 999L, "artur", "koda", "main")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deveGravarResultadoComoJsonDeVerdade() {
        UUID repositorioId = criarRepositorio();
        AnaliseProjeto analise = new AnaliseProjeto(repositorioId);
        assertThat(analise.getStatus()).isEqualTo(StatusAnalise.PENDENTE);

        analise.iniciar();
        analise.concluir("{\"versaoJava\":\"21\",\"dependencias\":[\"a\",\"b\"]}");
        analiseRepository.saveAndFlush(analise);
        entityManager.clear();

        AnaliseProjeto lida = analiseRepository.findById(analise.getId()).orElseThrow();
        assertThat(lida.getStatus()).isEqualTo(StatusAnalise.CONCLUIDA);
        assertThat(lida.getConcluidaEm()).isNotNull();
        assertThat(lida.getMensagemErro()).isNull();

        String tipo = jdbcTemplate.queryForObject(
                "SELECT jsonb_typeof(resultado) FROM analises_projeto WHERE id = ?",
                String.class, analise.getId());
        String versaoJava = jdbcTemplate.queryForObject(
                "SELECT resultado ->> 'versaoJava' FROM analises_projeto WHERE id = ?",
                String.class, analise.getId());

        assertThat(tipo).isEqualTo("object");
        assertThat(versaoJava).isEqualTo("21");
    }

    @Test
    void deveGuardarMotivoQuandoAAnaliseFalha() {
        UUID repositorioId = criarRepositorio();
        AnaliseProjeto analise = new AnaliseProjeto(repositorioId);

        analise.iniciar();
        analise.falhar("repositório não é Java");
        analiseRepository.saveAndFlush(analise);
        entityManager.clear();

        AnaliseProjeto lida = analiseRepository.findById(analise.getId()).orElseThrow();

        assertThat(lida.getStatus()).isEqualTo(StatusAnalise.FALHOU);
        assertThat(lida.getMensagemErro()).isEqualTo("repositório não é Java");
        assertThat(lida.getResultado()).isNull();
        assertThat(lida.getConcluidaEm()).isNotNull();
    }

    @Test
    void deveBuscarAAnaliseMaisRecenteDoRepositorio() {
        UUID repositorioId = criarRepositorio();

        AnaliseProjeto antiga = analiseRepository.saveAndFlush(new AnaliseProjeto(repositorioId));
        jdbcTemplate.update(
                "UPDATE analises_projeto SET criado_em = now() - interval '1 hour' WHERE id = ?",
                antiga.getId());
        AnaliseProjeto nova = analiseRepository.saveAndFlush(new AnaliseProjeto(repositorioId));
        entityManager.clear();

        AnaliseProjeto maisRecente = analiseRepository
                .findFirstByRepositorioIdOrderByCriadoEmDesc(repositorioId)
                .orElseThrow();

        assertThat(maisRecente.getId()).isEqualTo(nova.getId());
    }

    private UUID criarUsuario() {
        long githubId = ThreadLocalRandom.current().nextLong(1_000_000_000L, Long.MAX_VALUE);
        return jdbcTemplate.queryForObject(
                "INSERT INTO usuarios (github_id, login) VALUES (?, ?) RETURNING id",
                UUID.class, githubId, "usuario-teste");
    }

    private UUID criarRepositorio() {
        RepositorioGithub repositorio = repositorioRepository.saveAndFlush(
                new RepositorioGithub(criarUsuario(), 1L, "artur", "koda", "main"));
        return repositorio.getId();
    }
}
