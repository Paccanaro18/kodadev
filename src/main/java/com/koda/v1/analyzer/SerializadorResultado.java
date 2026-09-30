package com.koda.v1.analyzer;

import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

@Component
public class SerializadorResultado {

    private static final JsonMapper MAPEADOR = JsonMapper.builder().build();

    public String paraJson(ResultadoAnalise resultado) {
        return MAPEADOR.writeValueAsString(resultado);
    }
}
