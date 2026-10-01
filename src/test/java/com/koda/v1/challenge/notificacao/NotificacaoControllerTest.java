package com.koda.v1.challenge.notificacao;

import com.koda.v1.challenge.TesteDeApiComSessao;
import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.persistence.RegistroProgresso;
import com.koda.v1.challenge.persistence.StatusProgresso;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.ResultActions;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class NotificacaoControllerTest extends TesteDeApiComSessao {

    @Autowired
    private RegistroProgresso progresso;

    private UUID analise;

    @BeforeEach
    void preparar() {
        analise = criarAnalise(usuarioId, "repo");
    }

    @Test
    void deveExigirSessaoETokenParaMarcarComoLida() throws Exception {
        mockMvc.perform(get("/api/notificacoes")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/notificacoes/lidas")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/notificacoes/lidas").session(sessao)).andExpect(status().isForbidden());
        mockMvc.perform(post("/api/notificacoes/" + UUID.randomUUID() + "/lida").session(sessao))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveNotificarTicketProntoGeracaoQueFalhouEConclusaoMasNaoIniciarNemReabrir() throws Exception {
        UUID pronto = criarPronto("A");
        UUID falhou = registro.registrarNovo(usuarioId, analise, TipoDesafio.BUG, "BUG_B", "CLASSE:B", "p");
        registro.falhar(falhou, "erro");
        progresso.mudar(usuarioId, pronto, StatusProgresso.EM_ANDAMENTO);
        progresso.mudar(usuarioId, pronto, StatusProgresso.CONCLUIDO);
        progresso.mudar(usuarioId, pronto, StatusProgresso.EM_ANDAMENTO);
        entityManager.flush();

        mockMvc.perform(get("/api/notificacoes").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.naoLidas").value(3))
                .andExpect(jsonPath("$.itens.length()").value(3))
                .andExpect(jsonPath("$.itens[?(@.tipo == 'PROGRESSO_INICIADO')]").isEmpty())
                .andExpect(jsonPath("$.itens[?(@.tipo == 'PROGRESSO_REABERTO')]").isEmpty())
                .andExpect(jsonPath("$.itens[?(@.tipo == 'DESAFIO_FALHOU')].codigo").value("DEV-002"))
                .andExpect(jsonPath("$.itens[?(@.tipo == 'DESAFIO_PRONTO')].codigo").value("DEV-001"))
                .andExpect(jsonPath("$.itens[0].lida").value(false));
    }

    @Test
    void deveMarcarUmaNotificacaoComoLidaSemMexerNasOutras() throws Exception {
        criarPronto("A");
        criarPronto("B");
        UUID primeira = primeiroId();

        marcarUma(sessao, primeira).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/notificacoes").session(sessao))
                .andExpect(jsonPath("$.naoLidas").value(1))
                .andExpect(jsonPath("$.itens.length()").value(2));
        // Marcar de novo é inofensivo.
        marcarUma(sessao, primeira).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/notificacoes").session(sessao)).andExpect(jsonPath("$.naoLidas").value(1));
    }

    @Test
    void deveMarcarTodasComoLidas() throws Exception {
        criarPronto("A");
        criarPronto("B");

        mockMvc.perform(post("/api/notificacoes/lidas").session(sessao).header("X-CSRF-TOKEN", token(sessao)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/notificacoes").session(sessao))
                .andExpect(jsonPath("$.naoLidas").value(0))
                .andExpect(jsonPath("$.itens[0].lida").value(true))
                .andExpect(jsonPath("$.itens[1].lida").value(true));
    }

    @Test
    void deveTratarNotificacaoDeOutraPessoaOuInexistenteComo404SemAlterarNada() throws Exception {
        criarPronto("A");
        UUID doUsuario = primeiroId();
        UUID outro = criarUsuario(githubId + 1, "outra");
        MockHttpSession sessaoDoOutro = sessaoDe(githubId + 1, "outra");

        marcarUma(sessaoDoOutro, doUsuario).andExpect(status().isNotFound());
        marcarUma(sessao, UUID.randomUUID()).andExpect(status().isNotFound());
        mockMvc.perform(post("/api/notificacoes/lidas").session(sessaoDoOutro)
                .header("X-CSRF-TOKEN", token(sessaoDoOutro))).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/notificacoes").session(sessao)).andExpect(jsonPath("$.naoLidas").value(1));
        mockMvc.perform(get("/api/notificacoes").session(sessaoDoOutro))
                .andExpect(jsonPath("$.naoLidas").value(0))
                .andExpect(jsonPath("$.itens.length()").value(0));
        assertThat(outro).isNotNull();
    }

    @Test
    void deveLimitarAListaMasContarTodasAsNaoLidas() throws Exception {
        for (int i = 0; i < ConsultaNotificacoes.MAXIMO_DE_ITENS + 3; i++) {
            criarPronto("T" + i);
        }

        mockMvc.perform(get("/api/notificacoes").session(sessao))
                .andExpect(jsonPath("$.itens.length()").value(ConsultaNotificacoes.MAXIMO_DE_ITENS))
                .andExpect(jsonPath("$.naoLidas").value(ConsultaNotificacoes.MAXIMO_DE_ITENS + 3));
    }

    @Test
    void deveDevolverListaVaziaSemEventos() throws Exception {
        mockMvc.perform(get("/api/notificacoes").session(sessao))
                .andExpect(jsonPath("$.naoLidas").value(0))
                .andExpect(jsonPath("$.itens.length()").value(0));
    }

    private ResultActions marcarUma(MockHttpSession daSessao, UUID id) throws Exception {
        return mockMvc.perform(post("/api/notificacoes/" + id + "/lida").session(daSessao)
                .header("X-CSRF-TOKEN", token(daSessao)));
    }

    private UUID primeiroId() {
        return jdbc.queryForObject(
                "SELECT id FROM eventos_desafio WHERE usuario_id = ? ORDER BY criado_em ASC, id ASC LIMIT 1",
                UUID.class, usuarioId);
    }

    private UUID criarPronto(String sufixo) {
        UUID id = registro.registrarNovo(usuarioId, analise, TipoDesafio.FEATURE, "ANGULO_" + sufixo,
                "CLASSE:" + sufixo, "p");
        registro.iniciar(id);
        registro.concluir(id, "Título " + sufixo, serializadorConteudo.paraJson(conteudo(sufixo, List.of("H"))), 1, "m");
        entityManager.flush();
        return id;
    }
}
