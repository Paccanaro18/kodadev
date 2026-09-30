package com.koda.v1.analyzer.persistence;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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

    @Autowired
    private EntityManager entityManager;

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
    void deveDevolverOContextoGravadoNaConclusao() {
        UUID dono = criarUsuario();
        UUID analiseId = criarAnalise(dono);
        AnaliseProjeto analise = analiseRepository.findById(analiseId).orElseThrow();
        analise.iniciar();
        analise.concluir("{\"a\":1}", "{\"versaoEsquema\":1}", 1);
        analiseRepository.saveAndFlush(analise);
        entityManager.clear();

        AnaliseDetalhe detalhe = consulta.buscarDoUsuario(dono, analiseId);

        assertThat(detalhe.contextoJson()).contains("versaoEsquema");
        assertThat(detalhe.resultadoJson()).contains("\"a\"");
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

    @Test
    void deveListarSoAUltimaAnaliseDeCadaRepositorioDoUsuarioDaMaisRecenteParaAMaisAntiga() {
        UUID usuarioId = criarUsuario();
        UUID repositorioA = criarRepositorio(usuarioId, "repo-a");
        UUID repositorioB = criarRepositorio(usuarioId, "repo-b");
        criarRepositorio(usuarioId, "repo-sem-analise");

        UUID antigaDeA = criarAnaliseFalhada(repositorioA, "1 day");
        UUID recenteDeA = criarAnaliseEm(repositorioA, "1 hour");
        UUID unicaDeB = criarAnaliseEm(repositorioB, "2 hours");
        criarAnalise(criarUsuario());

        List<AnaliseDetalhe> lista = consulta.listarUltimasDoUsuario(usuarioId);

        assertThat(lista).extracting(AnaliseDetalhe::id).containsExactly(recenteDeA, unicaDeB);
        assertThat(lista).extracting(AnaliseDetalhe::id).doesNotContain(antigaDeA);
        assertThat(lista).extracting(AnaliseDetalhe::nome).containsExactly("repo-a", "repo-b");
    }

    @Test
    void deveListarVazioQuandoOUsuarioNaoTemAnalises() {
        assertThat(consulta.listarUltimasDoUsuario(criarUsuario())).isEmpty();
    }

    private UUID criarRepositorio(UUID usuarioId, String nome) {
        return repositorioRepository.saveAndFlush(new RepositorioGithub(
                usuarioId, ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE), "artur", nome, "main")).getId();
    }

    private UUID criarAnaliseFalhada(UUID repositorioId, String haQuantoTempo) {
        AnaliseProjeto analise = new AnaliseProjeto(repositorioId);
        analise.falhar("antiga");
        return salvarEm(analise, haQuantoTempo);
    }

    private UUID criarAnaliseEm(UUID repositorioId, String haQuantoTempo) {
        return salvarEm(new AnaliseProjeto(repositorioId), haQuantoTempo);
    }

    private UUID salvarEm(AnaliseProjeto analise, String haQuantoTempo) {
        UUID id = analiseRepository.saveAndFlush(analise).getId();
        jdbcTemplate.update("UPDATE analises_projeto SET criado_em = now() - CAST(? AS interval) WHERE id = ?",
                haQuantoTempo, id);
        entityManager.clear();
        return id;
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
