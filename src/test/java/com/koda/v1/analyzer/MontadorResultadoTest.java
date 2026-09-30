package com.koda.v1.analyzer;

import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.detector.ResultadoCompose;
import com.koda.v1.analyzer.detector.ResultadoPom;
import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.analyzer.estrutura.ResultadoEstrutura;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MontadorResultadoTest {

    private final MontadorResultado montador = new MontadorResultado();

    @Test
    void juntaTudoQuandoPomComposeEEstruturaExistem() {
        ResultadoPom pom = new ResultadoPom(
                "21",
                "3.5.0",
                List.of("org.springframework.boot:spring-boot-starter-web"),
                Set.of(Tecnologia.POSTGRESQL));
        ResultadoCompose compose = new ResultadoCompose(
                List.of("postgres", "redis"),
                Set.of(Tecnologia.POSTGRESQL, Tecnologia.REDIS));
        ResultadoEstrutura estrutura = new ResultadoEstrutura(
                true,
                List.of("src/main/java/UsuarioController.java"),
                List.of("src/main/java/UsuarioService.java"),
                List.of("src/main/java/UsuarioRepository.java"),
                List.of("src/main/java/Usuario.java"),
                List.of("src/test/java/UsuarioServiceTest.java"));
        List<Endpoint> endpoints = List.of(new Endpoint("GET", "/usuarios", "UsuarioController"));

        ResultadoAnalise resultado = montador.montar(pom, compose, estrutura, endpoints, false);

        assertThat(resultado.temCodigoJava()).isTrue();
        assertThat(resultado.springBoot()).isTrue();
        assertThat(resultado.versaoJava()).isEqualTo("21");
        assertThat(resultado.versaoSpringBoot()).isEqualTo("3.5.0");
        assertThat(resultado.imagensDocker()).containsExactly("postgres", "redis");
        assertThat(resultado.controllers()).hasSize(1);
        assertThat(resultado.endpoints()).containsExactly(endpoints.get(0));
    }

    @Test
    void naoRepeteTecnologiaQuandoPomEComposeDizemAMesmaCoisa() {
        ResultadoPom pom = new ResultadoPom(
                null, null, List.of(), Set.of(Tecnologia.REDIS, Tecnologia.POSTGRESQL));
        ResultadoCompose compose = new ResultadoCompose(
                List.of("postgres"), Set.of(Tecnologia.POSTGRESQL));

        ResultadoAnalise resultado = montador.montar(pom, compose, estruturaVazia(), List.of(), false);

        assertThat(resultado.tecnologias())
                .containsExactly(Tecnologia.POSTGRESQL, Tecnologia.REDIS);
    }

    @Test
    void aguentaRepositorioSemPom() {
        ResultadoAnalise resultado = montador.montar(null, null, estruturaVazia(), null, false);

        assertThat(resultado.springBoot()).isFalse();
        assertThat(resultado.versaoJava()).isNull();
        assertThat(resultado.versaoSpringBoot()).isNull();
        assertThat(resultado.dependencias()).isEmpty();
        assertThat(resultado.tecnologias()).isEmpty();
        assertThat(resultado.endpoints()).isEmpty();
    }

    @Test
    void aguentaRepositorioSemCompose() {
        ResultadoPom pom = new ResultadoPom(
                "17", null, List.of(), Set.of(Tecnologia.POSTGRESQL));

        ResultadoAnalise resultado = montador.montar(pom, null, estruturaVazia(), List.of(), false);

        assertThat(resultado.imagensDocker()).isEmpty();
        assertThat(resultado.tecnologias()).containsExactly(Tecnologia.POSTGRESQL);
    }

    @Test
    void reconheceSpringBootPelaDependenciaMesmoSemVersaoNoPom() {
        ResultadoPom pom = new ResultadoPom(
                null, null, List.of("org.springframework.boot:spring-boot-starter-web"), Set.of());

        ResultadoAnalise resultado = montador.montar(pom, null, estruturaVazia(), List.of(), false);

        assertThat(resultado.springBoot()).isTrue();
    }

    @Test
    void repassaAIndicacaoDeResultadoParcial() {
        ResultadoAnalise parcial = montador.montar(null, null, estruturaVazia(), List.of(), true);
        ResultadoAnalise completo = montador.montar(null, null, estruturaVazia(), List.of(), false);

        assertThat(parcial.parcial()).isTrue();
        assertThat(completo.parcial()).isFalse();
    }

    @Test
    void recusaMontarSemEstrutura() {
        assertThatThrownBy(() -> montador.montar(null, null, null, List.of(), false))
                .isInstanceOf(NullPointerException.class);
    }

    private ResultadoEstrutura estruturaVazia() {
        return new ResultadoEstrutura(
                false, List.of(), List.of(), List.of(), List.of(), List.of());
    }
}