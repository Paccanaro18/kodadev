package com.koda.v1.github;

import com.koda.v1.github.dto.BlobGithub;
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
    void deveLerBlobEnviandoOToken() {
        String json = """
                {"sha": "abc", "size": 5, "content": "b2xhIQ==", "encoding": "base64", "campo_novo": "x"}
                """;

        servidor.expect(requestTo("https://api.github.com/repos/artur/koda/git/blobs/abc"))
                .andExpect(header("Authorization", "Bearer token-teste"))
                .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

        BlobGithub blob = client.buscarBlob("token-teste", "artur", "koda", "abc");

        assertThat(blob.sha()).isEqualTo("abc");
        assertThat(blob.tamanho()).isEqualTo(5);
        assertThat(blob.codificacao()).isEqualTo("base64");
        servidor.verify();
    }

    @Test
    void deveRecusarRespostaDeBlobMaiorQueOLimite() {
        String gigante = "x".repeat(LimitesGithub.TAMANHO_MAXIMO_RESPOSTA_BLOB_BYTES + 1);
        String json = "{\"sha\":\"abc\",\"size\":1,\"content\":\"" + gigante + "\",\"encoding\":\"utf-8\"}";

        servidor.expect(requestTo("https://api.github.com/repos/artur/koda/git/blobs/abc"))
                .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.buscarBlob("token", "artur", "koda", "abc"))
                .isInstanceOf(ArquivoGrandeDemaisException.class);
    }

    @Test
    void deveTraduzirErroDoGithubAoBuscarBlob() {
        servidor.expect(requestTo("https://api.github.com/repos/artur/koda/git/blobs/abc"))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        assertThatThrownBy(() -> client.buscarBlob("token", "artur", "koda", "abc"))
                .isInstanceOfSatisfying(GithubApiException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void deveTraduzirBlobComJsonInvalidoPara502() {
        servidor.expect(requestTo("https://api.github.com/repos/artur/koda/git/blobs/abc"))
                .andRespond(withSuccess("isso não é json", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.buscarBlob("token", "artur", "koda", "abc"))
                .isInstanceOfSatisfying(GithubApiException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_GATEWAY));
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
