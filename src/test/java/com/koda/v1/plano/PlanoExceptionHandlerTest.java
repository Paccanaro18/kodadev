package com.koda.v1.plano;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PlanoExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void preparar() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ControladorQueRecusa())
                .setControllerAdvice(new PlanoExceptionHandler())
                .build();
    }

    @Test
    void deveDevolver402ComCodigoQuandoACotaMensalAcabar() throws Exception {
        mockMvc.perform(get("/cota"))
                .andExpect(status().isPaymentRequired())
                .andExpect(jsonPath("$.codigo").value("COTA_MENSAL"))
                .andExpect(jsonPath("$.detail").value(containsString("3 tickets do plano Grátis")))
                .andExpect(jsonPath("$.detail").value(containsString("01/11/2026")));
    }

    @Test
    void deveDevolver402ComCodigoQuandoOLimiteDeRepositoriosAcabar() throws Exception {
        mockMvc.perform(get("/repositorios"))
                .andExpect(status().isPaymentRequired())
                .andExpect(jsonPath("$.codigo").value("LIMITE_DE_REPOSITORIOS"))
                .andExpect(jsonPath("$.detail").value(containsString("plano Grátis permite 1 repositório")));
    }

    @RestController
    static class ControladorQueRecusa {

        @GetMapping("/cota")
        String cota() {
            throw new CotaMensalExcedidaException(Plano.GRATIS, Instant.parse("2026-11-01T03:00:00Z"));
        }

        @GetMapping("/repositorios")
        String repositorios() {
            throw new LimiteDeRepositoriosExcedidoException(Plano.GRATIS);
        }
    }
}
