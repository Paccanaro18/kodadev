package com.koda.v1.challenge.ia;

import com.koda.v1.analyzer.contexto.Arquitetura;
import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.EndpointContexto;
import com.koda.v1.analyzer.contexto.InfraContexto;
import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.analyzer.contexto.TestesContexto;
import com.koda.v1.challenge.ConteudoDesafio;
import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.VerificadorConteudo;
import com.koda.v1.challenge.catalogo.AlvoDesafio;
import com.koda.v1.challenge.catalogo.AnguloDesafio;
import com.koda.v1.challenge.catalogo.CatalogoAngulos;
import com.koda.v1.challenge.prompt.MontadorPrompt;
import com.koda.v1.challenge.prompt.Perspectivas;
import com.koda.v1.challenge.selecao.SelecaoDeDesafio;
import com.koda.v1.challenge.validacao.MotivoReprovacao;
import com.koda.v1.challenge.validacao.ValidadorDesafio;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * O provedor falso é o que roda em desenvolvimento e nos testes de integração: o ticket simulado de qualquer
 * ângulo e alvo do catálogo precisa passar no verificador e no validador, senão a geração falha ao acaso.
 */
class ProvedorIaFalsoValidadoTest {

    private final CatalogoAngulos catalogo = new CatalogoAngulos();
    private final Perspectivas perspectivas = new Perspectivas();
    private final MontadorPrompt montador = new MontadorPrompt(perspectivas);
    private final ProvedorIaFalso provedor = new ProvedorIaFalso();
    private final VerificadorConteudo verificador = new VerificadorConteudo();
    private final ValidadorDesafio validador = new ValidadorDesafio();

    @Test
    void todoTicketSimuladoDoCatalogoDeveSerAprovadoPeloVerificadorEPeloValidador() {
        ContextoProjeto contexto = contextoCompleto();
        List<String> reprovados = new ArrayList<>();
        int combinacoes = 0;

        for (TipoDesafio tipo : TipoDesafio.values()) {
            for (AnguloDesafio angulo : catalogo.doTipo(tipo)) {
                for (AlvoDesafio alvo : angulo.alvosEm(contexto)) {
                    combinacoes++;
                    SelecaoDeDesafio selecao = new SelecaoDeDesafio(angulo, alvo);
                    var prompt = montador.montar(selecao, contexto, perspectivas.todas().get(0), List.of());
                    ConteudoDesafio conteudo = verificador.verificar(provedor.gerar(prompt).texto());

                    List<MotivoReprovacao> motivos = validador.validar(conteudo, selecao, contexto);
                    if (!motivos.isEmpty()) {
                        reprovados.add(angulo.id() + " | " + alvo.chave() + " -> " + motivos);
                    }
                }
            }
        }

        assertThat(combinacoes).isGreaterThan(30);
        assertThat(reprovados).as("combinações simuladas reprovadas").isEmpty();
    }

    private ContextoProjeto contextoCompleto() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS, List.of("Pedido", "Cliente"),
                List.of(Tecnologia.POSTGRESQL, Tecnologia.RABBITMQ, Tecnologia.REDIS), List.of("pedidos", "clientes"),
                List.of(new EndpointContexto("GET", "/pedidos", "PedidoController"),
                        new EndpointContexto("POST", "/pedidos", "PedidoController"),
                        new EndpointContexto("GET", "/pedidos/{id}", "PedidoController"),
                        new EndpointContexto("PUT", "/pedidos/{id}", "PedidoController"),
                        new EndpointContexto("DELETE", "/pedidos/{id}", "PedidoController"),
                        new EndpointContexto("GET", "/clientes", "ClienteController"),
                        new EndpointContexto("POST", "/clientes", "ClienteController"),
                        new EndpointContexto("GET", "/clientes/{id}", "ClienteController")),
                new ComponentesContexto(
                        List.of("PedidoController", "ClienteController"), List.of("PedidoService", "ClienteService"),
                        List.of("PedidoRepository", "ClienteRepository"), List.of("Pedido", "Cliente"),
                        List.of("CriarPedidoRequest", "PedidoResponse"), List.of("PedidoNaoEncontradoException"), true),
                new TestesContexto(0, List.of("PedidoService", "ClienteService"), List.of("PedidoController")),
                new InfraContexto(true, true), false, false, 0);
    }
}
