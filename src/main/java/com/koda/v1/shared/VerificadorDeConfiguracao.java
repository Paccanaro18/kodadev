package com.koda.v1.shared;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

import java.util.ArrayList;
import java.util.List;

/**
 * Recusa subir se algum valor de configuração sensível vier entre aspas. O Spring lê o {@code .env} como arquivo de
 * propriedades e não tira as aspas: {@code KODA_IA_PROVEDOR="openai"} vira o texto {@code "openai"} (com as aspas),
 * nenhum provedor casa e o erro aparece longe da causa. Aqui o erro é claro e nunca imprime o valor.
 */
public class VerificadorDeConfiguracao implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    static final List<String> PROPRIEDADES = List.of(
            "koda.ia.provedor",
            "koda.ia.url",
            "koda.ia.chave",
            "koda.ia.modelo",
            "koda.seguranca.chave-criptografia",
            "spring.security.oauth2.client.registration.github.client-id",
            "spring.security.oauth2.client.registration.github.client-secret",
            "spring.datasource.username",
            "spring.datasource.password");

    @Override
    public void initialize(ConfigurableApplicationContext contexto) {
        verificar(contexto.getEnvironment());
    }

    static void verificar(Environment ambiente) {
        List<String> comAspas = new ArrayList<>();
        for (String propriedade : PROPRIEDADES) {
            if (temAspas(ambiente.getProperty(propriedade))) {
                comAspas.add(propriedade);
            }
        }
        if (!comAspas.isEmpty()) {
            throw new IllegalStateException("Estas configurações estão entre aspas: " + String.join(", ", comAspas)
                    + ". O Spring não remove as aspas do .env. Escreva o valor sem aspas, por exemplo "
                    + "KODA_IA_PROVEDOR=openai.");
        }
    }

    private static boolean temAspas(String valor) {
        if (valor == null) {
            return false;
        }
        String limpo = valor.strip();
        if (limpo.length() < 2) {
            return false;
        }
        char primeiro = limpo.charAt(0);
        return (primeiro == '"' || primeiro == '\'') && limpo.charAt(limpo.length() - 1) == primeiro;
    }
}
