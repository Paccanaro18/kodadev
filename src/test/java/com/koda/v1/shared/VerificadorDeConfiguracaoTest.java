package com.koda.v1.shared;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class VerificadorDeConfiguracaoTest {

    @Test
    void deveAceitarValoresSemAspasEPropriedadesAusentes() {
        MockEnvironment ambiente = new MockEnvironment()
                .withProperty("koda.ia.provedor", "openai")
                .withProperty("koda.ia.url", "http://127.0.0.1:3001/v1")
                .withProperty("koda.ia.modelo", "auto:fast");

        assertThatCode(() -> VerificadorDeConfiguracao.verificar(ambiente)).doesNotThrowAnyException();
        assertThatCode(() -> VerificadorDeConfiguracao.verificar(new MockEnvironment())).doesNotThrowAnyException();
    }

    @Test
    void deveRecusarValorEntreAspasDuplasOuSimplesNomeandoAPropriedade() {
        MockEnvironment ambiente = new MockEnvironment()
                .withProperty("koda.ia.provedor", "\"openai\"")
                .withProperty("koda.ia.modelo", "'auto:fast'")
                .withProperty("koda.ia.url", "http://127.0.0.1:3001/v1");

        assertThatThrownBy(() -> VerificadorDeConfiguracao.verificar(ambiente))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("koda.ia.provedor")
                .hasMessageContaining("koda.ia.modelo")
                .hasMessageNotContaining("koda.ia.url");
    }

    @Test
    void naoDeveRepetirOValorDaConfiguracaoNaMensagem() {
        MockEnvironment ambiente = new MockEnvironment()
                .withProperty("koda.ia.chave", "\"freellmapi-segredo-super-importante\"");

        assertThatThrownBy(() -> VerificadorDeConfiguracao.verificar(ambiente))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("koda.ia.chave")
                .hasMessageNotContaining("segredo-super-importante");
    }

    @Test
    void naoDeveConfundirAspasNoMeioOuUmaAspaSoComValorQuebrado() {
        MockEnvironment ambiente = new MockEnvironment()
                .withProperty("koda.ia.modelo", "auto\"fast")
                .withProperty("koda.ia.url", "\"")
                .withProperty("koda.ia.chave", "'abc");

        assertThatCode(() -> VerificadorDeConfiguracao.verificar(ambiente)).doesNotThrowAnyException();
    }
}
