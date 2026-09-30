package com.koda.v1.analyzer.contexto;

import com.koda.v1.analyzer.detector.Tecnologia;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ContextoProjetoTest {

    private final JsonMapper mapeador = JsonMapper.builder().build();

    private ContextoProjeto exemplo() {
        return new ContextoProjeto(
                ContextoProjeto.VERSAO_ESQUEMA,
                "21",
                "4.1.1",
                "maven",
                Arquitetura.EM_CAMADAS,
                List.of("Pedido", "Cliente"),
                List.of(Tecnologia.POSTGRESQL),
                List.of("pedidos", "clientes"),
                List.of(new EndpointContexto("GET", "/pedidos/{id}", "PedidoController")),
                new ComponentesContexto(
                        List.of("PedidoController"), List.of("PedidoService"), List.of("PedidoRepository"),
                        List.of("Pedido"), List.of("PedidoResponse"), List.of("PedidoNaoEncontradoException"), true),
                new TestesContexto(3, List.of("ClienteService"), List.of("PedidoController")),
                new InfraContexto(true, true),
                false,
                false,
                2);
    }

    @Test
    void deveVoltarIgualDepoisDeIrEVoltarPeloJson() {
        ContextoProjeto original = exemplo();

        String json = mapeador.writeValueAsString(original);
        ContextoProjeto lido = mapeador.readValue(json, ContextoProjeto.class);

        assertThat(lido).isEqualTo(original);
    }

    @Test
    void deveEscreverEnumsComoTextoEAVersaoDoEsquema() {
        var json = mapeador.readTree(mapeador.writeValueAsString(exemplo()));

        assertThat(json.get("versaoEsquema").asInt()).isEqualTo(1);
        assertThat(json.get("arquitetura").asString()).isEqualTo("EM_CAMADAS");
        assertThat(json.get("tecnologias").get(0).asString()).isEqualTo("POSTGRESQL");
        assertThat(json.get("componentes").get("temTratadorDeErros").asBoolean()).isTrue();
        assertThat(json.get("testes").get("servicesSemTeste").get(0).asString()).isEqualTo("ClienteService");
    }

    @Test
    void naoDeveMudarQuandoAListaOriginalMuda() {
        List<String> dominios = new ArrayList<>(List.of("Pedido"));
        ContextoProjeto contexto = new ContextoProjeto(
                1, null, null, "maven", Arquitetura.INDEFINIDA, dominios, List.of(), List.of(), List.of(),
                new ComponentesContexto(List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), false),
                new TestesContexto(0, List.of(), List.of()),
                new InfraContexto(false, false), false, false, 0);

        dominios.add("Invasor");

        assertThat(contexto.dominios()).containsExactly("Pedido");
        assertThatThrownBy(() -> contexto.dominios().add("x")).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void deveExigirArquiteturaComponentesTestesEInfra() {
        ComponentesContexto componentes = new ComponentesContexto(
                List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), false);
        TestesContexto testes = new TestesContexto(0, List.of(), List.of());
        InfraContexto infra = new InfraContexto(false, false);

        assertThatThrownBy(() -> new ContextoProjeto(
                1, null, null, "maven", null, List.of(), List.of(), List.of(), List.of(),
                componentes, testes, infra, false, false, 0))
                .isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new ContextoProjeto(
                1, null, null, "maven", Arquitetura.INDEFINIDA, List.of(), List.of(), List.of(), List.of(),
                null, testes, infra, false, false, 0))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    void deveExigirOsCamposDoEndpoint() {
        assertThatThrownBy(() -> new EndpointContexto(null, "/a", "AController"))
                .isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new EndpointContexto("GET", null, "AController"))
                .isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new EndpointContexto("GET", "/a", null))
                .isInstanceOf(NullPointerException.class);
    }
}
