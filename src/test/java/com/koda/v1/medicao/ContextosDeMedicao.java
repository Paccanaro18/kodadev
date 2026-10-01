package com.koda.v1.medicao;

import com.koda.v1.analyzer.contexto.Arquitetura;
import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.EndpointContexto;
import com.koda.v1.analyzer.contexto.InfraContexto;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.analyzer.contexto.TestesContexto;
import com.koda.v1.analyzer.detector.Tecnologia;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/** Contextos de projeto usados nas medições. O "rico" dá variedade de ângulos; o "pagamentos" é o projeto real pequeno. */
public final class ContextosDeMedicao {

    private ContextosDeMedicao() {
    }

    public static ContextoProjeto rico() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS, List.of("Pedido", "Cliente", "Produto"),
                List.of(Tecnologia.POSTGRESQL, Tecnologia.RABBITMQ, Tecnologia.REDIS),
                List.of("pedidos", "clientes", "produtos"),
                List.of(new EndpointContexto("GET", "/pedidos", "PedidoController"),
                        new EndpointContexto("POST", "/pedidos", "PedidoController"),
                        new EndpointContexto("GET", "/pedidos/{id}", "PedidoController"),
                        new EndpointContexto("PUT", "/pedidos/{id}", "PedidoController"),
                        new EndpointContexto("DELETE", "/pedidos/{id}", "PedidoController"),
                        new EndpointContexto("GET", "/clientes", "ClienteController"),
                        new EndpointContexto("POST", "/clientes", "ClienteController"),
                        new EndpointContexto("GET", "/clientes/{id}", "ClienteController"),
                        new EndpointContexto("GET", "/produtos", "ProdutoController"),
                        new EndpointContexto("POST", "/produtos", "ProdutoController"),
                        new EndpointContexto("GET", "/produtos/{id}", "ProdutoController")),
                new ComponentesContexto(
                        List.of("PedidoController", "ClienteController", "ProdutoController"),
                        List.of("PedidoService", "ClienteService", "ProdutoService"),
                        List.of("PedidoRepository", "ClienteRepository", "ProdutoRepository"),
                        List.of("Pedido", "Cliente", "Produto"),
                        List.of("CriarPedidoRequest", "PedidoResponse"),
                        List.of("PedidoNaoEncontradoException"), true),
                new TestesContexto(0, List.of("PedidoService", "ClienteService", "ProdutoService"),
                        List.of("PedidoController", "ProdutoController")),
                new InfraContexto(true, true), false, false, 0);
    }

    public static ContextoProjeto pagamentos() throws IOException {
        try (var entrada = ContextosDeMedicao.class.getResourceAsStream("/validacao/contexto-pagamentos.json")) {
            return new SerializadorContexto().deJson(new String(entrada.readAllBytes(), StandardCharsets.UTF_8).trim());
        }
    }
}
