package com.koda.v1.challenge.selecao;

import com.koda.v1.analyzer.contexto.Arquitetura;
import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.EndpointContexto;
import com.koda.v1.analyzer.contexto.InfraContexto;
import com.koda.v1.analyzer.contexto.TestesContexto;
import com.koda.v1.challenge.DesafiosEsgotadosException;
import com.koda.v1.challenge.SemAnguloAplicavelException;
import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.catalogo.AnguloAplicavel;
import com.koda.v1.challenge.catalogo.CatalogoAngulos;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SeletorDeDesafioTest {

    private final CatalogoAngulos catalogo = new CatalogoAngulos();

    @Test
    void naoDeveRepetirAnguloEnquantoHouverOutroAindaNaoUsadoNoTipo() {
        ContextoProjeto contexto = contextoGrande();
        int aplicaveis = catalogo.aplicaveis(contexto, TipoDesafio.TESTING).size();

        List<SelecaoDeDesafio> sequencia = simular(contexto, TipoDesafio.TESTING, aplicaveis * 4, 7);

        assertThat(aplicaveis).isGreaterThanOrEqualTo(9);
        for (int inicio = 0; inicio + aplicaveis <= sequencia.size(); inicio++) {
            Set<String> janela = new HashSet<>();
            for (SelecaoDeDesafio selecao : sequencia.subList(inicio, inicio + aplicaveis)) {
                janela.add(selecao.angulo().id());
            }
            assertThat(janela).as("janela começando em %d", inicio).hasSize(aplicaveis);
        }
    }

    @Test
    void deveManterAMesmaPropriedadeParaFeaturesEParaVariasSementes() {
        ContextoProjeto contexto = contextoGrande();
        int aplicaveis = catalogo.aplicaveis(contexto, TipoDesafio.FEATURE).size();

        for (long semente = 0; semente < 20; semente++) {
            List<SelecaoDeDesafio> sequencia = simular(contexto, TipoDesafio.FEATURE, aplicaveis * 2, semente);

            Set<String> primeiroCiclo = new HashSet<>();
            sequencia.subList(0, aplicaveis).forEach(s -> primeiroCiclo.add(s.angulo().id()));
            assertThat(primeiroCiclo).as("semente %d", semente).hasSize(aplicaveis);
        }
    }

    @Test
    void deveEsgotarExatamenteTodasAsCombinacoesSemRepetirNenhumaEDepoisAvisar() {
        ContextoProjeto contexto = contextoRico();

        for (TipoDesafio tipo : TipoDesafio.values()) {
            int combinacoes = catalogo.aplicaveis(contexto, tipo).stream().mapToInt(a -> a.alvos().size()).sum();
            SeletorDeDesafio seletor = new SeletorDeDesafio(catalogo, new Random(3));
            List<UsoAnterior> historico = new ArrayList<>();
            Set<String> vistas = new HashSet<>();

            for (int i = 0; i < combinacoes; i++) {
                SelecaoDeDesafio selecao = seletor.selecionar(contexto, tipo, historico);
                assertThat(vistas.add(selecao.angulo().id() + "|" + selecao.alvo().chave()))
                        .as("%s: combinação repetida na escolha %d", tipo, i).isTrue();
                historico.add(0, new UsoAnterior(selecao.angulo().id(), selecao.alvo().chave(), true));
            }

            assertThat(vistas).hasSize(combinacoes);
            assertThatThrownBy(() -> seletor.selecionar(contexto, tipo, historico))
                    .as(tipo.name()).isInstanceOf(DesafiosEsgotadosException.class);
        }
    }

    @Test
    void devePreferirAlvoAindaNaoUsadoNaAnaliseEnquantoExistir() {
        ContextoProjeto contexto = contextoGrande();
        SeletorDeDesafio seletor = new SeletorDeDesafio(catalogo, new Random(11));
        List<UsoAnterior> historico = new ArrayList<>();
        Set<String> alvosUsados = new HashSet<>();

        for (int i = 0; i < 30; i++) {
            final int numeroDaEscolha = i;
            SelecaoDeDesafio selecao = seletor.selecionar(contexto, TipoDesafio.FEATURE, historico);

            if (alvosUsados.contains(selecao.alvo().chave())) {
                Set<String> usadosComEsteAngulo = new HashSet<>();
                historico.stream()
                        .filter(uso -> uso.anguloId().equals(selecao.angulo().id()))
                        .forEach(uso -> usadosComEsteAngulo.add(uso.alvoChave()));
                selecao.angulo().alvosEm(contexto).stream()
                        .filter(alvo -> !usadosComEsteAngulo.contains(alvo.chave()))
                        .forEach(alvo -> assertThat(alvosUsados)
                                .as("escolha %d: havia alvo novo (%s) e ele foi ignorado", numeroDaEscolha, alvo.chave())
                                .contains(alvo.chave()));
            }
            alvosUsados.add(selecao.alvo().chave());
            historico.add(0, new UsoAnterior(selecao.angulo().id(), selecao.alvo().chave(), true));
        }
    }

    @Test
    void deveAlternarOsTiposNoAleatorio() {
        ContextoProjeto contexto = contextoGrande();

        List<SelecaoDeDesafio> sequencia = simular(contexto, null, 12, 5);

        for (int inicio = 0; inicio + 3 <= sequencia.size(); inicio += 3) {
            Set<TipoDesafio> tipos = new HashSet<>();
            sequencia.subList(inicio, inicio + 3).forEach(s -> tipos.add(s.tipo()));
            assertThat(tipos).as("trio começando em %d", inicio).hasSize(3);
        }
    }

    @Test
    void deveGerarAMesmaSequenciaComAMesmaSementeEPodeMudarComOutra() {
        ContextoProjeto contexto = contextoGrande();

        List<SelecaoDeDesafio> primeira = simular(contexto, TipoDesafio.TESTING, 10, 42);
        List<SelecaoDeDesafio> igual = simular(contexto, TipoDesafio.TESTING, 10, 42);
        Set<List<String>> variacoes = new HashSet<>();
        for (long semente = 0; semente < 10; semente++) {
            variacoes.add(simular(contexto, TipoDesafio.TESTING, 3, semente).stream()
                    .map(s -> s.angulo().id()).toList());
        }

        assertThat(igual).isEqualTo(primeira);
        assertThat(variacoes.size()).isGreaterThan(3);
    }

    @Test
    void deveSortearEntreOsEmpatesEmVezDeFicarSempreNoPrimeiro() {
        ContextoProjeto contexto = contextoGrande();
        int aplicaveis = catalogo.aplicaveis(contexto, TipoDesafio.TESTING).size();
        Set<String> primeirosEscolhidos = new HashSet<>();

        for (long semente = 0; semente < 200; semente++) {
            SeletorDeDesafio seletor = new SeletorDeDesafio(catalogo, new Random(semente));
            primeirosEscolhidos.add(seletor.selecionar(contexto, TipoDesafio.TESTING, List.of()).angulo().id());
        }

        assertThat(primeirosEscolhidos.size()).isGreaterThanOrEqualTo(aplicaveis - 1);
    }

    @Test
    void deveUsarOHistoricoDeOutrasAnalisesSoParaVariarOAnguloSemBloquearACombinacao() {
        ContextoProjeto contexto = contextoRico();
        AnguloAplicavel unico = catalogo.aplicaveis(contexto, TipoDesafio.TESTING).stream()
                .filter(a -> a.angulo().id().equals("TESTING_UNITARIO_DE_SERVICE")).findFirst().orElseThrow();
        String alvo = unico.alvos().get(0).chave();
        List<UsoAnterior> deOutraAnalise = List.of(new UsoAnterior("TESTING_UNITARIO_DE_SERVICE", alvo, false));

        SeletorDeDesafio seletor = new SeletorDeDesafio(catalogo, new Random(1));
        SelecaoDeDesafio escolha = seletor.selecionar(contexto, TipoDesafio.TESTING, deOutraAnalise);

        assertThat(escolha.angulo().id()).isNotEqualTo("TESTING_UNITARIO_DE_SERVICE");
        assertThat(catalogo.porId("TESTING_UNITARIO_DE_SERVICE").orElseThrow().alvosEm(contexto)).isNotEmpty();
    }

    @Test
    void naoDeveBloquearUmaCombinacaoUsadaEmOutraAnaliseQuandoEhAUnicaOpcao() {
        ContextoProjeto contexto = contextoVazio();
        List<UsoAnterior> deOutraAnalise = List.of(new UsoAnterior("BUG_ERRO_SEM_TRATAMENTO", "PROJETO:tratamento de erros", false));

        SelecaoDeDesafio escolha = new SeletorDeDesafio(catalogo, new Random(1))
                .selecionar(contexto, TipoDesafio.BUG, deOutraAnalise);

        assertThat(escolha.angulo().id()).isEqualTo("BUG_ERRO_SEM_TRATAMENTO");
    }

    @Test
    void deveAvisarQuandoOTipoNaoTemNadaAplicavelEQuandoTudoJaFoiUsado() {
        ContextoProjeto vazio = contextoVazio();
        SeletorDeDesafio seletor = new SeletorDeDesafio(catalogo, new Random(1));

        assertThatThrownBy(() -> seletor.selecionar(vazio, TipoDesafio.TESTING, List.of()))
                .isInstanceOf(SemAnguloAplicavelException.class);
        assertThatThrownBy(() -> seletor.selecionar(vazio, TipoDesafio.FEATURE, List.of()))
                .isInstanceOf(SemAnguloAplicavelException.class);

        List<UsoAnterior> usado = List.of(new UsoAnterior("BUG_ERRO_SEM_TRATAMENTO", "PROJETO:tratamento de erros", true));
        assertThatThrownBy(() -> seletor.selecionar(vazio, TipoDesafio.BUG, usado))
                .isInstanceOf(DesafiosEsgotadosException.class)
                .hasMessageContaining("já praticou");
    }

    @Test
    void noAleatorioDeveEscolherSoEntreOsTiposQueAindaTemOpcao() {
        ContextoProjeto vazio = contextoVazio();

        SelecaoDeDesafio escolha = new SeletorDeDesafio(catalogo, new Random(9)).selecionar(vazio, null, List.of());

        assertThat(escolha.tipo()).isEqualTo(TipoDesafio.BUG);
        assertThatThrownBy(() -> new SeletorDeDesafio(catalogo, new Random(9)).selecionar(vazio, null, List.of(
                new UsoAnterior("BUG_ERRO_SEM_TRATAMENTO", "PROJETO:tratamento de erros", true))))
                .isInstanceOf(DesafiosEsgotadosException.class);
    }

    @Test
    void deveIgnorarNoHistoricoUmAnguloQueNaoExisteMais() {
        List<UsoAnterior> historico = List.of(new UsoAnterior("ANGULO_REMOVIDO", "CLASSE:X", true));

        SelecaoDeDesafio escolha = new SeletorDeDesafio(catalogo, new Random(2))
                .selecionar(contextoGrande(), null, historico);

        assertThat(escolha).isNotNull();
    }

    @Test
    void deveEscolherSempreUmAlvoQueEhDoAnguloEscolhido() {
        ContextoProjeto contexto = contextoGrande();

        List<SelecaoDeDesafio> sequencia = simular(contexto, null, 40, 8);

        assertThat(sequencia).allSatisfy(selecao ->
                assertThat(selecao.angulo().alvosEm(contexto)).contains(selecao.alvo()));
    }

    private List<SelecaoDeDesafio> simular(ContextoProjeto contexto, TipoDesafio tipo, int quantidade, long semente) {
        SeletorDeDesafio seletor = new SeletorDeDesafio(catalogo, new Random(semente));
        List<UsoAnterior> historico = new ArrayList<>();
        List<SelecaoDeDesafio> escolhas = new ArrayList<>();
        for (int i = 0; i < quantidade; i++) {
            SelecaoDeDesafio selecao = seletor.selecionar(contexto, tipo, historico);
            escolhas.add(selecao);
            historico.add(0, new UsoAnterior(selecao.angulo().id(), selecao.alvo().chave(), true));
        }
        return escolhas;
    }

    private ContextoProjeto contextoGrande() {
        List<String> numeros = IntStream.rangeClosed(1, 12).mapToObj(i -> String.format("%02d", i)).toList();
        List<String> controllers = numeros.stream().map(n -> "Recurso" + n + "Controller").toList();
        List<String> services = numeros.stream().map(n -> "Recurso" + n + "Service").toList();
        List<String> repositories = numeros.stream().map(n -> "Recurso" + n + "Repository").toList();
        List<String> entidades = numeros.stream().map(n -> "Recurso" + n).toList();
        List<String> dtos = numeros.stream().map(n -> "CriarRecurso" + n + "Request").toList();

        List<EndpointContexto> endpoints = new ArrayList<>();
        for (int i = 0; i < numeros.size(); i++) {
            String recurso = "/recurso" + numeros.get(i);
            String controller = controllers.get(i);
            endpoints.add(new EndpointContexto("GET", recurso, controller));
            if (i >= 6) {
                endpoints.add(new EndpointContexto("GET", recurso + "/{id}", controller));
                endpoints.add(new EndpointContexto("POST", recurso, controller));
                endpoints.add(new EndpointContexto("PUT", recurso + "/{id}", controller));
                endpoints.add(new EndpointContexto("PATCH", recurso + "/{id}", controller));
                endpoints.add(new EndpointContexto("DELETE", recurso + "/{id}", controller));
            }
        }

        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS, List.of(), List.of(), List.of(), endpoints,
                new ComponentesContexto(controllers, services, repositories, entidades, dtos,
                        List.of("RecursoNaoEncontradoException"), false),
                new TestesContexto(0, services, controllers), new InfraContexto(false, false), false, false, 0);
    }

    private ContextoProjeto contextoRico() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS, List.of(), List.of(), List.of(),
                List.of(new EndpointContexto("GET", "/pedidos", "PedidoController"),
                        new EndpointContexto("GET", "/pedidos/{id}", "PedidoController"),
                        new EndpointContexto("POST", "/pedidos", "PedidoController"),
                        new EndpointContexto("DELETE", "/pedidos/{id}", "PedidoController"),
                        new EndpointContexto("GET", "/clientes", "ClienteController")),
                new ComponentesContexto(
                        List.of("PedidoController", "ClienteController"), List.of("PedidoService", "ClienteService"),
                        List.of("PedidoRepository"), List.of("Pedido", "Cliente"),
                        List.of("PedidoResponse", "CriarPedidoRequest"), List.of("PedidoNaoEncontradoException"), false),
                new TestesContexto(2, List.of("ClienteService"), List.of("ClienteController")),
                new InfraContexto(false, true), false, false, 0);
    }

    private ContextoProjeto contextoVazio() {
        return new ContextoProjeto(
                1, null, null, "maven", Arquitetura.INDEFINIDA, List.of(), List.of(), List.of(), List.of(),
                new ComponentesContexto(List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), false),
                new TestesContexto(0, List.of(), List.of()), new InfraContexto(false, false), false, false, 0);
    }
}
