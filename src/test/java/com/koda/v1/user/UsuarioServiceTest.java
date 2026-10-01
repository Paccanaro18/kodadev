package com.koda.v1.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class UsuarioServiceTest {

    @Autowired
    private UsuarioService servico;

    @Autowired
    private JdbcTemplate jdbc;

    private long novoGithubId() {
        return ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE);
    }

    @Test
    void deveRegistrarUmUsuarioNovoComOsDadosDoGithub() {
        long githubId = novoGithubId();

        UsuarioResposta criado = servico.registrarOuAtualizar(
                new DadosUsuarioGithub(githubId, "artur", "Artur", "https://avatars.exemplo/artur.png"));

        assertThat(criado.id()).isNotNull();
        assertThat(criado.login()).isEqualTo("artur");
        assertThat(criado.nome()).isEqualTo("Artur");
        assertThat(criado.avatarUrl()).isEqualTo("https://avatars.exemplo/artur.png");
        assertThat(servico.buscarPorGithubId(githubId).id()).isEqualTo(criado.id());
    }

    @Test
    void deveAtualizarOPerfilSemCriarOutroUsuarioNoSegundoLogin() {
        long githubId = novoGithubId();
        UsuarioResposta primeiro = servico.registrarOuAtualizar(new DadosUsuarioGithub(githubId, "artur", "Artur", "https://a/1.png"));

        UsuarioResposta segundo = servico.registrarOuAtualizar(
                new DadosUsuarioGithub(githubId, "artur-novo", "Artur Paccanaro", "https://a/2.png"));

        assertThat(segundo.id()).isEqualTo(primeiro.id());
        assertThat(segundo.login()).isEqualTo("artur-novo");
        assertThat(segundo.nome()).isEqualTo("Artur Paccanaro");
        assertThat(segundo.avatarUrl()).isEqualTo("https://a/2.png");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM usuarios WHERE github_id = ?", Long.class, githubId)).isEqualTo(1L);
    }

    @Test
    void deveAceitarPerfilSemNomeNemAvatar() {
        UsuarioResposta criado = servico.registrarOuAtualizar(new DadosUsuarioGithub(novoGithubId(), "sem-nome", null, null));

        assertThat(criado.nome()).isNull();
        assertThat(criado.avatarUrl()).isNull();
    }

    @Test
    void deveFalharClaramenteQuandoOUsuarioNaoExiste() {
        assertThatThrownBy(() -> servico.buscarPorGithubId(-1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("-1");
    }

    @Test
    void deveBuscarOUsuarioDaSessaoPeloIdDoGithub() {
        long githubId = novoGithubId();
        UsuarioResposta criado = servico.registrarOuAtualizar(new DadosUsuarioGithub(githubId, "da-sessao", "Sessão", null));
        DefaultOAuth2User principal = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")), Map.of("id", githubId, "login", "da-sessao"), "login");

        assertThat(servico.buscarDaSessao(principal).id()).isEqualTo(criado.id());
    }
}
