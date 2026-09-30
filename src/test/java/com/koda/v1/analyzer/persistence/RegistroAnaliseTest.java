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
class RegistroAnaliseTest {

    @Autowired
    private RegistroAnalise registro;

    @Autowired
    private RepositorioGithubRepository repositorioRepository;

    @Autowired
    private AnaliseProjetoRepository analiseRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    @Test
    void deveIniciarDevolvendoOsDadosDoRepositorioEMarcandoEmAndamento() {
        UUID usuarioId = criarUsuario();
        UUID analiseId = criarAnalise(usuarioId);

        DadosExecucao dados = registro.iniciar(analiseId);

        assertThat(dados.usuarioId()).isEqualTo(usuarioId);
        assertThat(dados.dono()).isEqualTo("artur");
        assertThat(dados.nome()).isEqualTo("koda");
        assertThat(statusDe(analiseId)).isEqualTo(StatusAnalise.EM_ANDAMENTO);
    }

    @Test
    void deveConcluirGravandoOResultado() {
        UUID analiseId = criarAnalise(criarUsuario());
        registro.iniciar(analiseId);

        registro.concluir(analiseId, "{\"versaoJava\":\"21\"}");
        entityManager.flush();
        entityManager.clear();

        AnaliseProjeto lida = analiseRepository.findById(analiseId).orElseThrow();
        assertThat(lida.getStatus()).isEqualTo(StatusAnalise.CONCLUIDA);
        assertThat(lida.getResultado()).contains("versaoJava");
        assertThat(lida.getConcluidaEm()).isNotNull();
    }

    @Test
    void deveFalharGravandoAMensagem() {
        UUID analiseId = criarAnalise(criarUsuario());
        registro.iniciar(analiseId);

        registro.falhar(analiseId, "O repositório não é um projeto Spring Boot.");
        entityManager.flush();
        entityManager.clear();

        AnaliseProjeto lida = analiseRepository.findById(analiseId).orElseThrow();
        assertThat(lida.getStatus()).isEqualTo(StatusAnalise.FALHOU);
        assertThat(lida.getMensagemErro()).isEqualTo("O repositório não é um projeto Spring Boot.");
    }

    @Test
    void naoDeveIniciarDuasVezesAMesmaAnalise() {
        UUID analiseId = criarAnalise(criarUsuario());
        registro.iniciar(analiseId);

        assertThatThrownBy(() -> registro.iniciar(analiseId))
                .isInstanceOf(TransicaoInvalidaException.class);
    }

    @Test
    void deveRecusarAnaliseInexistente() {
        UUID inexistente = UUID.randomUUID();

        assertThatThrownBy(() -> registro.iniciar(inexistente))
                .isInstanceOf(AnaliseNaoEncontradaException.class);
        assertThatThrownBy(() -> registro.concluir(inexistente, "{}"))
                .isInstanceOf(AnaliseNaoEncontradaException.class);
        assertThatThrownBy(() -> registro.falhar(inexistente, "x"))
                .isInstanceOf(AnaliseNaoEncontradaException.class);
    }

    @Test
    void deveFalharSoAsAnalisesEmAberto() {
        UUID usuarioId = criarUsuario();
        UUID pendente = criarAnalise(usuarioId);
        UUID emAndamento = criarAnalise(usuarioId);
        UUID concluida = criarAnalise(usuarioId);
        registro.iniciar(emAndamento);
        registro.iniciar(concluida);
        registro.concluir(concluida, "{}");

        int total = registro.falharAnalisesEmAberto("interrompida");
        entityManager.flush();
        entityManager.clear();

        assertThat(total).isGreaterThanOrEqualTo(2);
        assertThat(statusDe(pendente)).isEqualTo(StatusAnalise.FALHOU);
        assertThat(statusDe(emAndamento)).isEqualTo(StatusAnalise.FALHOU);
        assertThat(statusDe(concluida)).isEqualTo(StatusAnalise.CONCLUIDA);
        assertThat(analiseRepository.findById(pendente).orElseThrow().getMensagemErro())
                .isEqualTo("interrompida");
    }

    @Test
    void deveRegistrarRepositorioEAnalisePendenteNaPrimeiraVez() {
        UUID usuarioId = criarUsuario();

        UUID analiseId = registro.registrarNovaAnalise(usuarioId, 777L, "artur", "koda", "main");

        assertThat(statusDe(analiseId)).isEqualTo(StatusAnalise.PENDENTE);
        RepositorioGithub repositorio = repositorioRepository
                .findByUsuarioIdAndGithubIdRepositorio(usuarioId, 777L).orElseThrow();
        assertThat(repositorio.getNome()).isEqualTo("koda");
        assertThat(analiseRepository.findById(analiseId).orElseThrow().getRepositorioId())
                .isEqualTo(repositorio.getId());
    }

    @Test
    void naoDeveCriarSegundaAnaliseEnquantoHouverUmaEmAberto() {
        UUID usuarioId = criarUsuario();
        registro.registrarNovaAnalise(usuarioId, 777L, "artur", "koda", "main");

        assertThatThrownBy(() -> registro.registrarNovaAnalise(usuarioId, 777L, "artur", "koda", "main"))
                .isInstanceOf(AnaliseEmAndamentoException.class);
    }

    @Test
    void deveReanalisarReaproveitandoORepositorioEAtualizandoSeusDados() {
        UUID usuarioId = criarUsuario();
        UUID primeira = registro.registrarNovaAnalise(usuarioId, 777L, "artur", "nome-antigo", "main");
        registro.iniciar(primeira);
        registro.concluir(primeira, "{}");

        UUID segunda = registro.registrarNovaAnalise(usuarioId, 777L, "artur", "nome-novo", "develop");
        entityManager.flush();
        entityManager.clear();

        assertThat(segunda).isNotEqualTo(primeira);
        assertThat(analiseRepository.findById(segunda).orElseThrow().getRepositorioId())
                .isEqualTo(analiseRepository.findById(primeira).orElseThrow().getRepositorioId());
        RepositorioGithub repositorio = repositorioRepository
                .findByUsuarioIdAndGithubIdRepositorio(usuarioId, 777L).orElseThrow();
        assertThat(repositorio.getNome()).isEqualTo("nome-novo");
        assertThat(repositorio.getBranchPadrao()).isEqualTo("develop");
    }

    @Test
    void deveBarrarNoBancoDuasAnalisesEmAbertoDoMesmoRepositorio() {
        UUID usuarioId = criarUsuario();
        UUID analiseId = registro.registrarNovaAnalise(usuarioId, 777L, "artur", "koda", "main");
        UUID repositorioId = analiseRepository.findById(analiseId).orElseThrow().getRepositorioId();

        assertThatThrownBy(() -> analiseRepository.saveAndFlush(new AnaliseProjeto(repositorioId)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private StatusAnalise statusDe(UUID analiseId) {
        entityManager.flush();
        entityManager.clear();
        return analiseRepository.findById(analiseId).orElseThrow().getStatus();
    }

    private UUID criarAnalise(UUID usuarioId) {
        long githubIdRepositorio = ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE);
        RepositorioGithub repositorio = repositorioRepository.saveAndFlush(
                new RepositorioGithub(usuarioId, githubIdRepositorio, "artur", "koda", "main"));
        return analiseRepository.saveAndFlush(new AnaliseProjeto(repositorio.getId())).getId();
    }

    private UUID criarUsuario() {
        long githubId = ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE);
        return jdbcTemplate.queryForObject(
                "INSERT INTO usuarios (github_id, login) VALUES (?, ?) RETURNING id",
                UUID.class, githubId, "usuario-teste");
    }
}
