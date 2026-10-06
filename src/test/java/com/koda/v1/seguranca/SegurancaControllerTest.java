package com.koda.v1.seguranca;

import com.koda.v1.challenge.TesteDeApiComSessao;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.ResultActions;

import java.util.UUID;

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;

@TestPropertySource(properties = "koda.seguranca.desafios=classpath:seguranca-teste/*.json")
class SegurancaControllerTest extends TesteDeApiComSessao {

    private static final String FLAG_UM = "KODA{teste_um}";
    private static final String FLAG_DOIS = "KODA{teste_dois}";

    @Autowired
    private ResolucaoDeSegurancaRepository resolucoes;

    @Autowired
    private TentativaDeSegurancaRepository tentativas;

    @Test
    void deveExigirSessao() throws Exception {
        mockMvc.perform(get("/api/seguranca/desafios")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/seguranca/desafios/teste-um")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/seguranca/placar")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/seguranca/desafios/teste-um/flag").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveExigirTokenCsrfAoEnviarFlag() throws Exception {
        mockMvc.perform(post("/api/seguranca/desafios/teste-um/flag").session(sessao)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"flag\":\"x\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveListarOsDesafiosSemExporSegredos() throws Exception {
        mockMvc.perform(get("/api/seguranca/desafios").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].slug").value("teste-um"))
                .andExpect(jsonPath("$[0].categoria").value("LOGS"))
                .andExpect(jsonPath("$[0].dificuldade").value("FACIL"))
                .andExpect(jsonPath("$[0].pontos").value(100))
                .andExpect(jsonPath("$[0].resolvido").value(false))
                .andExpect(jsonPath("$[1].pontos").value(300))
                .andExpect(content().string(not(containsString("flagHash"))))
                .andExpect(content().string(not(containsString("solucao"))))
                .andExpect(content().string(not(containsString("conteudo secreto"))));
    }

    @Test
    void deveDetalharSemMostrarASolucaoEnquantoNaoResolver() throws Exception {
        mockMvc.perform(get("/api/seguranca/desafios/teste-um").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Teste um"))
                .andExpect(jsonPath("$.enunciado[0]").value("Enunciado de Teste um"))
                .andExpect(jsonPath("$.formatoDaFlag").value("KODA{...}"))
                .andExpect(jsonPath("$.artefatos[0].nome").value("a.txt"))
                .andExpect(jsonPath("$.artefatos[0].conteudo").value("conteudo secreto de teste"))
                .andExpect(jsonPath("$.dicas.length()").value(2))
                .andExpect(jsonPath("$.resolvido").value(false))
                .andExpect(jsonPath("$.solucao", nullValue()))
                .andExpect(content().string(not(containsString("flagHash"))));
    }

    @Test
    void deveDevolver404ParaDesafioInexistente() throws Exception {
        mockMvc.perform(get("/api/seguranca/desafios/nao-existe").session(sessao)).andExpect(status().isNotFound());
        enviar(sessao, "nao-existe", "KODA{x}").andExpect(status().isNotFound());
    }

    @Test
    void deveRecusarFlagErradaSemDarPontos() throws Exception {
        enviar(sessao, "teste-um", "KODA{errada}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correta").value(false))
                .andExpect(jsonPath("$.jaResolvido").value(false))
                .andExpect(jsonPath("$.pontosGanhos").value(0));

        mockMvc.perform(get("/api/seguranca/desafios/teste-um").session(sessao)).andExpect(jsonPath("$.resolvido").value(false));
        assertThat(resolucoes.findByUsuarioId(usuarioId)).isEmpty();
    }

    @Test
    void deveAceitarAFlagCertaEPontuarPorDificuldade() throws Exception {
        enviar(sessao, "teste-um", FLAG_UM)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correta").value(true))
                .andExpect(jsonPath("$.jaResolvido").value(false))
                .andExpect(jsonPath("$.pontosGanhos").value(100));
        enviar(sessao, "teste-dois", FLAG_DOIS)
                .andExpect(jsonPath("$.pontosGanhos").value(300));

        assertThat(resolucoes.findByUsuarioId(usuarioId)).hasSize(2).allSatisfy(resolucao -> {
            assertThat(resolucao.getUsuarioId()).isEqualTo(usuarioId);
            assertThat(resolucao.getId()).isNotNull();
            assertThat(resolucao.getResolvidoEm()).isNotNull();
        });
        assertThat(resolucoes.findByUsuarioId(usuarioId)).extracting(ResolucaoDeSeguranca::getPontos).containsExactlyInAnyOrder(100, 300);
    }

    @Test
    void deveIgnorarEspacosNasPontasDaFlag() throws Exception {
        enviar(sessao, "teste-um", "   " + FLAG_UM + "  \n")
                .andExpect(jsonPath("$.correta").value(true));
    }

    @Test
    void deveDiferenciarMaiusculasDeMinusculas() throws Exception {
        enviar(sessao, "teste-um", FLAG_UM.toLowerCase()).andExpect(jsonPath("$.correta").value(false));
    }

    @Test
    void deveLiberarASolucaoEMarcarComoResolvidoDepoisDeAcertar() throws Exception {
        enviar(sessao, "teste-um", FLAG_UM).andExpect(status().isOk());

        mockMvc.perform(get("/api/seguranca/desafios/teste-um").session(sessao))
                .andExpect(jsonPath("$.resolvido").value(true))
                .andExpect(jsonPath("$.solucao[0]").value("Solução de Teste um"));
        mockMvc.perform(get("/api/seguranca/desafios").session(sessao))
                .andExpect(jsonPath("$[0].resolvido").value(true))
                .andExpect(jsonPath("$[1].resolvido").value(false));
    }

    @Test
    void naoDeveDarPontosDeNovoAoReenviarAFlagCerta() throws Exception {
        enviar(sessao, "teste-um", FLAG_UM).andExpect(jsonPath("$.pontosGanhos").value(100));

        enviar(sessao, "teste-um", FLAG_UM)
                .andExpect(jsonPath("$.correta").value(true))
                .andExpect(jsonPath("$.jaResolvido").value(true))
                .andExpect(jsonPath("$.pontosGanhos").value(0));
        enviar(sessao, "teste-um", "KODA{outra}")
                .andExpect(jsonPath("$.correta").value(false))
                .andExpect(jsonPath("$.jaResolvido").value(true));

        assertThat(resolucoes.findByUsuarioId(usuarioId)).hasSize(1);
    }

    @Test
    void deveRecusarFlagVaziaOuGrandeDemais() throws Exception {
        enviar(sessao, "teste-um", "   ").andExpect(status().isBadRequest());
        enviar(sessao, "teste-um", "K".repeat(201)).andExpect(status().isBadRequest());
        mockMvc.perform(post("/api/seguranca/desafios/teste-um/flag").session(sessao).header("X-CSRF-TOKEN", token(sessao))
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/api/seguranca/desafios/teste-um/flag").session(sessao).header("X-CSRF-TOKEN", token(sessao))
                        .contentType(MediaType.APPLICATION_JSON).content("{\"flag\":null}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deveBarrarDepoisDeErrosDemaisEContarSoOsDaJanela() throws Exception {
        for (int i = 0; i < SegurancaService.LIMITE_DE_ERROS_NA_JANELA; i++) {
            enviar(sessao, "teste-um", "KODA{erro" + i + "}").andExpect(status().isOk());
        }

        enviar(sessao, "teste-um", "KODA{mais-um}").andExpect(status().isTooManyRequests());
        enviar(sessao, "teste-dois", FLAG_DOIS).andExpect(status().isTooManyRequests());
        assertThat(tentativas.count()).isEqualTo(SegurancaService.LIMITE_DE_ERROS_NA_JANELA);

        jdbc.update("UPDATE tentativas_seguranca SET criado_em = now() - interval '11 minutes' WHERE usuario_id = ?", usuarioId);
        enviar(sessao, "teste-um", FLAG_UM).andExpect(status().isOk()).andExpect(jsonPath("$.correta").value(true));
    }

    @Test
    void naoDeveBarrarOutraPessoaNemQuemJaResolveuOMesmoDesafio() throws Exception {
        for (int i = 0; i < SegurancaService.LIMITE_DE_ERROS_NA_JANELA; i++) {
            enviar(sessao, "teste-dois", "KODA{erro" + i + "}");
        }
        MockHttpSession outra = novaPessoa("outra");

        enviar(outra, "teste-dois", FLAG_DOIS).andExpect(status().isOk()).andExpect(jsonPath("$.correta").value(true));
        enviar(outra, "teste-dois", "KODA{qualquer}").andExpect(status().isOk());
    }

    @Test
    void deveMostrarOPlacarComAsPessoasOrdenadasPelosPontos() throws Exception {
        MockHttpSession bia = novaPessoa("bia");
        MockHttpSession caio = novaPessoa("caio");
        enviar(sessao, "teste-um", FLAG_UM);
        enviar(bia, "teste-um", FLAG_UM);
        enviar(bia, "teste-dois", FLAG_DOIS);
        novaPessoa("sem-pontos");

        mockMvc.perform(get("/api/seguranca/placar").session(caio))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.melhores.length()").value(2))
                .andExpect(jsonPath("$.melhores[0].posicao").value(1))
                .andExpect(jsonPath("$.melhores[0].login").value("bia"))
                .andExpect(jsonPath("$.melhores[0].pontos").value(400))
                .andExpect(jsonPath("$.melhores[0].resolvidos").value(2))
                .andExpect(jsonPath("$.melhores[1].login").value("artur"))
                .andExpect(jsonPath("$.melhores[1].posicao").value(2))
                .andExpect(jsonPath("$.voce", nullValue()));
        mockMvc.perform(get("/api/seguranca/placar").session(sessao))
                .andExpect(jsonPath("$.voce.posicao").value(2))
                .andExpect(jsonPath("$.voce.login").value("artur"))
                .andExpect(jsonPath("$.voce.pontos").value(100));
    }

    @Test
    void deveDesempatarPeloQueResolveuPrimeiro() throws Exception {
        MockHttpSession bia = novaPessoa("bia");
        enviar(bia, "teste-um", FLAG_UM);
        enviar(sessao, "teste-um", FLAG_UM);
        jdbc.update("UPDATE resolucoes_seguranca SET resolvido_em = now() - interval '1 hour' WHERE usuario_id = ?", usuarioId);

        mockMvc.perform(get("/api/seguranca/placar").session(sessao))
                .andExpect(jsonPath("$.melhores[0].login").value("artur"))
                .andExpect(jsonPath("$.melhores[1].login").value("bia"));
    }

    @Test
    void deveLimitarOPlacarAosDezMelhoresMasMostrarAPosicaoDeQuemEstaFora() throws Exception {
        for (int i = 0; i < 11; i++) {
            UUID pessoa = criarUsuario(githubId + 100 + i, "p" + String.format("%02d", i));
            jdbc.update("INSERT INTO resolucoes_seguranca (usuario_id, desafio_slug, pontos) VALUES (?, 'teste-dois', 300)", pessoa);
        }
        enviar(sessao, "teste-um", FLAG_UM);

        mockMvc.perform(get("/api/seguranca/placar").session(sessao))
                .andExpect(jsonPath("$.melhores.length()").value(SegurancaService.TAMANHO_DO_PLACAR))
                .andExpect(jsonPath("$.voce.posicao").value(12))
                .andExpect(jsonPath("$.voce.pontos").value(100));
    }

    private MockHttpSession novaPessoa(String login) {
        long id = githubId + login.hashCode() % 1000 + 5000;
        criarUsuario(id, login);
        return sessaoDe(id, login);
    }

    private ResultActions enviar(MockHttpSession daSessao, String slug, String flag) throws Exception {
        String corpo = leitor.writeValueAsString(new EnvioDeFlag(flag));
        return mockMvc.perform(post("/api/seguranca/desafios/" + slug + "/flag").session(daSessao)
                .header("X-CSRF-TOKEN", token(daSessao))
                .contentType(MediaType.APPLICATION_JSON).content(corpo));
    }
}
