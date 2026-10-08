package com.koda.v1.challenge.api;

import com.koda.v1.analyzer.contexto.Arquitetura;
import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.EndpointContexto;
import com.koda.v1.analyzer.contexto.InfraContexto;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.analyzer.contexto.TestesContexto;
import com.koda.v1.analyzer.persistence.AnaliseDetalhe;
import com.koda.v1.analyzer.persistence.AnaliseNaoEncontradaException;
import com.koda.v1.analyzer.persistence.ConsultaAnalise;
import com.koda.v1.analyzer.persistence.StatusAnalise;
import com.koda.v1.challenge.ConteudoDesafio;
import com.koda.v1.challenge.DesafiosEsgotadosException;
import com.koda.v1.challenge.NivelDesafio;
import com.koda.v1.challenge.SemAnguloAplicavelException;
import com.koda.v1.challenge.SerializadorConteudo;
import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.catalogo.CatalogoAngulos;
import com.koda.v1.challenge.geracao.ContextoIndisponivelException;
import com.koda.v1.challenge.geracao.FilaDeDesafiosCheiaException;
import com.koda.v1.challenge.geracao.IniciadorDesafio;
import com.koda.v1.challenge.persistence.ConsultaDesafio;
import com.koda.v1.challenge.persistence.DesafioDetalhe;
import com.koda.v1.challenge.persistence.DesafioNaoEncontradoException;
import com.koda.v1.challenge.persistence.DesafioResumo;
import com.koda.v1.challenge.persistence.GeracaoEmAndamentoException;
import com.koda.v1.challenge.persistence.RegistroDesafio;
import com.koda.v1.challenge.persistence.StatusGeracao;
import com.koda.v1.challenge.persistence.StatusProgresso;
import com.koda.v1.challenge.prompt.Perspectivas;
import com.koda.v1.challenge.selecao.SeletorDeDesafio;
import com.koda.v1.challenge.selecao.UsoAnterior;
import com.koda.v1.plano.CicloMensal;
import com.koda.v1.plano.CotaMensalExcedidaException;
import com.koda.v1.plano.Plano;
import com.koda.v1.plano.PlanoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DesafioServiceTest {

    private static final Instant AGORA = Instant.parse("2026-09-30T18:00:00Z");

    private final UUID usuarioId = UUID.randomUUID();
    private final UUID analiseId = UUID.randomUUID();
    private final SerializadorContexto serializadorContexto = new SerializadorContexto();
    private final SerializadorConteudo serializadorConteudo = new SerializadorConteudo();
    private final CatalogoAngulos catalogo = new CatalogoAngulos();
    private final Perspectivas perspectivas = new Perspectivas();

    private ConsultaAnalise consultaAnalise;
    private ConsultaDesafio consulta;
    private RegistroDesafio registro;
    private IniciadorDesafio iniciador;
    private PlanoService planos;
    private DesafioService service;

    @BeforeEach
    void preparar() {
        consultaAnalise = mock(ConsultaAnalise.class);
        consulta = mock(ConsultaDesafio.class);
        registro = mock(RegistroDesafio.class);
        iniciador = mock(IniciadorDesafio.class);
        planos = mock(PlanoService.class);
        service = criarServico(5);

        when(consultaAnalise.buscarDoUsuario(usuarioId, analiseId)).thenReturn(analise(StatusAnalise.CONCLUIDA, contextoRico()));
        when(consulta.contarQueGastaramCotaDesde(any(), any())).thenReturn(0L);
        when(consulta.historicoDeUso(any(), any())).thenReturn(List.of());
        when(consulta.perspectivasRecentes(any(), anyInt())).thenReturn(List.of());
        when(registro.registrarNovo(any(), any(), any(), anyString(), anyString(), anyString()))
                .thenReturn(UUID.randomUUID());
    }

    @Test
    void deveRegistrarODesafioComAAngulacaoEscolhidaEDispararAGeracao() {
        UUID desafioId = UUID.randomUUID();
        when(registro.registrarNovo(any(), any(), any(), anyString(), anyString(), anyString())).thenReturn(desafioId);

        DesafioResposta resposta = service.iniciar(usuarioId, analiseId, TipoPedido.FEATURE);

        ArgumentCaptor<String> angulo = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> perspectiva = ArgumentCaptor.forClass(String.class);
        verify(registro).registrarNovo(eq(usuarioId), eq(analiseId), eq(TipoDesafio.FEATURE),
                angulo.capture(), anyString(), perspectiva.capture());
        assertThat(catalogo.porId(angulo.getValue()).orElseThrow().tipo()).isEqualTo(TipoDesafio.FEATURE);
        assertThat(perspectivas.existe(perspectiva.getValue())).isTrue();
        verify(iniciador).disparar(desafioId);
        assertThat(resposta).isEqualTo(new DesafioResposta(desafioId, StatusGeracao.PENDENTE));
    }

    @Test
    void deveEscolherUmTipoSozinhoQuandoOPedidoForAleatorio() {
        service.iniciar(usuarioId, analiseId, TipoPedido.ALEATORIO);

        ArgumentCaptor<TipoDesafio> tipo = ArgumentCaptor.forClass(TipoDesafio.class);
        verify(registro).registrarNovo(any(), any(), tipo.capture(), anyString(), anyString(), anyString());
        assertThat(tipo.getValue()).isIn((Object[]) TipoDesafio.values());
    }

    @Test
    void deveTratarAnaliseDeOutroUsuarioOuInexistenteComoNaoEncontrada() {
        when(consultaAnalise.buscarDoUsuario(usuarioId, analiseId)).thenThrow(new AnaliseNaoEncontradaException(analiseId));

        assertThatThrownBy(() -> service.iniciar(usuarioId, analiseId, TipoPedido.BUG))
                .isInstanceOf(AnaliseNaoEncontradaException.class);
        verify(registro, never()).registrarNovo(any(), any(), any(), anyString(), anyString(), anyString());
    }

    @Test
    void deveRecusarAnaliseQueAindaNaoTerminouOuSemContexto() {
        when(consultaAnalise.buscarDoUsuario(usuarioId, analiseId)).thenReturn(analise(StatusAnalise.EM_ANDAMENTO, contextoRico()));
        assertThatThrownBy(() -> service.iniciar(usuarioId, analiseId, TipoPedido.BUG))
                .isInstanceOf(ContextoIndisponivelException.class);

        Instant agora = Instant.now();
        when(consultaAnalise.buscarDoUsuario(usuarioId, analiseId)).thenReturn(new AnaliseDetalhe(
                analiseId, StatusAnalise.CONCLUIDA, "artur", "koda", "{}", null, null, agora, agora));
        assertThatThrownBy(() -> service.iniciar(usuarioId, analiseId, TipoPedido.BUG))
                .isInstanceOf(ContextoIndisponivelException.class);
        verify(registro, never()).registrarNovo(any(), any(), any(), anyString(), anyString(), anyString());
    }

    @Test
    void deveBarrarQuandoACotaDiariaJaFoiGasta() {
        when(consulta.contarQueGastaramCotaDesde(any(), any())).thenReturn(5L);

        assertThatThrownBy(() -> service.iniciar(usuarioId, analiseId, TipoPedido.FEATURE))
                .isInstanceOf(LimiteDiarioExcedidoException.class)
                .hasMessageContaining("5 desafios");
        verify(consulta, never()).historicoDeUso(any(), any());
        verify(registro, never()).registrarNovo(any(), any(), any(), anyString(), anyString(), anyString());
    }

    @Test
    void devePermitirNoLimiteMenosUmEContarAJanelaDeVinteEQuatroHoras() {
        when(consulta.contarQueGastaramCotaDesde(any(), any())).thenReturn(4L);

        service.iniciar(usuarioId, analiseId, TipoPedido.FEATURE);

        ArgumentCaptor<Instant> desde = ArgumentCaptor.forClass(Instant.class);
        verify(consulta, org.mockito.Mockito.times(2)).contarQueGastaramCotaDesde(eq(usuarioId), desde.capture());
        assertThat(desde.getAllValues().get(0)).isEqualTo(AGORA.minus(Duration.ofHours(24)));
        verify(iniciador).disparar(any());
    }

    @Test
    void deveRecusarLimiteDiarioInvalido() {
        assertThatThrownBy(() -> criarServico(0)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> criarServico(-1)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void deveAvisarQuandoOTipoNaoTemNadaAplicavelOuTudoJaFoiUsado() {
        when(consultaAnalise.buscarDoUsuario(usuarioId, analiseId))
                .thenReturn(analise(StatusAnalise.CONCLUIDA, contextoComUmaUnicaOpcaoDeTesting()));

        assertThatThrownBy(() -> service.iniciar(usuarioId, analiseId, TipoPedido.FEATURE))
                .isInstanceOf(SemAnguloAplicavelException.class);

        when(consulta.historicoDeUso(any(), any())).thenReturn(List.of(
                new UsoAnterior("TESTING_UNITARIO_DE_SERVICE", "CLASSE:ClienteService", true)));
        assertThatThrownBy(() -> service.iniciar(usuarioId, analiseId, TipoPedido.TESTING))
                .isInstanceOf(DesafiosEsgotadosException.class);
        verify(registro, never()).registrarNovo(any(), any(), any(), anyString(), anyString(), anyString());
    }

    @Test
    void deveTraduzirConflitoDoBancoEAvisoDoRegistroParaGeracaoEmAndamento() {
        when(registro.registrarNovo(any(), any(), any(), anyString(), anyString(), anyString()))
                .thenThrow(new DataIntegrityViolationException("duplicado"));
        assertThatThrownBy(() -> service.iniciar(usuarioId, analiseId, TipoPedido.FEATURE))
                .isInstanceOf(GeracaoEmAndamentoException.class);

        doThrow(new GeracaoEmAndamentoException()).when(registro)
                .registrarNovo(any(), any(), any(), anyString(), anyString(), anyString());
        assertThatThrownBy(() -> service.iniciar(usuarioId, analiseId, TipoPedido.FEATURE))
                .isInstanceOf(GeracaoEmAndamentoException.class);
        verify(iniciador, never()).disparar(any());
    }

    @Test
    void deveMarcarComoFalhadoQuandoAFilaEstiverCheia() {
        UUID desafioId = UUID.randomUUID();
        when(registro.registrarNovo(any(), any(), any(), anyString(), anyString(), anyString())).thenReturn(desafioId);
        doThrow(new FilaDeDesafiosCheiaException()).when(iniciador).disparar(desafioId);

        assertThatThrownBy(() -> service.iniciar(usuarioId, analiseId, TipoPedido.FEATURE))
                .isInstanceOf(FilaDeDesafiosCheiaException.class);

        verify(registro).falhar(desafioId, new FilaDeDesafiosCheiaException().getMessage());
    }

    @Test
    void deveConsultarComOConteudoInterpretadoEOCodigoDoTicket() {
        UUID desafioId = UUID.randomUUID();
        ConteudoDesafio conteudo = conteudo("Adicionar filtro");
        when(consulta.buscarDoUsuario(usuarioId, desafioId)).thenReturn(new DesafioDetalhe(
                desafioId, analiseId, 7, TipoDesafio.FEATURE, NivelDesafio.JUNIOR, StatusGeracao.PRONTO,
                "Adicionar filtro", serializadorConteudo.paraJson(conteudo), "modelo-x", null, AGORA, AGORA,
                StatusProgresso.NAO_INICIADO, null, null));

        DesafioDetalheResposta resposta = service.consultar(usuarioId, desafioId);

        assertThat(resposta.codigo()).isEqualTo("DEV-007");
        assertThat(resposta.conteudo()).isEqualTo(conteudo);
        assertThat(resposta.statusGeracao()).isEqualTo(StatusGeracao.PRONTO);
        assertThat(resposta.nivel()).isEqualTo(NivelDesafio.JUNIOR);
    }

    @Test
    void deveConsultarDesafioAindaSemConteudoESemVazarOModelo() {
        UUID desafioId = UUID.randomUUID();
        when(consulta.buscarDoUsuario(usuarioId, desafioId)).thenReturn(new DesafioDetalhe(
                desafioId, analiseId, 120, TipoDesafio.BUG, NivelDesafio.JUNIOR, StatusGeracao.PENDENTE,
                null, null, null, null, AGORA, null, StatusProgresso.NAO_INICIADO, null, null));

        DesafioDetalheResposta resposta = service.consultar(usuarioId, desafioId);

        assertThat(resposta.conteudo()).isNull();
        assertThat(resposta.codigo()).isEqualTo("DEV-120");
        assertThat(DesafioDetalheResposta.class.getRecordComponents())
                .extracting(componente -> componente.getName()).doesNotContain("modelo", "conteudoJson");
    }

    @Test
    void devePropagarNaoEncontradoQuandoODesafioNaoForDoUsuario() {
        UUID desafioId = UUID.randomUUID();
        when(consulta.buscarDoUsuario(usuarioId, desafioId)).thenThrow(new DesafioNaoEncontradoException(desafioId));

        assertThatThrownBy(() -> service.consultar(usuarioId, desafioId)).isInstanceOf(DesafioNaoEncontradoException.class);
    }

    @Test
    void deveListarConferindoPrimeiroODonoDaAnalise() {
        UUID desafioId = UUID.randomUUID();
        when(consulta.listarDaAnalise(usuarioId, analiseId)).thenReturn(List.of(
                new DesafioResumo(desafioId, 3, TipoDesafio.BUG, StatusGeracao.FALHOU,
                        StatusProgresso.NAO_INICIADO, null, "erro", AGORA)));

        List<DesafioResumoResposta> lista = service.listar(usuarioId, analiseId);

        verify(consultaAnalise).buscarDoUsuario(usuarioId, analiseId);
        assertThat(lista).singleElement().satisfies(item -> {
            assertThat(item.codigo()).isEqualTo("DEV-003");
            assertThat(item.mensagemErro()).isEqualTo("erro");
        });
    }

    @Test
    void naoDeveListarQuandoAAnaliseNaoForDoUsuario() {
        when(consultaAnalise.buscarDoUsuario(usuarioId, analiseId)).thenThrow(new AnaliseNaoEncontradaException(analiseId));

        assertThatThrownBy(() -> service.listar(usuarioId, analiseId)).isInstanceOf(AnaliseNaoEncontradaException.class);
        verify(consulta, never()).listarDaAnalise(any(), any());
    }

    @Test
    void deveContarACotaMensalDesdeOInicioDoMesEmSaoPaulo() {
        service.iniciar(usuarioId, analiseId, TipoPedido.BUG);

        CicloMensal ciclo = CicloMensal.contendo(AGORA);
        verify(consulta).contarQueGastaramCotaDesde(usuarioId, ciclo.inicio());
        verify(planos).exigirTicket(usuarioId, 0L, ciclo);
    }

    @Test
    void naoDeveRegistrarNemDispararQuandoAPlanoRecusarACotaMensal() {
        doThrow(new CotaMensalExcedidaException(Plano.GRATIS, CicloMensal.contendo(AGORA).fim()))
                .when(planos).exigirTicket(any(), org.mockito.ArgumentMatchers.anyLong(), any());

        assertThatThrownBy(() -> service.iniciar(usuarioId, analiseId, TipoPedido.BUG))
                .isInstanceOf(CotaMensalExcedidaException.class);
        verify(registro, never()).registrarNovo(any(), any(), any(), anyString(), anyString(), anyString());
        verify(iniciador, never()).disparar(any());
    }

    @Test
    void deveAplicarOLimiteDiarioAntesDaCotaMensal() {
        when(consulta.contarQueGastaramCotaDesde(any(), any())).thenReturn(5L);

        assertThatThrownBy(() -> service.iniciar(usuarioId, analiseId, TipoPedido.BUG))
                .isInstanceOf(LimiteDiarioExcedidoException.class);
        verify(planos, never()).exigirTicket(any(), org.mockito.ArgumentMatchers.anyLong(), any());
    }

    private DesafioService criarServico(int limite) {
        return new DesafioService(consultaAnalise, serializadorContexto, consulta, registro,
                new SeletorDeDesafio(catalogo), perspectivas, iniciador, serializadorConteudo, planos, limite,
                Clock.fixed(AGORA, ZoneOffset.UTC));
    }

    private AnaliseDetalhe analise(StatusAnalise status, ContextoProjeto contexto) {
        return new AnaliseDetalhe(analiseId, status, "artur", "koda", "{}",
                serializadorContexto.paraJson(contexto), null, AGORA, AGORA);
    }

    private ConteudoDesafio conteudo(String titulo) {
        return new ConteudoDesafio(titulo, "Contexto.", "Cenário.", "Objetivo.",
                List.of("R1", "R2"), List.of("Q1", "Q2"), List.of("C1", "C2"),
                List.of("T1"), List.of("X1"), List.of("H1"));
    }

    private ContextoProjeto contextoRico() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS, List.of("Pedido"), List.of(), List.of("pedidos"),
                List.of(new EndpointContexto("GET", "/pedidos", "PedidoController"),
                        new EndpointContexto("POST", "/pedidos", "PedidoController"),
                        new EndpointContexto("GET", "/pedidos/{id}", "PedidoController")),
                new ComponentesContexto(
                        List.of("PedidoController"), List.of("PedidoService", "ClienteService"),
                        List.of("PedidoRepository"), List.of("Pedido", "Cliente"),
                        List.of("CriarPedidoRequest"), List.of("PedidoNaoEncontradoException"), false),
                new TestesContexto(0, List.of("PedidoService"), List.of("PedidoController")),
                new InfraContexto(false, false), false, false, 0);
    }

    private ContextoProjeto contextoComUmaUnicaOpcaoDeTesting() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.INDEFINIDA, List.of(), List.of(), List.of(), List.of(),
                new ComponentesContexto(List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), false),
                new TestesContexto(0, List.of("ClienteService"), List.of()), new InfraContexto(false, false),
                false, false, 0);
    }
}
