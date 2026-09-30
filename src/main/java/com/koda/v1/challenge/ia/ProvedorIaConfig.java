package com.koda.v1.challenge.ia;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
class ProvedorIaConfig {

    @Bean
    @ConditionalOnProperty(name = "koda.ia.provedor", havingValue = "falso", matchIfMissing = true)
    ProvedorIa provedorFalso() {
        return new ProvedorIaFalso();
    }

    @Bean
    @ConditionalOnProperty(name = "koda.ia.provedor", havingValue = "openai")
    ProvedorIa provedorCompativelComOpenAi(@Value("${koda.ia.url:}") String url,
                                           @Value("${koda.ia.chave:}") String chave,
                                           @Value("${koda.ia.modelo:}") String modelo,
                                           @Value("${koda.ia.tempo-maximo:PT60S}") Duration tempoMaximo,
                                           @Value("${koda.ia.tokens-maximos:1500}") int tokensMaximos,
                                           @Value("${koda.ia.temperatura:0.8}") double temperatura) {
        return new ProvedorIaCompativelComOpenAi(url, chave, modelo, tempoMaximo, tokensMaximos, temperatura);
    }
}
