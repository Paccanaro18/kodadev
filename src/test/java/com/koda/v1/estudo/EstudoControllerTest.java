package com.koda.v1.estudo;

import com.koda.v1.challenge.TesteDeApiComSessao;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class EstudoControllerTest extends TesteDeApiComSessao {

    @Test
    void deveExigirSessao() throws Exception {
        mockMvc.perform(get("/api/estudo")).andExpect(status().isUnauthorized());
        mockMvc.perform(put("/api/estudo/java/primeiros-passos").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/estudo/importacao").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveExigirTokenCsrfNasEscritas() throws Exception {
        mockMvc.perform(put("/api/estudo/java/primeiros-passos").session(sessao)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"licaoLida\":true}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/estudo/importacao").session(sessao)
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveComecarVazio() throws Exception {
        mockMvc.perform(get("/api/estudo").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trilhas").isEmpty());
    }

    @Test
    void deveGuardarEDevolverOProgressoDeUmItem() throws Exception {
        registrar(sessao, "java", "primeiros-passos", "{\"licaoLida\":true,\"nota\":0.85}");
        registrar(sessao, "java", "fluxo-metodos-e-arrays", "{\"desafioDeclarado\":true}");
        registrar(sessao, "python", "fundamentos-da-linguagem", "{\"licaoLida\":true}");

        mockMvc.perform(get("/api/estudo").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trilhas.java.licoes[0]").value("primeiros-passos"))
                .andExpect(jsonPath("$.trilhas.java.notas['primeiros-passos']").value(0.85))
                .andExpect(jsonPath("$.trilhas.java.desafios[0]").value("fluxo-metodos-e-arrays"))
                .andExpect(jsonPath("$.trilhas.python.licoes[0]").value("fundamentos-da-linguagem"))
                .andExpect(jsonPath("$.trilhas.python.notas").isEmpty());
    }

    @Test
    void deveManterSoAMelhorNotaEPermitirDesmarcar() throws Exception {
        registrar(sessao, "java", "primeiros-passos", "{\"nota\":0.8,\"licaoLida\":true}");
        registrar(sessao, "java", "primeiros-passos", "{\"nota\":0.5}");
        registrar(sessao, "java", "primeiros-passos", "{\"licaoLida\":false}");

        mockMvc.perform(get("/api/estudo").session(sessao))
                .andExpect(jsonPath("$.trilhas.java.notas['primeiros-passos']").value(0.8))
                .andExpect(jsonPath("$.trilhas.java.licoes").isEmpty());
    }

    @Test
    void naoDeveMostrarItemSemNadaRegistrado() throws Exception {
        registrar(sessao, "java", "primeiros-passos", "{\"licaoLida\":true}");
        registrar(sessao, "java", "primeiros-passos", "{\"licaoLida\":false}");

        mockMvc.perform(get("/api/estudo").session(sessao))
                .andExpect(jsonPath("$.trilhas").isEmpty());
    }

    @Test
    void deveRecusarIdentificadoresEValoresInvalidos() throws Exception {
        tentar(sessao, "Java", "primeiros-passos", "{\"licaoLida\":true}", 400);
        tentar(sessao, "java", "com_underline", "{\"licaoLida\":true}", 400);
        tentar(sessao, "java", "a".repeat(101), "{\"licaoLida\":true}", 400);
        tentar(sessao, "t".repeat(61), "primeiros-passos", "{\"licaoLida\":true}", 400);
        tentar(sessao, "java", "primeiros-passos", "{\"nota\":1.5}", 400);
        tentar(sessao, "java", "primeiros-passos", "{\"nota\":-0.1}", 400);
        tentar(sessao, "java", "primeiros-passos", "texto", 400);
    }

    @Test
    void deveSepararOProgressoDeCadaPessoa() throws Exception {
        long outroGithubId = githubId + 1;
        criarUsuario(outroGithubId, "outra");
        MockHttpSession sessaoDaOutra = sessaoDe(outroGithubId, "outra");

        registrar(sessao, "java", "primeiros-passos", "{\"licaoLida\":true}");
        registrar(sessaoDaOutra, "java", "fluxo-metodos-e-arrays", "{\"nota\":1.0}");

        mockMvc.perform(get("/api/estudo").session(sessao))
                .andExpect(jsonPath("$.trilhas.java.licoes.length()").value(1))
                .andExpect(jsonPath("$.trilhas.java.notas").isEmpty());
        mockMvc.perform(get("/api/estudo").session(sessaoDaOutra))
                .andExpect(jsonPath("$.trilhas.java.licoes").isEmpty())
                .andExpect(jsonPath("$.trilhas.java.notas['fluxo-metodos-e-arrays']").value(1.0));
    }

    @Test
    void deveImportarJuntandoOQueJaExiste() throws Exception {
        registrar(sessao, "java", "primeiros-passos", "{\"nota\":0.9}");
        registrar(sessao, "java", "fluxo-metodos-e-arrays", "{\"licaoLida\":true}");

        String corpo = "{\"trilhas\":{\"java\":{\"licoes\":[\"primeiros-passos\"],\"notas\":{\"primeiros-passos\":0.6,"
                + "\"checkpoint-fundamentos\":0.75},\"desafios\":[\"primeiros-passos\"]},"
                + "\"python\":{\"licoes\":[\"fundamentos-da-linguagem\"],\"notas\":{},\"desafios\":[]}}}";
        mockMvc.perform(post("/api/estudo/importacao").session(sessao).header("X-CSRF-TOKEN", token(sessao))
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trilhas.java.licoes.length()").value(2))
                .andExpect(jsonPath("$.trilhas.java.notas['primeiros-passos']").value(0.9))
                .andExpect(jsonPath("$.trilhas.java.notas['checkpoint-fundamentos']").value(0.75))
                .andExpect(jsonPath("$.trilhas.java.desafios[0]").value("primeiros-passos"))
                .andExpect(jsonPath("$.trilhas.python.licoes[0]").value("fundamentos-da-linguagem"));
    }

    @Test
    void deveRecusarImportacaoInvalida() throws Exception {
        importar("{\"trilhas\":{\"Java\":{\"licoes\":[\"x\"]}}}", 400);
        importar("{\"trilhas\":{\"java\":{\"licoes\":[\"INVALIDO\"]}}}", 400);
        importar("{\"trilhas\":{\"java\":{\"desafios\":[\"com espaco\"]}}}", 400);
        importar("{\"trilhas\":{\"java\":{\"notas\":{\"x\":2}}}}", 400);
        importar("{\"trilhas\":{\"java\":{\"notas\":{\"INVALIDO\":0.5}}}}", 400);
        importar("[1,2]", 400);
    }

    @Test
    void deveIgnorarValoresNulosNaImportacao() throws Exception {
        importar("{\"trilhas\":{\"java\":{\"licoes\":[null,\"primeiros-passos\"],\"notas\":{\"x\":null},\"desafios\":null},\"ruim\":null}}", 200);

        mockMvc.perform(get("/api/estudo").session(sessao))
                .andExpect(jsonPath("$.trilhas.java.licoes.length()").value(1))
                .andExpect(jsonPath("$.trilhas.ruim").doesNotExist());
    }

    @Test
    void deveRecusarImportacaoComTrilhasOuItensDemais() throws Exception {
        StringBuilder trilhas = new StringBuilder("{\"trilhas\":{");
        for (int i = 0; i <= EstudoService.LIMITE_DE_TRILHAS_NA_IMPORTACAO; i++) {
            trilhas.append(i == 0 ? "" : ",").append("\"t").append(i).append("\":{\"licoes\":[\"a\"]}");
        }
        importar(trilhas.append("}}").toString(), 400);

        StringBuilder itens = new StringBuilder("{\"trilhas\":{\"java\":{\"licoes\":[");
        for (int i = 0; i <= EstudoService.LIMITE_DE_ITENS_POR_TRILHA_NA_IMPORTACAO; i++) {
            itens.append(i == 0 ? "" : ",").append("\"item-").append(i).append("\"");
        }
        importar(itens.append("]}}}").toString(), 400);
    }

    @Test
    void deveBarrarMaisItensQueOLimiteDaPessoa() throws Exception {
        for (int i = 0; i < EstudoService.LIMITE_DE_ITENS_POR_USUARIO; i++) {
            jdbc.update("INSERT INTO progresso_estudo (usuario_id, trilha, item, licao_lida) VALUES (?, 'java', ?, true)",
                    usuarioId, "item-" + i);
        }

        tentar(sessao, "java", "item-novo", "{\"licaoLida\":true}", 422);
        tentar(sessao, "java", "item-0", "{\"nota\":0.5}", 204);
    }

    private void registrar(MockHttpSession daSessao, String trilha, String item, String corpo) throws Exception {
        tentar(daSessao, trilha, item, corpo, 204);
    }

    private void tentar(MockHttpSession daSessao, String trilha, String item, String corpo, int esperado) throws Exception {
        mockMvc.perform(put("/api/estudo/" + trilha + "/" + item).session(daSessao)
                        .header("X-CSRF-TOKEN", token(daSessao))
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().is(esperado));
    }

    private void importar(String corpo, int esperado) throws Exception {
        mockMvc.perform(post("/api/estudo/importacao").session(sessao).header("X-CSRF-TOKEN", token(sessao))
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().is(esperado));
    }
}
