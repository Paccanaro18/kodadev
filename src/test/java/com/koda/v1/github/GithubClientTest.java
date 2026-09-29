package com.koda.v1.github;

import com.koda.v1.github.dto.RepositorioGithub;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class GithubClientTest {

    private MockRestServiceServer servidor;
    private GithubClient client;

    @BeforeEach
    void preparar() {
        RestClient.Builder builder = RestClient.builder().baseUrl("https://api.github.com");
        servidor = MockRestServiceServer.bindTo(builder).build();
        client = new GithubClient(builder.build());
    }

    @Test
    void deveListarRepositoriosEnviandoOToken() {
        String json = """
                [{"id": 1, "name": "koda", "full_name": "artur/koda", "description": null,
                  "language": "Java", "html_url": "https://github.com/artur/koda",
                  "updated_at": "2026-09-20T10:00:00Z","default_branch": "main", "private": false,
                   "campo_novo": "ignorado"}]
                """;

        servidor.expect(requestTo(startsWith("https://api.github.com/user/repos")))
                .andExpect(header("Authorization", "Bearer token-teste"))
                .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

        List<RepositorioGithub> repositorios = client.listarRepositorios("token-teste");

        assertThat(repositorios).hasSize(1);
        assertThat(repositorios.get(0).nomeCompleto()).isEqualTo("artur/koda");
        assertThat(repositorios.get(0).branchPadrao()).isEqualTo("main");
        assertThat(repositorios.get(0).atualizadoEm()).isEqualTo("2026-09-20T10:00:00Z");
        servidor.verify();
    }

    @Test
    void deveTraduzir401ParaTokenInvalido() {
        servidor.expect(requestTo(startsWith("https://api.github.com/user/repos")))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        assertThatThrownBy(() -> client.listarRepositorios("token-revogado"))
                .isInstanceOfSatisfying(GithubApiException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    void deveTraduzirLimiteEsgotadoPara429() {
        servidor.expect(requestTo(startsWith("https://api.github.com/user/repos")))
                .andRespond(withStatus(HttpStatus.FORBIDDEN).header("X-RateLimit-Remaining", "0"));

        assertThatThrownBy(() -> client.listarRepositorios("token"))
                .isInstanceOfSatisfying(GithubApiException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS));
    }

    @Test
    void deveTraduzirErroDoGithubPara502() {
        servidor.expect(requestTo(startsWith("https://api.github.com/user/repos")))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        assertThatThrownBy(() -> client.listarRepositorios("token"))
                .isInstanceOfSatisfying(GithubApiException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_GATEWAY));
    }
}
