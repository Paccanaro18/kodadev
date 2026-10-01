package com.koda.v1.auth;

import com.koda.v1.challenge.TesteDeApiComSessao;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PerfilControllerTest extends TesteDeApiComSessao {

    @Test
    void deveExigirSessao() throws Exception {
        mockMvc.perform(get("/api/eu")).andExpect(status().isUnauthorized());
    }

    @Test
    void deveDevolverSoOQueATelaPrecisaDoPerfil() throws Exception {
        mockMvc.perform(get("/api/eu").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.login").value("artur"))
                .andExpect(jsonPath("$.nome").doesNotExist())
                .andExpect(jsonPath("$.id").doesNotExist())
                .andExpect(jsonPath("$.token").doesNotExist());
    }
}
