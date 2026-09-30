package com.koda.v1.challenge.ia;

import com.koda.v1.challenge.prompt.PromptDesafio;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

public class ProvedorIaCompativelComOpenAi implements ProvedorIa {

    static final int TAMANHO_MAXIMO_RESPOSTA_BYTES = 256 * 1024;

    private static final String CAMINHO = "/chat/completions";
    private static final String CABECALHO_DE_ROTEAMENTO = "X-Routed-Via";
    private static final Pattern NOME_DE_MODELO = Pattern.compile("[A-Za-z0-9._:/-]{1,80}");
    private static final JsonMapper MAPEADOR = JsonMapper.builder().build();

    private final RestClient restClient;
    private final String modelo;
    private final String chave;
    private final double temperatura;
    private final int tokensMaximos;

    public ProvedorIaCompativelComOpenAi(String url, String chave, String modelo,
                                         Duration tempoMaximo, int tokensMaximos, double temperatura) {
        this(criarRestClient(UrlDoProvedor.validar(url), tempoMaximo), chave, modelo, tokensMaximos, temperatura);
    }

    ProvedorIaCompativelComOpenAi(RestClient restClient, String chave, String modelo,
                                  int tokensMaximos, double temperatura) {
        if (modelo == null || modelo.isBlank()) {
            throw new IllegalArgumentException("O modelo do provedor de IA é obrigatório.");
        }
        if (tokensMaximos <= 0) {
            throw new IllegalArgumentException("O limite de tokens deve ser positivo.");
        }
        if (Double.isNaN(temperatura) || temperatura < 0 || temperatura > 2) {
            throw new IllegalArgumentException("A temperatura deve estar entre 0 e 2.");
        }
        this.restClient = restClient;
        this.chave = chave == null ? "" : chave.trim();
        this.modelo = modelo.trim();
        this.tokensMaximos = tokensMaximos;
        this.temperatura = temperatura;
    }

    @Override
    public RespostaIa gerar(PromptDesafio prompt) {
        String corpo = montarCorpo(prompt);

        Resposta resposta;
        try {
            resposta = restClient.post()
                    .uri(uri -> uri.path(CAMINHO).build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .headers(cabecalhos -> {
                        if (!chave.isEmpty()) {
                            cabecalhos.setBearerAuth(chave);
                        }
                    })
                    .body(corpo)
                    .exchange((requisicao, retorno) -> {
                        if (retorno.getStatusCode().isError()) {
                            throw new ProvedorIaException(motivoDoStatus(retorno.getStatusCode()));
                        }
                        byte[] bytes = retorno.getBody().readNBytes(TAMANHO_MAXIMO_RESPOSTA_BYTES + 1);
                        if (bytes.length > TAMANHO_MAXIMO_RESPOSTA_BYTES) {
                            throw new ProvedorIaException(MotivoFalhaIa.RESPOSTA_GRANDE_DEMAIS);
                        }
                        return new Resposta(bytes, retorno.getHeaders().getFirst(CABECALHO_DE_ROTEAMENTO));
                    });
        } catch (ProvedorIaException e) {
            throw e;
        } catch (RestClientException | IllegalStateException e) {
            throw new ProvedorIaException(MotivoFalhaIa.INDISPONIVEL);
        }

        return interpretar(resposta);
    }

    private String montarCorpo(PromptDesafio prompt) {
        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("model", modelo);
        corpo.put("messages", List.of(
                Map.of("role", "system", "content", prompt.sistema()),
                Map.of("role", "user", "content", prompt.usuario())));
        corpo.put("temperature", temperatura);
        corpo.put("max_tokens", tokensMaximos);
        corpo.put("stream", false);
        return MAPEADOR.writeValueAsString(corpo);
    }

    private RespostaIa interpretar(Resposta resposta) {
        try {
            JsonNode raiz = MAPEADOR.readTree(resposta.corpo());
            JsonNode conteudo = raiz.path("choices").path(0).path("message").path("content");
            if (!conteudo.isString() || conteudo.asString().isBlank()) {
                throw new ProvedorIaException(MotivoFalhaIa.RESPOSTA_INVALIDA);
            }
            String modeloUsado = nomeDeModelo(resposta.roteadoPor())
                    .or(() -> nomeDeModelo(raiz.path("model").isString() ? raiz.path("model").asString() : null))
                    .orElse(null);
            return new RespostaIa(conteudo.asString(), modeloUsado);
        } catch (JacksonException e) {
            throw new ProvedorIaException(MotivoFalhaIa.RESPOSTA_INVALIDA);
        }
    }

    private Optional<String> nomeDeModelo(String bruto) {
        return Optional.ofNullable(bruto).map(String::trim).filter(nome -> NOME_DE_MODELO.matcher(nome).matches());
    }

    private MotivoFalhaIa motivoDoStatus(HttpStatusCode status) {
        int codigo = status.value();
        if (codigo == 401 || codigo == 403) {
            return MotivoFalhaIa.NAO_AUTORIZADO;
        }
        if (codigo == 429) {
            return MotivoFalhaIa.LIMITE_ATINGIDO;
        }
        return MotivoFalhaIa.INDISPONIVEL;
    }

    private static RestClient criarRestClient(URI url, Duration tempoMaximo) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();

        JdkClientHttpRequestFactory fabrica = new JdkClientHttpRequestFactory(httpClient);
        fabrica.setReadTimeout(tempoMaximo);

        String base = url.toString().replaceAll("/+$", "");
        return RestClient.builder()
                .baseUrl(base)
                .requestFactory(fabrica)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    private record Resposta(byte[] corpo, String roteadoPor) {
    }
}
