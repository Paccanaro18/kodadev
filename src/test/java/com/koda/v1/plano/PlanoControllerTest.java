package com.koda.v1.plano;

import com.koda.v1.challenge.TesteDeApiComSessao;
import com.koda.v1.challenge.TipoDesafio;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PlanoControllerTest extends TesteDeApiComSessao {

    @Test
    void deveExigirSessao() throws Exception {
        mockMvc.perform(get("/api/plano")).andExpect(status().isUnauthorized());
    }

    @Test
    void deveComecarNoPlanoGratisSemUso() throws Exception {
        mockMvc.perform(get("/api/plano").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plano").value("GRATIS"))
                .andExpect(jsonPath("$.nome").value("Grátis"))
                .andExpect(jsonPath("$.ticketsPorMes").value(3))
                .andExpect(jsonPath("$.ticketsUsados").value(0))
                .andExpect(jsonPath("$.repositorios").value(1))
                .andExpect(jsonPath("$.repositoriosUsados").value(0))
                .andExpect(jsonPath("$.renovaEm").isNotEmpty())
                .andExpect(jsonPath("$.planos[0].plano").value("GRATIS"))
                .andExpect(jsonPath("$.planos[1].plano").value("PRO"))
                .andExpect(jsonPath("$.planos[1].ticketsPorMes").value(60));
    }

    @Test
    void deveContarOsTicketsDoMesEOsRepositoriosDoUsuario() throws Exception {
        UUID analiseId = criarAnalise(usuarioId, "koda");
        gastarCota(analiseId, 2);

        mockMvc.perform(get("/api/plano").session(sessao))
                .andExpect(jsonPath("$.ticketsUsados").value(2))
                .andExpect(jsonPath("$.repositoriosUsados").value(1));
    }

    @Test
    void naoDeveContarTicketsNemRepositoriosDeOutraPessoa() throws Exception {
        UUID outro = criarUsuario(githubId + 1, "outra");
        gastarCota(criarAnalise(outro, "dela"), 3);

        mockMvc.perform(get("/api/plano").session(sessao))
                .andExpect(jsonPath("$.ticketsUsados").value(0))
                .andExpect(jsonPath("$.repositoriosUsados").value(0));
    }

    @Test
    void deveMostrarOPlanoProQuandoHouverAssinaturaVigente() throws Exception {
        jdbc.update("INSERT INTO assinaturas (usuario_id, plano) VALUES (?, 'PRO')", usuarioId);

        mockMvc.perform(get("/api/plano").session(sessao))
                .andExpect(jsonPath("$.plano").value("PRO"))
                .andExpect(jsonPath("$.ticketsPorMes").value(60))
                .andExpect(jsonPath("$.repositorios").value(20));
    }

    @Test
    void deveVoltarParaGratisQuandoAAssinaturaVencer() throws Exception {
        jdbc.update("INSERT INTO assinaturas (usuario_id, plano, iniciada_em, expira_em) "
                + "VALUES (?, 'PRO', now() - interval '40 days', now() - interval '10 days')", usuarioId);

        mockMvc.perform(get("/api/plano").session(sessao))
                .andExpect(jsonPath("$.plano").value("GRATIS"));
    }

    private void gastarCota(UUID analiseId, int quantidade) {
        for (int i = 0; i < quantidade; i++) {
            UUID dono = jdbc.queryForObject("SELECT r.usuario_id FROM analises_projeto a "
                    + "JOIN repositorios r ON r.id = a.repositorio_id WHERE a.id = ?", UUID.class, analiseId);
            UUID desafio = registro.registrarNovo(dono, analiseId, TipoDesafio.FEATURE,
                    "ANGULO_" + i, "CLASSE:" + i, "perspectiva");
            registro.iniciar(desafio);
            registro.concluir(desafio, "Título " + i, serializadorConteudo.paraJson(conteudo("t" + i, java.util.List.of("h"))), 1, null);
        }
        entityManager.flush();
    }
}
