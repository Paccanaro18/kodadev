package com.koda.v1.github;

import com.koda.v1.github.repository.ConexaoGithubRepository;
import com.koda.v1.user.DadosUsuarioGithub;
import com.koda.v1.user.UsuarioService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ConexaoGithubServiceTest {

    private static final String TOKEN = "gho_token-de-teste-1234567890";

    @Autowired
    private ConexaoGithubService servico;

    @Autowired
    private UsuarioService usuarios;

    @Autowired
    private ConexaoGithubRepository repositorio;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager entityManager;

    private UUID novoUsuario() {
        return usuarios.registrarOuAtualizar(new DadosUsuarioGithub(
                ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE), "usuario", null, null)).id();
    }

    @Test
    void deveGuardarOTokenSempreCriptografadoENuncaEmTextoPuro() {
        UUID usuario = novoUsuario();

        servico.salvarOuAtualizar(usuario, TOKEN, Set.of("read:user"));
        entityManager.flush();

        String gravado = jdbc.queryForObject(
                "SELECT token_criptografado FROM conexoes_github WHERE usuario_id = ?", String.class, usuario);
        assertThat(gravado).isNotBlank().isNotEqualTo(TOKEN).doesNotContain(TOKEN).doesNotContain("gho_");
    }

    @Test
    void deveDevolverOTokenOriginalDepoisDeDescriptografar() {
        UUID usuario = novoUsuario();
        servico.salvarOuAtualizar(usuario, TOKEN, Set.of("read:user"));

        assertThat(servico.obterToken(usuario)).isEqualTo(TOKEN);
    }

    @Test
    void deveGuardarOsEscoposSeparadosPorVirgula() {
        UUID usuario = novoUsuario();

        servico.salvarOuAtualizar(usuario, TOKEN, new TreeSet<>(Set.of("read:user", "public_repo")));

        assertThat(repositorio.findByUsuarioId(usuario).orElseThrow().getEscopos()).isEqualTo("public_repo,read:user");
    }

    @Test
    void deveSubstituirOTokenNoNovoLoginSemCriarOutraConexao() {
        UUID usuario = novoUsuario();
        servico.salvarOuAtualizar(usuario, TOKEN, Set.of("read:user"));

        servico.salvarOuAtualizar(usuario, "gho_token-novo", Set.of("read:user", "repo"));
        entityManager.flush();

        assertThat(servico.obterToken(usuario)).isEqualTo("gho_token-novo");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM conexoes_github WHERE usuario_id = ?", Long.class, usuario))
                .isEqualTo(1L);
    }

    @Test
    void deveFalharClaramenteQuandoOUsuarioNaoTemConexao() {
        UUID semConexao = novoUsuario();

        assertThatThrownBy(() -> servico.obterToken(semConexao))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining(semConexao.toString());
    }

    @Test
    void naoDeveRepetirOTokenNaMensagemDeErro() {
        UUID semConexao = novoUsuario();

        assertThatThrownBy(() -> servico.obterToken(semConexao))
                .satisfies(e -> assertThat(e.getMessage()).doesNotContain("gho_"));
    }
}
