package com.koda.v1.challenge;

import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

@Component
public class SerializadorConteudo {

    private static final JsonMapper MAPEADOR = JsonMapper.builder().build();

    public String paraJson(ConteudoDesafio conteudo) {
        return MAPEADOR.writeValueAsString(conteudo);
    }

    public ConteudoDesafio deJson(String json) {
        return MAPEADOR.readValue(json, ConteudoDesafio.class);
    }
}
