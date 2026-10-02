package com.koda.v1.challenge.catalogo;

import com.koda.v1.analyzer.contexto.Arquitetura;
import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.EndpointContexto;
import com.koda.v1.analyzer.contexto.InfraContexto;
import com.koda.v1.analyzer.contexto.TestesContexto;
import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.challenge.TipoDesafio;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class CatalogoAngulosTest {

    private final CatalogoAngulos catalogo = new CatalogoAngulos();

    @Test
    void deveTerIdsUnicosEmMaiusculasComOPrefixoDoTipo() {
        List<AnguloDesafio> todos = catalogo.todos();

        assertThat(todos).extracting(AnguloDesafio::id).doesNotHaveDuplicates();
        assertThat(todos).allSatisfy(angulo -> {
            assertThat(angulo.id()).matches("[A-Z0-9_]+");
            assertThat(angulo.id()).startsWith(angulo.tipo().name() + "_");
        });
    }

    @Test
    void deveTerVariedadeSuficienteEmCadaTipo() {
        assertThat(catalogo.todos()).hasSizeGreaterThanOrEqualTo(36);
        assertThat(catalogo.doTipo(TipoDesafio.TESTING)).hasSizeGreaterThanOrEqualTo(10);
        assertThat(catalogo.doTipo(TipoDesafio.FEATURE)).hasSizeGreaterThanOrEqualTo(14);
        assertThat(catalogo.doTipo(TipoDesafio.BUG)).hasSizeGreaterThanOrEqualTo(10);
    }

    @Test
    void deveTerNomeInstrucaoEHabilidadesPreenchidosSemCodigoNemSolucao() {
        assertThat(catalogo.todos()).allSatisfy(angulo -> {
            assertThat(angulo.nome()).isNotBlank();
            assertThat(angulo.instrucao()).hasSizeGreaterThan(40);
            assertThat(angulo.instrucao()).doesNotContain("`").doesNotContain("@");
            assertThat(angulo.habilidades()).hasSizeBetween(2, 4);
            assertThat(angulo.habilidades()).allSatisfy(habilidade -> assertThat(habilidade).isNotBlank());
        });
    }

    @Test
    void deveTerNomesDeAnguloDiferentesEntreSi() {
        List<String> nomes = catalogo.todos().stream().map(AnguloDesafio::nome).toList();

        assertThat(nomes).doesNotHaveDuplicates();
    }

    @Test
    void deveCobrirMuitasHabilidadesDiferentes() {
        Set<String> habilidades = catalogo.todos().stream()
                .flatMap(angulo -> angulo.habilidades().stream())
                .collect(Collectors.toSet());

        assertThat(habilidades).hasSizeGreaterThanOrEqualTo(50);
    }

    @Test
    void deveDescreverBugsComoCenarioReportadoSemIndicarACorrecao() {
        assertThat(catalogo.doTipo(TipoDesafio.BUG)).allSatisfy(angulo -> {
            assertThat(angulo.instrucao()).contains("cenário reportado");
            assertThat(angulo.instrucao()).contains("sem indicar a correção");
        });
    }

    @Test
    void deveEncontrarAnguloPorId() {
        assertThat(catalogo.porId("FEATURE_PAGINACAO")).isPresent();
        assertThat(catalogo.porId("NAO_EXISTE")).isEmpty();
    }

    @Test
    void emUmContextoVazioSoOAnguloDeProjetoSemTratamentoDeErrosSeAplica() {
        List<String> aplicaveis = catalogo.aplicaveis(contextoVazio(), null).stream()
                .map(aplicavel -> aplicavel.angulo().id())
                .toList();

        assertThat(aplicaveis).containsExactly("BUG_ERRO_SEM_TRATAMENTO");
    }

    @Test
    void deveEscolherAlvosDeTestingPeloQueFaltaTestar() {
        ContextoProjeto contexto = contextoRico();

        assertThat(alvos(contexto, "TESTING_UNITARIO_DE_SERVICE")).containsExactly("CLASSE:ClienteService");
        assertThat(alvos(contexto, "TESTING_CONTROLLER_COM_MOCKMVC")).containsExactly("CLASSE:ClienteController");
        assertThat(alvos(contexto, "TESTING_CAMINHOS_DE_ERRO"))
                .containsExactly("CLASSE:ClienteService", "CLASSE:PedidoService");
        assertThat(alvos(contexto, "TESTING_VALIDACAO_DE_ENTRADA")).containsExactly("CLASSE:CriarPedidoRequest");
        assertThat(alvos(contexto, "TESTING_REPOSITORY_COM_BANCO")).containsExactly("CLASSE:PedidoRepository");
        assertThat(alvos(contexto, "TESTING_TRATADOR_DE_ERROS")).isEmpty();
    }

    @Test
    void deveEscolherLacunasDeOperacaoPorRecurso() {
        ContextoProjeto contexto = contextoRico();

        assertThat(alvos(contexto, "FEATURE_BUSCA_POR_ID")).containsExactly("RECURSO:clientes");
        assertThat(alvos(contexto, "FEATURE_CRIACAO")).containsExactly("RECURSO:clientes");
        assertThat(alvos(contexto, "FEATURE_ATUALIZACAO_COMPLETA")).containsExactly("RECURSO:clientes", "RECURSO:pedidos");
        assertThat(alvos(contexto, "FEATURE_ATUALIZACAO_PARCIAL")).containsExactly("RECURSO:clientes", "RECURSO:pedidos");
        assertThat(alvos(contexto, "FEATURE_EXCLUSAO")).containsExactly("RECURSO:clientes");
        assertThat(alvos(contexto, "FEATURE_CONTAGEM_DO_RECURSO")).containsExactly("RECURSO:clientes", "RECURSO:pedidos");
    }

    @Test
    void deveEscolherEndpointsPorMetodoEPorPosicaoNoCaminho() {
        ContextoProjeto contexto = contextoRico();

        assertThat(alvos(contexto, "FEATURE_PAGINACAO")).containsExactly("ENDPOINT:GET /clientes", "ENDPOINT:GET /pedidos");
        assertThat(alvos(contexto, "BUG_NAO_ENCONTRADO_RETORNA_500")).containsExactly("ENDPOINT:GET /pedidos/{id}");
        assertThat(alvos(contexto, "BUG_EXCLUSAO_DE_INEXISTENTE")).containsExactly("ENDPOINT:DELETE /pedidos/{id}");
        assertThat(alvos(contexto, "BUG_DADO_INVALIDO_ACEITO")).containsExactly("ENDPOINT:POST /pedidos");
        assertThat(alvos(contexto, "BUG_STATUS_DE_CRIACAO")).containsExactly("ENDPOINT:POST /pedidos");
        assertThat(alvos(contexto, "BUG_ATUALIZACAO_ZERA_CAMPOS")).isEmpty();
    }

    @Test
    void deveLevarOControllerComoComplementoDoAlvoDeEndpointEDeRecurso() {
        ContextoProjeto contexto = contextoRico();

        AlvoDesafio endpoint = aplicavel(contexto, "BUG_EXCLUSAO_DE_INEXISTENTE").alvos().get(0);
        AlvoDesafio recurso = aplicavel(contexto, "FEATURE_EXCLUSAO").alvos().get(0);

        assertThat(endpoint.complemento()).isEqualTo("PedidoController");
        assertThat(recurso.complemento()).isEqualTo("ClienteController");
    }

    @Test
    void deveEscolherEntidadesSemDtoDeRespostaEAnguloDeTratamentoDeErros() {
        ContextoProjeto contexto = contextoRico();

        assertThat(alvos(contexto, "FEATURE_DTO_DE_RESPOSTA")).containsExactly("CLASSE:Cliente");
        assertThat(alvos(contexto, "BUG_ERRO_SEM_TRATAMENTO")).containsExactly("PROJETO:tratamento de erros");
        assertThat(alvos(contexto, "BUG_TRANSACAO_AUSENTE")).containsExactly("CLASSE:ClienteService", "CLASSE:PedidoService");
    }

    @Test
    void deveOferecerTesteDoTratadorSoQuandoEleExiste() {
        ContextoProjeto comTratador = contexto(
                List.of(), true, List.of(), List.of(), List.of(), List.of(), List.of(), List.of());

        assertThat(alvos(comTratador, "TESTING_TRATADOR_DE_ERROS")).containsExactly("PROJETO:tratamento global de erros");
        assertThat(alvos(comTratador, "BUG_ERRO_SEM_TRATAMENTO")).isEmpty();
    }

    @Test
    void deveOferecerCacheEEventoSoComATecnologiaCorrespondente() {
        List<EndpointContexto> endpoints = List.of(new EndpointContexto("GET", "/pedidos", "PedidoController"));
        ContextoProjeto semTecnologia = contexto(endpoints, false, List.of("PedidoService"), List.of(), List.of(),
                List.of(), List.of(), List.of());
        ContextoProjeto comTecnologias = new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS, List.of(), List.of(Tecnologia.REDIS, Tecnologia.RABBITMQ),
                List.of(), endpoints,
                new ComponentesContexto(List.of(), List.of("PedidoService"), List.of(), List.of(), List.of(), List.of(), false),
                new TestesContexto(0, List.of(), List.of()), new InfraContexto(false, false), false, false, 0);

        assertThat(alvos(semTecnologia, "FEATURE_CACHE_DE_CONSULTA")).isEmpty();
        assertThat(alvos(semTecnologia, "FEATURE_EVENTO_DE_DOMINIO")).isEmpty();
        assertThat(alvos(comTecnologias, "FEATURE_CACHE_DE_CONSULTA")).containsExactly("ENDPOINT:GET /pedidos");
        assertThat(alvos(comTecnologias, "FEATURE_EVENTO_DE_DOMINIO")).containsExactly("CLASSE:PedidoService");
    }

    @Test
    void naoDeveApontarLacunaQuandoOControllerUsaRequestMappingSemMetodo() {
        ContextoProjeto contexto = contexto(
                List.of(new EndpointContexto("QUALQUER", "/itens", "ItemController"),
                        new EndpointContexto("QUALQUER", "/itens/{id}", "ItemController")),
                false, List.of(), List.of(), List.of(), List.of(), List.of(), List.of());

        List<String> angulosDeLacuna = List.of("FEATURE_BUSCA_POR_ID", "FEATURE_CRIACAO", "FEATURE_ATUALIZACAO_COMPLETA",
                "FEATURE_ATUALIZACAO_PARCIAL", "FEATURE_EXCLUSAO");
        assertThat(angulosDeLacuna).allSatisfy(id -> assertThat(alvos(contexto, id)).isEmpty());
    }

    @Test
    void deveFiltrarPorTipoQuandoPedido() {
        ContextoProjeto contexto = contextoRico();

        assertThat(catalogo.aplicaveis(contexto, TipoDesafio.BUG))
                .allSatisfy(aplicavel -> assertThat(aplicavel.angulo().tipo()).isEqualTo(TipoDesafio.BUG));
        assertThat(catalogo.aplicaveis(contexto, null).stream().map(a -> a.angulo().tipo()).distinct())
                .containsExactlyInAnyOrder(TipoDesafio.TESTING, TipoDesafio.FEATURE, TipoDesafio.BUG);
    }

    @Test
    void deveDevolverAlvosNaMesmaOrdemIndependenteDaOrdemDaEntrada() {
        List<EndpointContexto> endpoints = new ArrayList<>(contextoRico().endpoints());
        Collections.reverse(endpoints);
        ContextoProjeto embaralhado = comEndpoints(contextoRico(), endpoints);

        assertThat(catalogo.aplicaveis(embaralhado, null)).isEqualTo(catalogo.aplicaveis(contextoRico(), null));
    }

    @Test
    void deveGerarChaveEstavelParaOAlvo() {
        assertThat(new AlvoDesafio(EscopoAlvo.CLASSE, "PedidoService", null).chave()).isEqualTo("CLASSE:PedidoService");
        assertThat(new AlvoDesafio(EscopoAlvo.ENDPOINT, "GET /a", "AController").chave()).isEqualTo("ENDPOINT:GET /a");
    }

    private List<String> alvos(ContextoProjeto contexto, String idDoAngulo) {
        return catalogo.porId(idDoAngulo).orElseThrow().alvosEm(contexto).stream().map(AlvoDesafio::chave).toList();
    }

    private AnguloAplicavel aplicavel(ContextoProjeto contexto, String idDoAngulo) {
        return catalogo.aplicaveis(contexto, null).stream()
                .filter(aplicavel -> aplicavel.angulo().id().equals(idDoAngulo))
                .findFirst()
                .orElseThrow();
    }

    private ContextoProjeto contextoVazio() {
        return contexto(List.of(), false, List.of(), List.of(), List.of(), List.of(), List.of(), List.of());
    }

    private ContextoProjeto contextoRico() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS,
                List.of("Cliente", "Pedido"), List.of(Tecnologia.POSTGRESQL), List.of("pedidos", "clientes"),
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

    private ContextoProjeto comEndpoints(ContextoProjeto base, List<EndpointContexto> endpoints) {
        return new ContextoProjeto(
                base.versaoEsquema(), base.versaoLinguagem(), base.versaoFramework(), base.ferramentaDeBuild(),
                base.arquitetura(), base.dominios(), base.tecnologias(), base.features(), endpoints,
                base.componentes(), base.testes(), base.infra(), base.parcial(), base.truncado(), base.itensDescartados());
    }

    private ContextoProjeto contexto(List<EndpointContexto> endpoints, boolean temTratador, List<String> services,
                                     List<String> repositories, List<String> entidades, List<String> dtos,
                                     List<String> excecoes, List<String> controllers) {
        return new ContextoProjeto(
                1, null, null, "maven", Arquitetura.INDEFINIDA, List.of(), List.of(), List.of(), endpoints,
                new ComponentesContexto(controllers, services, repositories, entidades, dtos, excecoes, temTratador),
                new TestesContexto(0, List.of(), List.of()), new InfraContexto(false, false), false, false, 0);
    }
}
