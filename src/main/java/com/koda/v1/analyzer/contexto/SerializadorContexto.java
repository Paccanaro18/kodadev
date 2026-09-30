package com.koda.v1.analyzer.contexto;

import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

@Component
public class SerializadorContexto {

    private static final JsonMapper MAPEADOR = JsonMapper.builder().build();

    public String paraJson(ContextoProjeto contexto) {
        return MAPEADOR.writeValueAsString(contexto);
    }

    public ContextoProjeto deJson(String json) {
        return MAPEADOR.readValue(json, ContextoProjeto.class);
    }
}
