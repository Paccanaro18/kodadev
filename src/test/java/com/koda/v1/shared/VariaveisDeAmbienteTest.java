package com.koda.v1.shared;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.core.env.SystemEnvironmentPropertySource;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * O .env.example e o README prometem estes nomes de variável. Aqui se confere que cada um chega à propriedade que o
 * código lê (as duas de limite não têm placeholder no application.yml e dependem da regra de nomes do Spring).
 */
class VariaveisDeAmbienteTest {

    private StandardEnvironment ambienteCom(Map<String, Object> variaveis) {
        StandardEnvironment ambiente = new StandardEnvironment();
        ambiente.getPropertySources().replace(
                StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME,
                new SystemEnvironmentPropertySource(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME, variaveis));
        return ambiente;
    }

    @Test
    void deveLerOsLimitesDiariosPelasVariaveisDoEnvExample() {
        StandardEnvironment ambiente = ambienteCom(Map.of(
                "KODA_DESAFIO_LIMITE_DIARIO", "7",
                "KODA_DICA_LIMITE_DIARIO", "12"));

        assertThat(ambiente.getProperty("koda.desafio.limite-diario")).isEqualTo("7");
        assertThat(ambiente.getProperty("koda.dica.limite-diario")).isEqualTo("12");
    }

    @Test
    void deveLerOsDemaisValoresDeConfiguracaoPelasVariaveisDoEnvExample() {
        StandardEnvironment ambiente = ambienteCom(Map.of(
                "KODA_IA_PROVEDOR", "openai",
                "KODA_IA_URL", "http://127.0.0.1:3001/v1",
                "KODA_IA_MODELO", "auto",
                "KODA_IA_CHAVE", "chave-de-teste"));

        assertThat(ambiente.resolvePlaceholders("${KODA_IA_PROVEDOR}")).isEqualTo("openai");
        assertThat(ambiente.resolvePlaceholders("${KODA_IA_URL}")).isEqualTo("http://127.0.0.1:3001/v1");
        assertThat(ambiente.resolvePlaceholders("${KODA_IA_MODELO}")).isEqualTo("auto");
        assertThat(ambiente.resolvePlaceholders("${KODA_IA_CHAVE}")).isEqualTo("chave-de-teste");
    }
}
