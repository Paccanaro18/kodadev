package com.koda.v1.analyzer.detector;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DetectorDockerComposeTest {

    private final DetectorDockerCompose detector = new DetectorDockerCompose();

    @Test
    void deveDetectarPostgresRabbitERedis() {
        String compose = """
                services:
                  banco:
                    image: postgres:16
                  fila:
                    image: rabbitmq:3-management
                  cache:
                    image: redis:7-alpine
                """;

        ResultadoCompose resultado = detector.detectar(compose);

        assertThat(resultado.imagens()).containsExactly("postgres", "rabbitmq", "redis");
        assertThat(resultado.tecnologias()).containsExactlyInAnyOrder(
                Tecnologia.POSTGRESQL, Tecnologia.RABBITMQ, Tecnologia.REDIS);
    }

    @Test
    void deveLimparRegistryETagDaImagem() {
        String compose = """
                services:
                  banco:
                    image: docker.io/bitnami/postgresql:16
                  cache:
                    image: localhost:5000/redis:7
                """;

        ResultadoCompose resultado = detector.detectar(compose);

        assertThat(resultado.imagens()).containsExactly("postgresql", "redis");
        assertThat(resultado.tecnologias()).containsExactlyInAnyOrder(
                Tecnologia.POSTGRESQL, Tecnologia.REDIS);
    }

    @Test
    void deveIgnorarServicoQueConstroiAPropriaImagem() {
        String compose = """
                services:
                  app:
                    build: .
                """;

        ResultadoCompose resultado = detector.detectar(compose);

        assertThat(resultado.imagens()).isEmpty();
        assertThat(resultado.tecnologias()).isEmpty();
    }

    @Test
    void naoDeveConfundirRedisInsightComRedis() {
        String compose = """
                services:
                  painel:
                    image: redis/redisinsight:latest
                """;

        ResultadoCompose resultado = detector.detectar(compose);

        assertThat(resultado.imagens()).containsExactly("redisinsight");
        assertThat(resultado.tecnologias()).isEmpty();
    }

    @Test
    void deveAceitarComposeSemServicos() {
        ResultadoCompose resultado = detector.detectar("version: '3'\n");

        assertThat(resultado.imagens()).isEmpty();
        assertThat(resultado.tecnologias()).isEmpty();
    }

    @Test
    void deveRecusarConteudoQueNaoEhMapaYaml() {
        assertThatThrownBy(() -> detector.detectar("isto não é um compose"))
                .isInstanceOf(ArquivoNaoAnalisavelException.class);
    }

    @Test
    void deveRecusarYamlComTagPerigosa() {
        String malicioso = """
                services:
                  x: !!java.io.File ["/etc/passwd"]
                """;

        assertThatThrownBy(() -> detector.detectar(malicioso))
                .isInstanceOf(ArquivoNaoAnalisavelException.class);
    }

    @Test
    void deveRecusarYamlComAliasesDemais() {
        String bomba = "a: &a [1, 2]\nb: [" + "*a, ".repeat(15) + "*a]\n";

        assertThatThrownBy(() -> detector.detectar(bomba))
                .isInstanceOf(ArquivoNaoAnalisavelException.class);
    }

    @Test
    void deveRecusarArquivoMaiorQueOLimiteEArquivoVazio() {
        String gigante = "a".repeat(LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO + 1);

        assertThatThrownBy(() -> detector.detectar(gigante))
                .isInstanceOf(ArquivoNaoAnalisavelException.class)
                .hasMessageContaining("limite");
        assertThatThrownBy(() -> detector.detectar("  "))
                .isInstanceOf(ArquivoNaoAnalisavelException.class);
    }
}
