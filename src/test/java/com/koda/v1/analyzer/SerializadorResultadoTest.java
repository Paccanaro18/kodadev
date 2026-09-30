package com.koda.v1.analyzer;

import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.detector.Tecnologia;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SerializadorResultadoTest {

    private final SerializadorResultado serializador = new SerializadorResultado();
    private final JsonMapper leitor = JsonMapper.builder().build();

    @Test
    void deveSerializarEVoltarSemPerderNada() {
        ResultadoAnalise original = new ResultadoAnalise(
                true,
                true,
                "21",
                "4.1.1",
                List.of("org.springframework.boot:spring-boot-starter-webmvc"),
                List.of(Tecnologia.POSTGRESQL, Tecnologia.REDIS),
                List.of("postgres", "redis"),
                List.of("src/main/java/a/PedidoController.java"),
                List.of("src/main/java/a/PedidoService.java"),
                List.of("src/main/java/a/PedidoRepository.java"),
                List.of("src/main/java/a/model/Pedido.java"),
                List.of("src/test/java/a/PedidoServiceTest.java"),
                List.of(new Endpoint("GET", "/pedidos/{id}", "PedidoController")),
                true);

        String json = serializador.paraJson(original);
        ResultadoAnalise lido = leitor.readValue(json, ResultadoAnalise.class);

        assertThat(lido).isEqualTo(original);
    }

    @Test
    void deveEscreverNomesDeCamposEEnumsComoTexto() {
        ResultadoAnalise resultado = new ResultadoAnalise(
                true, true, "21", null, List.of(), List.of(Tecnologia.RABBITMQ), List.of(),
                List.of(), List.of(), List.of(), List.of(), List.of(),
                List.of(new Endpoint("POST", "/contas", "ContaController")),
                false);

        JsonNode json = leitor.readTree(serializador.paraJson(resultado));

        assertThat(json.get("temCodigoJava").asBoolean()).isTrue();
        assertThat(json.get("versaoJava").asString()).isEqualTo("21");
        assertThat(json.get("versaoSpringBoot").isNull()).isTrue();
        assertThat(json.get("tecnologias").get(0).asString()).isEqualTo("RABBITMQ");
        assertThat(json.get("endpoints").get(0).get("metodoHttp").asString()).isEqualTo("POST");
        assertThat(json.get("controllers").isArray()).isTrue();
        assertThat(json.get("parcial").asBoolean()).isFalse();
    }

    @Test
    void deveSerializarResultadoVazio() {
        ResultadoAnalise vazio = new ResultadoAnalise(
                false, false, null, null, List.of(), List.of(), List.of(),
                List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), false);

        ResultadoAnalise lido = leitor.readValue(serializador.paraJson(vazio), ResultadoAnalise.class);

        assertThat(lido).isEqualTo(vazio);
    }
}
