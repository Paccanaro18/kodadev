package com.koda.v1.github;

import com.koda.v1.github.dto.ArquivoResposta;
import com.koda.v1.github.dto.BlobGithub;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Base64;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GithubServiceTest {

    private final UUID usuarioId = UUID.randomUUID();

    private GithubClient client;
    private GithubService service;

    @BeforeEach
    void preparar() {
        client = mock(GithubClient.class);
        ConexaoGithubService conexao = mock(ConexaoGithubService.class);
        when(conexao.obterToken(usuarioId)).thenReturn("token");
        service = new GithubService(client, conexao);
    }

    @Test
    void deveDecodificarArquivoEmBase64() {
        String base64 = Base64.getEncoder().encodeToString("olá".getBytes());
        when(client.buscarBlob("token", "artur", "koda", "abc"))
                .thenReturn(new BlobGithub("abc", 4, base64, "base64"));

        ArquivoResposta arquivo = service.lerArquivo(usuarioId, "artur", "koda", "abc");

        assertThat(arquivo.conteudo()).isEqualTo("olá");
        assertThat(arquivo.sha()).isEqualTo("abc");
    }

    @Test
    void deveAceitarArquivoNoLimiteExato() {
        when(client.buscarBlob("token", "artur", "koda", "abc"))
                .thenReturn(new BlobGithub("abc", LimitesGithub.TAMANHO_MAXIMO_ARQUIVO_BYTES, "x", "utf-8"));

        assertThat(service.lerArquivo(usuarioId, "artur", "koda", "abc").conteudo()).isEqualTo("x");
    }

    @Test
    void deveRecusarArquivoMaiorQueOLimite() {
        when(client.buscarBlob("token", "artur", "koda", "abc"))
                .thenReturn(new BlobGithub("abc", LimitesGithub.TAMANHO_MAXIMO_ARQUIVO_BYTES + 1L, "x", "utf-8"));

        assertThatThrownBy(() -> service.lerArquivo(usuarioId, "artur", "koda", "abc"))
                .isInstanceOfSatisfying(ArquivoGrandeDemaisException.class,
                        e -> assertThat(e.getStatus()).isEqualTo(HttpStatus.CONTENT_TOO_LARGE));
    }
}
