package com.koda.v1.challenge.geracao;

import com.koda.v1.analyzer.contexto.Arquitetura;
import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.EndpointContexto;
import com.koda.v1.analyzer.contexto.InfraContexto;
import com.koda.v1.analyzer.contexto.TestesContexto;
import com.koda.v1.challenge.ConteudoDesafio;
import com.koda.v1.challenge.DesafiosEsgotadosException;
import com.koda.v1.challenge.SerializadorConteudo;
import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.VerificadorConteudo;
import com.koda.v1.challenge.catalogo.CatalogoAngulos;
import com.koda.v1.challenge.ia.MotivoFalhaIa;
import com.koda.v1.challenge.ia.ProvedorIa;
import com.koda.v1.challenge.ia.ProvedorIaException;
import com.koda.v1.challenge.ia.RespostaIa;
import com.koda.v1.challenge.persistence.ConsultaDesafio;
import com.koda.v1.challenge.persistence.DadosGeracao;
import com.koda.v1.challenge.persistence.DesafioNaoEncontradoException;
import com.koda.v1.challenge.persistence.RegistroDesafio;
import com.koda.v1.challenge.prompt.MontadorPrompt;
import com.koda.v1.challenge.prompt.Perspectivas;
import com.koda.v1.challenge.prompt.PromptDesafio;
import com.koda.v1.challenge.selecao.SeletorDeDesafio;
import com.koda.v1.challenge.similaridade.DetectorSimilaridade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class GeradorDesafioTest {

    private final UUID desafioId = UUID.randomUUID();
    private final UUID usuarioId = UUID.randomUUID();
    private final UUID analiseId = UUID.randomUUID();
    private final SerializadorConteudo serializador = new SerializadorConteudo();
    private final CatalogoAngulos catalogo = new CatalogoAngulos();
    private final Perspectivas perspectivas = new Perspectivas();

    private RegistroDesafio registro;
    private ConsultaDesafio consulta;
    private CarregadorContexto carregador;
    private ProvedorIa provedor;
    private GeradorDesafio gerador;

    private DadosGeracao dados;

    @BeforeEach
    void preparar() {
        registro = mock(RegistroDesafio.class);
        consulta = mock(ConsultaDesafio.class);
        carregador = mock(CarregadorContexto.class);
        provedor = mock(ProvedorIa.class);
        dados = new DadosGeracao(desafioId, usuarioId, analiseId, TipoDesafio.FEATURE,
                "FEATURE_PAGINACAO", "ENDPOINT:GET /pedidos", perspectivas.todas().get(0));

        when(registro.iniciar(desafioId)).thenReturn(dados);
        when(carregador.carregar(usuarioId, analiseId)).thenReturn(contextoRico());
        when(consulta.conteudosRecentes(any(), anyInt())).thenReturn(List.of());
        when(consulta.titulosRecentes(any(), anyInt())).thenReturn(List.of("Título recente"));
        when(consulta.perspectivasRecentes(any(), anyInt())).thenReturn(List.of());
        when(consulta.historicoDeUso(any(), any())).thenReturn(List.of());

        gerador = criarGerador(Duration.ofMinutes(3));
    }

    @Test
    void deveGerarEGravarOTicketNaPrimeiraChamada() {
        when(provedor.gerar(any())).thenReturn(resposta("paginação de pedidos", "groq/llama-3"));

        gerador.gerar(desafioId);

        ArgumentCaptor<String> json = ArgumentCaptor.forClass(String.class);
        verify(registro).concluir(eq(desafioId), eq(tituloDe("paginação de pedidos")), json.capture(), eq(1), eq("groq/llama-3"));
        assertThat(serializador.deJson(json.getValue()).titulo()).isEqualTo(tituloDe("paginação de pedidos"));
        verify(registro, times(1)).registrarTentativa(desafioId);
        verify(registro, never()).falhar(any(), anyString());
        verify(registro, never()).reselecionar(any(), anyString(), anyString(), anyString());
        verify(provedor, times(1)).gerar(any());
    }

    @Test
    void deveEnviarOPromptComOAnguloOAlvoEOsTitulosRecentes() {
        when(provedor.gerar(any())).thenReturn(resposta("paginação de pedidos", null));

        gerador.gerar(desafioId);

        ArgumentCaptor<PromptDesafio> prompt = ArgumentCaptor.forClass(PromptDesafio.class);
        verify(provedor).gerar(prompt.capture());
        assertThat(prompt.getValue().usuario()).contains("Paginação de uma listagem", "endpoint GET /pedidos", "- Título recente");
        verify(registro).concluir(eq(desafioId), anyString(), anyString(), eq(1), eq(null));
    }

    @Test
    void deveTentarDeNovoQuandoAPrimeiraRespostaVemForaDoFormato() {
        when(provedor.gerar(any())).thenReturn(new RespostaIa("isso não é json", "m"), resposta("segunda tentativa", "m"));

        gerador.gerar(desafioId);

        verify(registro, times(2)).registrarTentativa(desafioId);
        verify(provedor, times(2)).gerar(any());
        verify(registro).concluir(eq(desafioId), eq(tituloDe("segunda tentativa")), anyString(), eq(1), eq("m"));
        verify(registro, never()).reselecionar(any(), anyString(), anyString(), anyString());
    }

    @Test
    void deveTentarDeNovoQuandoOProvedorAvisaDeRespostaInvalidaOuGrandeDemais() {
        when(provedor.gerar(any()))
                .thenThrow(new ProvedorIaException(MotivoFalhaIa.RESPOSTA_INVALIDA))
                .thenReturn(resposta("depois do erro", "m"));

        gerador.gerar(desafioId);

        verify(provedor, times(2)).gerar(any());
        verify(registro).concluir(eq(desafioId), eq(tituloDe("depois do erro")), anyString(), eq(1), eq("m"));
    }

    @Test
    void deveFalharComMensagemFixaQuandoAsDuasRespostasVierenForaDoFormato() {
        when(provedor.gerar(any())).thenReturn(new RespostaIa("lixo", "m"), new RespostaIa("{}", "m"));

        gerador.gerar(desafioId);

        verify(provedor, times(2)).gerar(any());
        verify(registro).falhar(desafioId, GeradorDesafio.MENSAGEM_FORA_DO_FORMATO);
        verify(registro, never()).concluir(any(), anyString(), anyString(), anyInt(), any());
    }

    @Test
    void naoDeveTentarDeNovoQuandoOProvedorAtingiuOLimiteOuRecusouACredencial() {
        for (MotivoFalhaIa motivo : List.of(MotivoFalhaIa.LIMITE_ATINGIDO, MotivoFalhaIa.NAO_AUTORIZADO)) {
            registro = mock(RegistroDesafio.class);
            provedor = mock(ProvedorIa.class);
            when(registro.iniciar(desafioId)).thenReturn(dados);
            when(provedor.gerar(any())).thenThrow(new ProvedorIaException(motivo));
            gerador = criarGerador(Duration.ofMinutes(3));

            gerador.gerar(desafioId);

            verify(provedor, times(1)).gerar(any());
            verify(registro).falhar(desafioId, motivo.mensagem());
            verify(registro, never()).concluir(any(), anyString(), anyString(), anyInt(), any());
        }
    }

    @Test
    void deveTentarDeNovoQuandoOProvedorNaoRespondeNaPrimeiraChamada() {
        when(provedor.gerar(any()))
                .thenThrow(new ProvedorIaException(MotivoFalhaIa.INDISPONIVEL))
                .thenReturn(resposta("ticket novo", "m"));

        gerador.gerar(desafioId);

        verify(provedor, times(2)).gerar(any());
        verify(registro).concluir(eq(desafioId), anyString(), anyString(), anyInt(), eq("m"));
        verify(registro, never()).falhar(any(), anyString());
    }

    @Test
    void deveFalharComAMensagemDoProvedorQuandoEleNaoRespondeNasDuasChamadas() {
        when(provedor.gerar(any())).thenThrow(new ProvedorIaException(MotivoFalhaIa.INDISPONIVEL));

        gerador.gerar(desafioId);

        verify(provedor, times(2)).gerar(any());
        verify(registro).falhar(desafioId, MotivoFalhaIa.INDISPONIVEL.mensagem());
    }

    @Test
    void deveReselecionarOutroAnguloQuandoOTicketVierParecidoDemais() {
        ConteudoDesafio anterior = conteudo("paginação de pedidos");
        when(consulta.conteudosRecentes(any(), anyInt())).thenReturn(List.of(anterior));
        when(provedor.gerar(any())).thenReturn(
                new RespostaIa(serializador.paraJson(anterior), "m"), resposta("assunto totalmente novo", "m"));

        gerador.gerar(desafioId);

        ArgumentCaptor<String> angulo = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> novaPerspectiva = ArgumentCaptor.forClass(String.class);
        verify(registro).reselecionar(eq(desafioId), angulo.capture(), anyString(), novaPerspectiva.capture());
        assertThat(angulo.getValue()).isNotEqualTo("FEATURE_PAGINACAO");
        assertThat(catalogo.porId(angulo.getValue()).orElseThrow().tipo()).isEqualTo(TipoDesafio.FEATURE);
        assertThat(perspectivas.existe(novaPerspectiva.getValue())).isTrue();
        assertThat(novaPerspectiva.getValue()).isNotEqualTo(dados.perspectiva());

        ArgumentCaptor<PromptDesafio> prompts = ArgumentCaptor.forClass(PromptDesafio.class);
        verify(provedor, times(2)).gerar(prompts.capture());
        assertThat(prompts.getAllValues().get(1).usuario()).isNotEqualTo(prompts.getAllValues().get(0).usuario());
        verify(registro, times(2)).registrarTentativa(desafioId);
        verify(registro).concluir(eq(desafioId), eq(tituloDe("assunto totalmente novo")), anyString(), eq(1), eq("m"));
    }

    @Test
    void deveFalharSemRepetirEmSilencioQuandoOsDoisTicketsVierenParecidos() {
        ConteudoDesafio anterior = conteudo("paginação de pedidos");
        when(consulta.conteudosRecentes(any(), anyInt())).thenReturn(List.of(anterior));
        when(provedor.gerar(any())).thenReturn(new RespostaIa(serializador.paraJson(anterior), "m"));

        gerador.gerar(desafioId);

        verify(provedor, times(2)).gerar(any());
        verify(registro, times(1)).reselecionar(eq(desafioId), anyString(), anyString(), anyString());
        verify(registro).falhar(desafioId, GeradorDesafio.MENSAGEM_REPETIDO);
        verify(registro, never()).concluir(any(), anyString(), anyString(), anyInt(), any());
    }

    @Test
    void deveAvisarQueOsDesafiosEsgotaramQuandoNaoHaOutroAnguloParaTrocar() {
        DadosGeracao unico = new DadosGeracao(desafioId, usuarioId, analiseId, TipoDesafio.TESTING,
                "TESTING_UNITARIO_DE_SERVICE", "CLASSE:ClienteService", perspectivas.todas().get(0));
        when(registro.iniciar(desafioId)).thenReturn(unico);
        when(carregador.carregar(usuarioId, analiseId)).thenReturn(contextoComUmaUnicaOpcao());
        ConteudoDesafio anterior = conteudo("testes do cliente");
        when(consulta.conteudosRecentes(any(), anyInt())).thenReturn(List.of(anterior));
        when(provedor.gerar(any())).thenReturn(new RespostaIa(serializador.paraJson(anterior), "m"));

        gerador.gerar(desafioId);

        verify(registro).falhar(desafioId, new DesafiosEsgotadosException().getMessage());
        verify(provedor, times(1)).gerar(any());
    }

    @Test
    void deveFalharSemChamarAIaQuandoAAnaliseNaoTemContexto() {
        when(carregador.carregar(usuarioId, analiseId)).thenThrow(new ContextoIndisponivelException());

        gerador.gerar(desafioId);

        verify(registro).falhar(desafioId, new ContextoIndisponivelException().getMessage());
        verify(provedor, never()).gerar(any());
        verify(registro, never()).registrarTentativa(any());
    }

    @Test
    void deveFalharSemChamarAIaQuandoOAnguloOuOAlvoNaoFazemMaisSentido() {
        List<DadosGeracao> invalidos = List.of(
                new DadosGeracao(desafioId, usuarioId, analiseId, TipoDesafio.FEATURE,
                        "ANGULO_QUE_NAO_EXISTE", "ENDPOINT:GET /pedidos", perspectivas.todas().get(0)),
                new DadosGeracao(desafioId, usuarioId, analiseId, TipoDesafio.FEATURE,
                        "FEATURE_PAGINACAO", "ENDPOINT:GET /que-nao-existe", perspectivas.todas().get(0)),
                new DadosGeracao(desafioId, usuarioId, analiseId, TipoDesafio.BUG,
                        "FEATURE_PAGINACAO", "ENDPOINT:GET /pedidos", perspectivas.todas().get(0)));

        for (DadosGeracao invalido : invalidos) {
            registro = mock(RegistroDesafio.class);
            when(registro.iniciar(desafioId)).thenReturn(invalido);
            gerador = criarGerador(Duration.ofMinutes(3));

            gerador.gerar(desafioId);

            verify(registro).falhar(desafioId, GeradorDesafio.MENSAGEM_NAO_PREPARADO);
        }
        verify(provedor, never()).gerar(any());
    }

    @Test
    void naoDeveVazarDetalheDeErroInesperadoNaMensagem() {
        when(provedor.gerar(any())).thenThrow(new IllegalStateException("segredo-xyz em /caminho/interno"));

        gerador.gerar(desafioId);

        verify(registro).falhar(desafioId, GeradorDesafio.MENSAGEM_ERRO_INESPERADO);
    }

    @Test
    void deveFalharQuandoOPrazoJaEstourouAntesDeChamarAIa() {
        GeradorDesafio semTempo = criarGerador(Duration.ofMillis(-1));

        semTempo.gerar(desafioId);

        verify(registro).falhar(desafioId, GeradorDesafio.MENSAGEM_PRAZO);
        verify(provedor, never()).gerar(any());
        verify(registro, never()).registrarTentativa(any());
    }

    @Test
    void deveFalharPorPrazoEntreAPrimeiraEASegundaChamada() {
        GeradorDesafio curto = criarGerador(Duration.ofMillis(40));
        when(provedor.gerar(any())).thenAnswer(chamada -> {
            Thread.sleep(150);
            return new RespostaIa("lixo", "m");
        });

        curto.gerar(desafioId);

        verify(provedor, times(1)).gerar(any());
        verify(registro).falhar(desafioId, GeradorDesafio.MENSAGEM_PRAZO);
    }

    @Test
    void deveDeixarPassarQuandoODesafioNaoExiste() {
        when(registro.iniciar(desafioId)).thenThrow(new DesafioNaoEncontradoException(desafioId));

        assertThatThrownBy(() -> gerador.gerar(desafioId)).isInstanceOf(DesafioNaoEncontradoException.class);
        verify(registro, never()).falhar(any(), anyString());
    }

    private GeradorDesafio criarGerador(Duration prazo) {
        return new GeradorDesafio(
                registro, consulta, carregador, catalogo, new SeletorDeDesafio(catalogo), perspectivas,
                new MontadorPrompt(perspectivas), provedor, new VerificadorConteudo(),
                new DetectorSimilaridade(0.70), serializador, prazo);
    }

    private String tituloDe(String tema) {
        return "Ticket sobre " + tema;
    }

    private RespostaIa resposta(String tema, String modelo) {
        return new RespostaIa(serializador.paraJson(conteudo(tema)), modelo);
    }

    private ConteudoDesafio conteudo(String tema) {
        return new ConteudoDesafio(
                tituloDe(tema),
                "Contexto do módulo de " + tema + ".",
                "Hoje o sistema trata " + tema + " de forma incompleta e sem critério claro.",
                "Resolver a necessidade de " + tema + " com uma entrega pequena.",
                List.of("Regra de " + tema + " um.", "Regra de " + tema + " dois."),
                List.of("Requisito de " + tema + " um.", "Requisito de " + tema + " dois."),
                List.of("Critério de " + tema + " um.", "Critério de " + tema + " dois."),
                List.of("Teste de " + tema + "."),
                List.of("Restrição de " + tema + "."),
                List.of("Habilidade de " + tema + "."));
    }

    private ContextoProjeto contextoRico() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS, List.of("Pedido"), List.of(), List.of("pedidos"),
                List.of(new EndpointContexto("GET", "/pedidos", "PedidoController"),
                        new EndpointContexto("GET", "/clientes", "ClienteController"),
                        new EndpointContexto("POST", "/clientes", "ClienteController")),
                new ComponentesContexto(
                        List.of("PedidoController", "ClienteController"), List.of("PedidoService", "ClienteService"),
                        List.of("PedidoRepository"), List.of("Pedido", "Cliente"),
                        List.of("CriarClienteRequest"), List.of("PedidoNaoEncontradoException"), false),
                new TestesContexto(0, List.of("PedidoService", "ClienteService"), List.of("PedidoController")),
                new InfraContexto(false, false), false, false, 0);
    }

    private ContextoProjeto contextoComUmaUnicaOpcao() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.INDEFINIDA, List.of(), List.of(), List.of(), List.of(),
                new ComponentesContexto(List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), false),
                new TestesContexto(0, List.of("ClienteService"), List.of()), new InfraContexto(false, false),
                false, false, 0);
    }
}
