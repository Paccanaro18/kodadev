package com.koda.v1;

import org.junit.jupiter.api.Test;
import org.springframework.context.support.GenericApplicationContext;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BancoDeTesteInicializadorTest {

    private final BancoDeTesteInicializador inicializador = new BancoDeTesteInicializador();

    private GenericApplicationContext contextoCom(String url) {
        GenericApplicationContext contexto = new GenericApplicationContext();
        contexto.setEnvironment(new MockEnvironment().withProperty("spring.datasource.url", url));
        return contexto;
    }

    @Test
    void deveRecusarSubirOsTestesApontandoParaOBancoDeDesenvolvimento() {
        assertThatThrownBy(() -> inicializador.initialize(contextoCom("jdbc:postgresql://localhost:5433/koda")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("_test");
    }

    @Test
    void deveRecusarUrlQueNaoSejaDePostgresOuQueEstejaVazia() {
        assertThatThrownBy(() -> inicializador.initialize(contextoCom("jdbc:h2:mem:koda_test")))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> inicializador.initialize(contextoCom("")))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void deveRecusarNomeDeBancoComCaracteresPerigososNaUrl() {
        assertThatThrownBy(() -> inicializador.initialize(
                contextoCom("jdbc:postgresql://localhost:5433/koda_test; DROP DATABASE koda")))
                .isInstanceOf(IllegalStateException.class);
    }
}
