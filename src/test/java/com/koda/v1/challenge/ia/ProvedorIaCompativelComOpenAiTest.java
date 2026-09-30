package com.koda.v1.challenge.ia;

import com.koda.v1.challenge.prompt.PromptDesafio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.headerDoesNotExist;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class ProvedorIaCompativelComOpenAiTest {

    private static final String URL = "http://localhost:3001/v1/chat/completions";
    private static final String CHAVE = "chave-secreta-123";
    private static final PromptDesafio PROMPT = new PromptDesafio("regras do sistema", "pedido do usuário");

    private MockRestServiceServer servidor;
    private RestClient.Builder builder;
    private ProvedorIaCompativelComOpenAi provedor;

    @BeforeEach
    void preparar() {
        builder = RestClient.builder().baseUrl("http://localhost:3001/v1");
        servidor = MockRestServiceServer.bindTo(builder).build();
        provedor = new ProvedorIaCompativelComOpenAi(builder.build(), CHAVE, "auto", 1500, 0.8);
    }

    private String respostaCom(String conteudo) {
        return "{\"model\":\"gpt-de-teste\",\"choices\":[{\"message\":{\"role\":\"assistant\",\"content\":\"" + conteudo + "\"}}]}";
    }

    @Test
    void deveEnviarOPedidoNoFormatoDoChatCompletionsEDevolverOTexto() {
        servidor.expect(requestTo(URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "Bearer " + CHAVE))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.model").value("auto"))
                .andExpect(jsonPath("$.messages[0].role").value("system"))
                .andExpect(jsonPath("$.messages[0].content").value("regras do sistema"))
                .andExpect(jsonPath("$.messages[1].role").value("user"))
                .andExpect(jsonPath("$.messages[1].content").value("pedido do usuário"))
                .andExpect(jsonPath("$.temperature").value(0.8))
                .andExpect(jsonPath("$.max_tokens").value(1500))
                .andExpect(jsonPath("$.stream").value(false))
                .andRespond(withSuccess(respostaCom("texto do ticket"), MediaType.APPLICATION_JSON));

        RespostaIa resposta = provedor.gerar(PROMPT);

        assertThat(resposta.texto()).isEqualTo("texto do ticket");
        assertThat(resposta.modelo()).isEqualTo("gpt-de-teste");
        servidor.verify();
    }

    @Test
    void deveEnviarSoOsCamposEsperadosNoCorpo() {
        servidor.expect(requestTo(URL))
                .andExpect(jsonPath("$.length()").value(5))
                .andRespond(withSuccess(respostaCom("ok"), MediaType.APPLICATION_JSON));

        provedor.gerar(PROMPT);

        servidor.verify();
    }

    @Test
    void naoDeveEnviarCabecalhoDeAutorizacaoSemChave() {
        ProvedorIaCompativelComOpenAi semChave = new ProvedorIaCompativelComOpenAi(builder.build(), "  ", "auto", 100, 0.5);
        servidor.expect(requestTo(URL))
                .andExpect(headerDoesNotExist("Authorization"))
                .andRespond(withSuccess(respostaCom("ok"), MediaType.APPLICATION_JSON));

        assertThat(semChave.gerar(PROMPT).texto()).isEqualTo("ok");
    }

    @Test
    void devePreferirOModeloInformadoPeloRoteadorEIgnorarNomesSuspeitos() {
        servidor.expect(requestTo(URL)).andRespond(withSuccess(respostaCom("a"), MediaType.APPLICATION_JSON)
                .header("X-Routed-Via", "groq/llama-3.3-70b"));
        servidor.expect(requestTo(URL)).andRespond(withSuccess(respostaCom("b"), MediaType.APPLICATION_JSON)
                .header("X-Routed-Via", "modelo com espaços <script>"));
        servidor.expect(requestTo(URL)).andRespond(withSuccess(
                "{\"model\":\"<b>ruim</b>\",\"choices\":[{\"message\":{\"content\":\"c\"}}]}", MediaType.APPLICATION_JSON));

        assertThat(provedor.gerar(PROMPT).modelo()).isEqualTo("groq/llama-3.3-70b");
        assertThat(provedor.gerar(PROMPT).modelo()).isEqualTo("gpt-de-teste");
        assertThat(provedor.gerar(PROMPT).modelo()).isNull();
    }

    @Test
    void deveTraduzirOsStatusDeErroParaMotivosFixos() {
        esperarStatus(HttpStatus.UNAUTHORIZED, MotivoFalhaIa.NAO_AUTORIZADO);
        esperarStatus(HttpStatus.FORBIDDEN, MotivoFalhaIa.NAO_AUTORIZADO);
        esperarStatus(HttpStatus.TOO_MANY_REQUESTS, MotivoFalhaIa.LIMITE_ATINGIDO);
        esperarStatus(HttpStatus.INTERNAL_SERVER_ERROR, MotivoFalhaIa.INDISPONIVEL);
        esperarStatus(HttpStatus.BAD_GATEWAY, MotivoFalhaIa.INDISPONIVEL);
        esperarStatus(HttpStatus.NOT_FOUND, MotivoFalhaIa.INDISPONIVEL);
    }

    @Test
    void deveTratarFalhaDeConexaoComoIndisponivel() {
        servidor.expect(requestTo(URL)).andRespond(requisicao -> {
            throw new IOException("conexão recusada");
        });

        assertThatThrownBy(() -> provedor.gerar(PROMPT))
                .isInstanceOfSatisfying(ProvedorIaException.class,
                        e -> assertThat(e.getMotivo()).isEqualTo(MotivoFalhaIa.INDISPONIVEL));
    }

    @Test
    void deveRecusarRespostasSemTextoUtil() {
        String[] invalidas = {
                "isso não é json",
                "{}",
                "{\"choices\":[]}",
                "{\"choices\":[{\"message\":{}}]}",
                "{\"choices\":[{\"message\":{\"content\":null}}]}",
                "{\"choices\":[{\"message\":{\"content\":\"   \"}}]}",
                "{\"choices\":[{\"message\":{\"content\":42}}]}",
                "[1,2,3]"};

        for (String corpo : invalidas) {
            servidor.reset();
            servidor.expect(requestTo(URL)).andRespond(withSuccess(corpo, MediaType.APPLICATION_JSON));

            assertThatThrownBy(() -> provedor.gerar(PROMPT)).as(corpo)
                    .isInstanceOfSatisfying(ProvedorIaException.class,
                            e -> assertThat(e.getMotivo()).isEqualTo(MotivoFalhaIa.RESPOSTA_INVALIDA));
        }
    }

    @Test
    void deveRecusarRespostaMaiorQueOLimiteSemLerTudo() {
        String gigante = respostaCom("x".repeat(ProvedorIaCompativelComOpenAi.TAMANHO_MAXIMO_RESPOSTA_BYTES));
        servidor.expect(requestTo(URL)).andRespond(withSuccess(gigante, MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> provedor.gerar(PROMPT))
                .isInstanceOfSatisfying(ProvedorIaException.class,
                        e -> assertThat(e.getMotivo()).isEqualTo(MotivoFalhaIa.RESPOSTA_GRANDE_DEMAIS));
    }

    @Test
    void naoDeveVazarChavePromptNemCorpoDaRespostaNasMensagensDeErro() {
        PromptDesafio sigiloso = new PromptDesafio("sistema-secreto-xyz", "usuario-secreto-xyz");
        servidor.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("corpo-do-erro-secreto-xyz").contentType(MediaType.TEXT_PLAIN));
        servidor.expect(requestTo(URL)).andRespond(withSuccess("lixo-secreto-xyz", MediaType.APPLICATION_JSON));

        for (int i = 0; i < 2; i++) {
            assertThatThrownBy(() -> provedor.gerar(sigiloso))
                    .isInstanceOf(ProvedorIaException.class)
                    .satisfies(e -> {
                        String texto = e.getMessage() + " " + e + " " + e.getCause();
                        assertThat(texto).doesNotContain(CHAVE).doesNotContain("secreto-xyz");
                    });
        }
    }

    @Test
    void deveRecusarConfiguracaoInvalida() {
        RestClient cliente = builder.build();

        assertThatThrownBy(() -> new ProvedorIaCompativelComOpenAi(cliente, CHAVE, " ", 100, 0.5))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new ProvedorIaCompativelComOpenAi(cliente, CHAVE, "auto", 0, 0.5))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new ProvedorIaCompativelComOpenAi(cliente, CHAVE, "auto", 100, 2.5))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new ProvedorIaCompativelComOpenAi(cliente, CHAVE, "auto", 100, Double.NaN))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void deveValidarAUrlAoCriarOProvedorDeVerdade() {
        assertThatThrownBy(() -> new ProvedorIaCompativelComOpenAi(
                "http://exemplo.com/v1", CHAVE, "auto", Duration.ofSeconds(5), 100, 0.5))
                .isInstanceOf(IllegalArgumentException.class);
        assertThat(new ProvedorIaCompativelComOpenAi(
                "http://localhost:3001/v1/", CHAVE, "auto", Duration.ofSeconds(5), 100, 0.5)).isNotNull();
    }

    private void esperarStatus(HttpStatus status, MotivoFalhaIa esperado) {
        servidor.reset();
        servidor.expect(requestTo(URL)).andRespond(withStatus(status));

        assertThatThrownBy(() -> provedor.gerar(PROMPT)).as(status.toString())
                .isInstanceOfSatisfying(ProvedorIaException.class, e -> {
                    assertThat(e.getMotivo()).isEqualTo(esperado);
                    assertThat(e.getMessage()).isEqualTo(esperado.mensagem());
                });
    }
}
