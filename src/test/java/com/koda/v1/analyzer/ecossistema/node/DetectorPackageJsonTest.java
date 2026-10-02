package com.koda.v1.analyzer.ecossistema.node;

import com.koda.v1.analyzer.detector.ArquivoNaoAnalisavelException;
import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.analyzer.ecossistema.Linguagem;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DetectorPackageJsonTest {

    private final DetectorPackageJson detector = new DetectorPackageJson();

    @Test
    void deveDetectarNestJsComTypescriptEBancos() {
        ResultadoPackageJson resultado = detector.detectar("""
                {"name":"api","dependencies":{"@nestjs/core":"^10.3.1","express":"^4.19.0","pg":"^8.11.0",
                 "ioredis":"^5.3.2","amqplib":"^0.10.3"},
                 "devDependencies":{"typescript":"~5.4.5","jest":"^29.0.0"}}
                """, false);

        assertThat(resultado.linguagem()).isEqualTo(Linguagem.TYPESCRIPT);
        assertThat(resultado.versaoLinguagem()).isEqualTo("5.4.5");
        assertThat(resultado.framework()).isEqualTo("NestJS");
        assertThat(resultado.versaoFramework()).isEqualTo("10.3.1");
        assertThat(resultado.dependencias()).contains("@nestjs/core", "express", "typescript", "jest");
        assertThat(resultado.tecnologias())
                .containsExactlyInAnyOrder(Tecnologia.POSTGRESQL, Tecnologia.REDIS, Tecnologia.RABBITMQ);
        assertThat(resultado.temFramework()).isTrue();
    }

    @Test
    void deveDetectarExpressEmJavaScriptComVersaoDoNode() {
        ResultadoPackageJson resultado = detector.detectar("""
                {"dependencies":{"express":"4.19.2"},"engines":{"node":">=18.17.0"}}
                """, false);

        assertThat(resultado.linguagem()).isEqualTo(Linguagem.JAVASCRIPT);
        assertThat(resultado.versaoLinguagem()).isEqualTo("18.17.0");
        assertThat(resultado.framework()).isEqualTo("Express");
    }

    @Test
    void deveConsiderarTypescriptQuandoHaTsconfigMesmoSemADependencia() {
        ResultadoPackageJson resultado = detector.detectar("{\"dependencies\":{\"fastify\":\"^4.0.0\"}}", true);

        assertThat(resultado.linguagem()).isEqualTo(Linguagem.TYPESCRIPT);
        assertThat(resultado.versaoLinguagem()).isNull();
        assertThat(resultado.framework()).isEqualTo("Fastify");
    }

    @Test
    void deveDarPrioridadeAoNestSobreOExpressQueEleUsaPorBaixo() {
        ResultadoPackageJson resultado = detector.detectar(
                "{\"dependencies\":{\"express\":\"4\",\"@nestjs/core\":\"10\"}}", false);

        assertThat(resultado.framework()).isEqualTo("NestJS");
    }

    @Test
    void deveRecusarProjetoSemFrameworkDeServidor() {
        ResultadoPackageJson resultado = detector.detectar("{\"dependencies\":{\"react\":\"18.0.0\"}}", false);

        assertThat(resultado.temFramework()).isFalse();
        assertThat(resultado.framework()).isNull();
    }

    @Test
    void deveIgnorarNomesDePacoteSuspeitosEVersoesSemNumero() {
        ResultadoPackageJson resultado = detector.detectar("""
                {"dependencies":{"express":"latest","<script>":"1","UPPER":"1","ok-pkg":"1"}}
                """, false);

        assertThat(resultado.versaoFramework()).isNull();
        assertThat(resultado.dependencias()).containsExactly("express", "ok-pkg");
    }

    @Test
    void deveLimitarAQuantidadeDeDependencias() {
        StringBuilder muitas = new StringBuilder("{\"dependencies\":{\"express\":\"4\"");
        for (int i = 0; i < DetectorPackageJson.MAXIMO_DEPENDENCIAS + 50; i++) {
            muitas.append(",\"pacote-").append(i).append("\":\"1\"");
        }
        muitas.append("}}");

        assertThat(detector.detectar(muitas.toString(), false).dependencias())
                .hasSize(DetectorPackageJson.MAXIMO_DEPENDENCIAS);
    }

    @Test
    void deveRecusarArquivoVazioInvalidoOuQueNaoEObjeto() {
        assertThatThrownBy(() -> detector.detectar(" ", false)).isInstanceOf(ArquivoNaoAnalisavelException.class);
        assertThatThrownBy(() -> detector.detectar("{ isso nao e json", false))
                .isInstanceOf(ArquivoNaoAnalisavelException.class);
        assertThatThrownBy(() -> detector.detectar("[1,2]", false)).isInstanceOf(ArquivoNaoAnalisavelException.class);
        assertThatThrownBy(() -> detector.detectar("null", false)).isInstanceOf(ArquivoNaoAnalisavelException.class);
    }

    @Test
    void deveAceitarDependenciasComValorQueNaoEhTexto() {
        ResultadoPackageJson resultado = detector.detectar(
                "{\"dependencies\":{\"express\":{\"version\":\"4\"}},\"engines\":{\"node\":null}}", false);

        assertThat(resultado.framework()).isEqualTo("Express");
        assertThat(resultado.versaoFramework()).isNull();
        assertThat(resultado.versaoLinguagem()).isNull();
    }
}
