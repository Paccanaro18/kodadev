package com.koda.v1.github;

import com.koda.v1.github.dto.ArvoreGithub;
import com.koda.v1.github.dto.BlobGithub;
import com.koda.v1.github.dto.RepositorioGithub;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriBuilder;

import java.net.URI;
import java.util.List;
import java.util.function.Function;

@Component
public class GithubClient {

    private final RestClient restClient;

    public GithubClient(@Qualifier("githubRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public List<RepositorioGithub> listarRepositorios(String token) {
        return requisitar(token, uri -> uri.path("/user/repos")
                .queryParam("visibility", "public")
                .queryParam("affiliation", "owner")
                .queryParam("sort", "updated")
                .queryParam("per_page", 100)
                .build())
                .body(new ParameterizedTypeReference<List<RepositorioGithub>>() {});
    }

    public RepositorioGithub buscarRepositorio(String token, String dono, String repositorio) {
        return requisitar(token, uri -> uri.path("/repos/{dono}/{repo}")
                .build(dono, repositorio))
                .body(RepositorioGithub.class);
    }

    public ArvoreGithub buscarArvore(String token, String dono, String repositorio, String branch) {
        return requisitar(token, uri -> uri.path("/repos/{dono}/{repo}/git/trees/{branch}")
                .queryParam("recursive", 1)
                .build(dono, repositorio, branch))
                .body(ArvoreGithub.class);
    }

    public BlobGithub buscarBlob(String token, String dono, String repositorio, String sha) {
        return requisitar(token, uri -> uri.path("/repos/{dono}/{repo}/git/blobs/{sha}")
                .build(dono, repositorio, sha))
                .body(BlobGithub.class);
    }

    private RestClient.ResponseSpec requisitar(String token, Function<UriBuilder, URI> uri) {
        return restClient.get()
                .uri(uri)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (requisicao, resposta) -> {
                    throw traduzirErro(resposta.getStatusCode(),
                            resposta.getHeaders().getFirst("X-RateLimit-Remaining"));
                });
    }

    private GithubApiException traduzirErro(HttpStatusCode status, String limiteRestante) {
        int codigo = status.value();

        if ((codigo == 403 || codigo == 429) && "0".equals(limiteRestante)) {
            return new GithubApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Limite de requisições do GitHub atingido. Tente novamente mais tarde.");
        }
        if (codigo == 401) {
            return new GithubApiException(HttpStatus.UNAUTHORIZED,
                    "Token do GitHub inválido ou revogado. Faça login novamente.");
        }
        if (codigo == 404) {
            return new GithubApiException(HttpStatus.NOT_FOUND,
                    "Recurso não encontrado no GitHub.");
        }
        return new GithubApiException(HttpStatus.BAD_GATEWAY,
                "Falha ao consultar o GitHub (status " + codigo + ").");
    }
}