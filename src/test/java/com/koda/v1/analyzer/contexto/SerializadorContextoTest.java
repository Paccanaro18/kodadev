package com.koda.v1.analyzer.contexto;

import com.koda.v1.analyzer.detector.Tecnologia;
import org.junit.jupiter.api.Test;
import tools.jackson.core.JacksonException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SerializadorContextoTest {

    private final SerializadorContexto serializador = new SerializadorContexto();

    private ContextoProjeto exemplo() {
        return new ContextoProjeto(
                ContextoProjeto.VERSAO_ESQUEMA, "21", "4.1.1", "maven", Arquitetura.POR_FEATURE,
                List.of("Pedido"), List.of(Tecnologia.REDIS), List.of("pedidos"),
                List.of(new EndpointContexto("GET", "/pedidos", "PedidoController")),
                new ComponentesContexto(
                        List.of("PedidoController"), List.of("PedidoService"), List.of(), List.of("Pedido"),
                        List.of(), List.of(), false),
                new TestesContexto(0, List.of("PedidoService"), List.of("PedidoController")),
                new InfraContexto(false, true), true, true, 3);
    }

    @Test
    void deveSerializarEVoltarSemPerderNada() {
        ContextoProjeto original = exemplo();

        ContextoProjeto lido = serializador.deJson(serializador.paraJson(original));

        assertThat(lido).isEqualTo(original);
    }

    @Test
    void deveEscreverAVersaoDoEsquemaNoJson() {
        assertThat(serializador.paraJson(exemplo())).contains("\"versaoEsquema\":1");
    }

    @Test
    void deveRecusarJsonInvalido() {
        assertThatThrownBy(() -> serializador.deJson("isso não é json")).isInstanceOf(JacksonException.class);
    }
}
