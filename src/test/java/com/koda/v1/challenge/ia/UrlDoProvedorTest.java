package com.koda.v1.challenge.ia;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UrlDoProvedorTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "https://api.exemplo.com/v1",
            "https://api.exemplo.com",
            "http://localhost:3001/v1",
            "http://127.0.0.1:3001/v1",
            "http://[::1]:3001/v1",
            "HTTP://LOCALHOST:3001/v1",
            "  http://localhost:3001/v1  "})
    void deveAceitarHttpsEHttpSoEmLocalhost(String url) {
        assertThat(UrlDoProvedor.validar(url)).isNotNull();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "http://exemplo.com/v1",
            "http://192.168.0.10:3001/v1",
            "http://localhost.evil.com/v1",
            "http://localhost@evil.com/v1",
            "https://usuario:senha@exemplo.com/v1",
            "https://exemplo.com/v1?chave=segredo",
            "https://exemplo.com/v1#ancora",
            "ftp://exemplo.com/v1",
            "file:///etc/passwd",
            "javascript:alert(1)",
            "//exemplo.com/v1",
            "/v1",
            "localhost:3001/v1",
            "http://",
            "https://exemplo .com/v1"})
    void deveRecusarUrlsInseguras(String url) {
        assertThatThrownBy(() -> UrlDoProvedor.validar(url)).isInstanceOf(IllegalArgumentException.class);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void deveRecusarUrlVazia(String url) {
        assertThatThrownBy(() -> UrlDoProvedor.validar(url))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("obrigatória");
    }

    @Test
    void naoDeveRepetirAUrlRecusadaNaMensagemDeErro() {
        assertThatThrownBy(() -> UrlDoProvedor.validar("https://usuario:senha-secreta@exemplo.com/v1"))
                .isInstanceOf(IllegalArgumentException.class)
                .satisfies(e -> assertThat(e.getMessage()).doesNotContain("senha-secreta"));
    }
}
