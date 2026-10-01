package com.koda.v1.challenge.validacao;

import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.challenge.ConteudoDesafio;
import com.koda.v1.challenge.SerializadorConteudo;
import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.catalogo.AlvoDesafio;
import com.koda.v1.challenge.catalogo.CatalogoAngulos;
import com.koda.v1.challenge.catalogo.EscopoAlvo;
import com.koda.v1.challenge.selecao.SelecaoDeDesafio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ValidadorDesafioTest {

    private final ValidadorDesafio validador = new ValidadorDesafio();
    private final CatalogoAngulos catalogo = new CatalogoAngulos();
    private final SerializadorConteudo serializador = new SerializadorConteudo();

    private ContextoProjeto contexto;
    private SelecaoDeDesafio selecao;

    @BeforeEach
    void preparar() throws IOException {
        contexto = new SerializadorContexto().deJson(ler("/validacao/contexto-pagamentos.json"));
        selecao = selecao("FEATURE_PAGINACAO", EscopoAlvo.RECURSO, "pagamento");
    }

    @Test
    void deveAprovarUmTicketBemFormadoQueCitaOAlvoEAsClassesDoProjeto() {
        assertThat(validador.validar(ticket(), selecao, contexto)).isEmpty();
    }

    @Test
    void deveAprovarTodosOsTicketsReaisGeradosNaMedicaoComIaReal() throws IOException {
        JsonNode todos = JsonMapper.builder().build().readTree(ler("/validacao/tickets-reais.json"));
        List<String> reprovados = new ArrayList<>();

        for (JsonNode item : todos) {
            String[] alvo = item.get("alvoChave").asString().split(":", 2);
            SelecaoDeDesafio doTicket = selecao(item.get("anguloId").asString(), EscopoAlvo.valueOf(alvo[0]), alvo[1]);
            ConteudoDesafio conteudo = serializador.deJson(item.get("conteudo").toString());

            List<MotivoReprovacao> motivos = validador.validar(conteudo, doTicket, contexto);
            if (!motivos.isEmpty()) {
                reprovados.add("#" + item.get("numero").asInt() + " " + motivos);
            }
        }

        assertThat(reprovados).as("tickets reais reprovados").isEmpty();
    }

    @Test
    void deveReprovarCodigoEPassoAPassoDeImplementacao() {
        assertThat(validador.validar(com(ticket().titulo(), "Chame o método buscarPorStatus() no repositório."),
                selecao, contexto)).contains(MotivoReprovacao.SOLUCAO_ENTREGUE);
        assertThat(validador.validar(com(ticket().titulo(), "Basta trocar o retorno para uma lista."),
                selecao, contexto)).contains(MotivoReprovacao.SOLUCAO_ENTREGUE);
        assertThat(validador.validar(com(ticket().titulo(), "A solução é validar antes de salvar."),
                selecao, contexto)).contains(MotivoReprovacao.SOLUCAO_ENTREGUE);
        assertThat(validador.validar(com(ticket().titulo(), "Use x -> x.getId() para mapear."),
                selecao, contexto)).contains(MotivoReprovacao.SOLUCAO_ENTREGUE);
    }

    @Test
    void naoDeveConfundirPluralComParentesesComChamadaDeMetodo() {
        assertThat(validador.validar(com(ticket().titulo(), "O campo(s) opcional(is) pode vir vazio."),
                selecao, contexto)).doesNotContain(MotivoReprovacao.SOLUCAO_ENTREGUE);
    }

    @Test
    void deveReprovarClasseEEndpointQueNaoExistemNoContexto() {
        assertThat(validador.validar(com(ticket().titulo(), "O PedidoService calcula o total hoje."),
                selecao, contexto)).contains(MotivoReprovacao.REFERENCIA_INEXISTENTE);
        assertThat(validador.validar(com(ticket().titulo(), "O endpoint GET /clientes devolve a lista hoje."),
                selecao, contexto)).contains(MotivoReprovacao.REFERENCIA_INEXISTENTE);
    }

    @Test
    void devePermitirNomearAlgoNovoQuandoOTextoDizQueDeveSerCriado() {
        assertThat(validador.validar(com(ticket().titulo(), "Deve ser criado um PagamentoResponseDTO para a resposta."),
                selecao, contexto)).doesNotContain(MotivoReprovacao.REFERENCIA_INEXISTENTE);
        assertThat(validador.validar(com(ticket().titulo(), "Implementar o endpoint DELETE /pagamentos/{id}."),
                selecao, contexto)).doesNotContain(MotivoReprovacao.REFERENCIA_INEXISTENTE);
    }

    @Test
    void naoDeveJulgarUmNomeCortadoPeloVerificadorNoFimDoTexto() {
        assertThat(validador.validar(com("O endpoint GET /pedi…", "Objetivo comum."), selecao, contexto))
                .doesNotContain(MotivoReprovacao.REFERENCIA_INEXISTENTE);
        assertThat(validador.validar(com("A classe PedidoServi…", "Objetivo comum."), selecao, contexto))
                .doesNotContain(MotivoReprovacao.REFERENCIA_INEXISTENTE);
    }

    @Test
    void devePermitirClassesDeFrameworkEDoJdk() {
        assertThat(validador.validar(com(ticket().titulo(), "A resposta vem como ResponseEntity e não como NullPointerException."),
                selecao, contexto)).doesNotContain(MotivoReprovacao.REFERENCIA_INEXISTENTE);
    }

    @Test
    void deveReprovarCriterioVagoOuCurtoDemais() {
        ConteudoDesafio vago = ticketComCriterios(List.of("Melhorar o desempenho da listagem", "Retorna 200 com a lista"));
        ConteudoDesafio curto = ticketComCriterios(List.of("Funciona bem", "Retorna 200 com a lista de pagamentos"));

        assertThat(validador.validar(vago, selecao, contexto)).contains(MotivoReprovacao.CRITERIO_VAGO);
        assertThat(validador.validar(curto, selecao, contexto)).contains(MotivoReprovacao.CRITERIO_VAGO);
    }

    @Test
    void deveExigirTesteNoTicketDeTestingEDefeitoNoTicketDeBug() {
        SelecaoDeDesafio testing = selecao("TESTING_UNITARIO_DE_SERVICE", EscopoAlvo.CLASSE, "PagamentoService");
        SelecaoDeDesafio bug = selecao("BUG_NULO_EM_CAMPO_OPCIONAL", EscopoAlvo.RECURSO, "pagamento");

        assertThat(validador.validar(ticket(), testing, contexto)).contains(MotivoReprovacao.TIPO_INCOERENTE);
        assertThat(validador.validar(ticket(), bug, contexto)).contains(MotivoReprovacao.TIPO_INCOERENTE);
    }

    @Test
    void deveReprovarTicketQueNaoCitaOAlvo() {
        SelecaoDeDesafio outroAlvo = selecao("FEATURE_PAGINACAO", EscopoAlvo.CLASSE, "PagamentoRepository");

        assertThat(validador.validar(ticket(), outroAlvo, contexto)).contains(MotivoReprovacao.FORA_DO_ALVO);
    }

    @Test
    void naoDeveExigirOAlvoQuandoOEscopoEOProjetoTodo() {
        SelecaoDeDesafio projeto = selecao("FEATURE_PAGINACAO", EscopoAlvo.PROJETO, "qualquer coisa");

        assertThat(validador.validar(ticket(), projeto, contexto)).doesNotContain(MotivoReprovacao.FORA_DO_ALVO);
    }

    @Test
    void deveReprovarTicketQueCitaClassesDemais() {
        var componentes = contexto.componentes();
        var maior = new ComponentesContexto(componentes.controllers(), componentes.services(),
                componentes.repositories(), componentes.entidades(),
                List.of("ADto", "BDto", "CDto"), componentes.excecoes(), componentes.temTratadorDeErros());
        ContextoProjeto grande = new ContextoProjeto(contexto.versaoEsquema(), contexto.versaoJava(),
                contexto.versaoSpringBoot(), contexto.ferramentaDeBuild(), contexto.arquitetura(),
                contexto.dominios(), contexto.tecnologias(), contexto.features(), contexto.endpoints(),
                maior, contexto.testes(), contexto.infra(), contexto.parcial(), contexto.truncado(),
                contexto.itensDescartados());
        String muitas = "Mexe em PagamentoController, PagamentoService, PagamentoRepository, Pagamento, ADto, BDto e CDto.";

        assertThat(validador.validar(com(ticket().titulo(), muitas), selecao, grande))
                .contains(MotivoReprovacao.ESCOPO_GRANDE);
    }

    @Test
    void deveAprovarUmaDicaQueSoApontaOCaminho() {
        assertThat(validador.validarDica(
                "Releia o objetivo e descubra em que parte do PagamentoService o comportamento atual difere do esperado.",
                contexto)).isEmpty();
    }

    @Test
    void deveReprovarDicaQueEntregaASolucaoOuCitaAlgoInexistente() {
        assertThat(validador.validarDica("Chame buscarPorStatus() no repositório.", contexto))
                .contains(MotivoReprovacao.SOLUCAO_ENTREGUE);
        assertThat(validador.validarDica("Basta trocar o retorno por uma lista.", contexto))
                .contains(MotivoReprovacao.SOLUCAO_ENTREGUE);
        assertThat(validador.validarDica("Olhe o PedidoService que já calcula isso.", contexto))
                .contains(MotivoReprovacao.REFERENCIA_INEXISTENTE);
    }

    private ConteudoDesafio ticket() {
        return new ConteudoDesafio(
                "Adicionar paginação na listagem de pagamentos",
                "O time financeiro precisa consultar pagamentos sem carregar tudo de uma vez.",
                "O PagamentoController devolve todos os pagamentos em uma única resposta.",
                "Permitir pedir os pagamentos por páginas, com tamanho e número da página opcionais.",
                List.of("Sem parâmetros, a primeira página é devolvida", "O tamanho máximo da página é 50"),
                List.of("Manter o formato atual de cada item da resposta", "Usar o PagamentoService existente"),
                List.of("Pedir a página 2 com tamanho 10 devolve até 10 pagamentos", "Tamanho acima de 50 retorna status 400"),
                List.of("Teste de service para a primeira página"),
                List.of("Não alterar o contrato dos demais endpoints"),
                List.of("Paginação"));
    }

    private ConteudoDesafio ticketComCriterios(List<String> criterios) {
        ConteudoDesafio base = ticket();
        return new ConteudoDesafio(base.titulo(), base.contexto(), base.cenarioAtual(), base.objetivo(),
                base.regrasDeNegocio(), base.requisitosTecnicos(), criterios, base.testesEsperados(),
                base.restricoes(), base.habilidades());
    }

    private ConteudoDesafio com(String titulo, String objetivo) {
        ConteudoDesafio base = ticket();
        return new ConteudoDesafio(titulo, base.contexto(), base.cenarioAtual(), objetivo + " pagamento",
                base.regrasDeNegocio(), base.requisitosTecnicos(), base.criteriosDeAceite(), base.testesEsperados(),
                base.restricoes(), base.habilidades());
    }

    private SelecaoDeDesafio selecao(String anguloId, EscopoAlvo escopo, String nome) {
        return new SelecaoDeDesafio(catalogo.porId(anguloId).orElseThrow(), new AlvoDesafio(escopo, nome, null));
    }

    private String ler(String recurso) throws IOException {
        try (var entrada = getClass().getResourceAsStream(recurso)) {
            return new String(entrada.readAllBytes(), StandardCharsets.UTF_8).trim();
        }
    }
}
