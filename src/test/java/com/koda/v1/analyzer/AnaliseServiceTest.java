package com.koda.v1.analyzer;

import com.koda.v1.analyzer.contexto.Arquitetura;
import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.InfraContexto;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.analyzer.contexto.TestesContexto;
import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.analyzer.persistence.AnaliseDetalhe;
import com.koda.v1.analyzer.persistence.AnaliseEmAndamentoException;
import com.koda.v1.analyzer.persistence.AnaliseNaoEncontradaException;
import com.koda.v1.analyzer.persistence.ConsultaAnalise;
import com.koda.v1.analyzer.persistence.RegistroAnalise;
import com.koda.v1.analyzer.persistence.StatusAnalise;
import com.koda.v1.github.GithubService;
import com.koda.v1.github.dto.RepositorioResposta;
import com.koda.v1.plano.LimiteDeRepositoriosExcedidoException;
import com.koda.v1.plano.Plano;
import com.koda.v1.plano.PlanoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AnaliseServiceTest {

    private final UUID usuarioId = UUID.randomUUID();
    private final UUID analiseId = UUID.randomUUID();

    private GithubService github;
    private RegistroAnalise registro;
    private ConsultaAnalise consulta;
    private IniciadorAnalise iniciador;
    private PlanoService planos;
    private AnaliseService service;

    @BeforeEach
    void preparar() {
        github = mock(GithubService.class);
        registro = mock(RegistroAnalise.class);
        consulta = mock(ConsultaAnalise.class);
        iniciador = mock(IniciadorAnalise.class);
        planos = mock(PlanoService.class);
        service = new AnaliseService(
                github, registro, consulta, iniciador, new SerializadorResultado(), new SerializadorContexto(), planos);
    }

    @Test
    void deveRegistrarEDispararAAnaliseDeUmRepositorioPublicoDoUsuario() {
        when(github.buscarRepositorio(usuarioId, "artur", "koda")).thenReturn(repositorio("Artur/koda", false));
        when(registro.registrarNovaAnalise(usuarioId, 42L, "Artur", "koda", "main")).thenReturn(analiseId);

        AnaliseResposta resposta = service.iniciar(usuarioId, "artur", "artur", "koda");

        assertThat(resposta.id()).isEqualTo(analiseId);
        assertThat(resposta.status()).isEqualTo(StatusAnalise.PENDENTE);
        verify(iniciador).disparar(analiseId);
    }

    @Test
    void deveConferirOLimiteDoPlanoQuandoORepositorioForNovo() {
        when(github.buscarRepositorio(usuarioId, "artur", "koda")).thenReturn(repositorio("Artur/koda", false));
        when(consulta.repositorioRegistrado(usuarioId, 42L)).thenReturn(false);
        when(consulta.contarRepositorios(usuarioId)).thenReturn(1L);
        when(registro.registrarNovaAnalise(usuarioId, 42L, "Artur", "koda", "main")).thenReturn(analiseId);

        service.iniciar(usuarioId, "artur", "artur", "koda");

        verify(planos).exigirRepositorio(usuarioId, 1L);
    }

    @Test
    void naoDeveCobrarLimiteDeNovoRepositorioQuandoJaEstaRegistrado() {
        when(github.buscarRepositorio(usuarioId, "artur", "koda")).thenReturn(repositorio("Artur/koda", false));
        when(consulta.repositorioRegistrado(usuarioId, 42L)).thenReturn(true);
        when(registro.registrarNovaAnalise(usuarioId, 42L, "Artur", "koda", "main")).thenReturn(analiseId);

        service.iniciar(usuarioId, "artur", "artur", "koda");

        verify(planos, never()).exigirRepositorio(any(), anyLong());
    }

    @Test
    void naoDeveRegistrarNemDispararQuandoOPlanoRecusarONovoRepositorio() {
        when(github.buscarRepositorio(usuarioId, "artur", "koda")).thenReturn(repositorio("Artur/koda", false));
        doThrow(new LimiteDeRepositoriosExcedidoException(Plano.GRATIS)).when(planos).exigirRepositorio(any(), anyLong());

        assertThatThrownBy(() -> service.iniciar(usuarioId, "artur", "artur", "koda"))
                .isInstanceOf(LimiteDeRepositoriosExcedidoException.class);
        verify(registro, never()).registrarNovaAnalise(any(), anyLong(), anyString(), anyString(), anyString());
        verify(iniciador, never()).disparar(any());
    }

    @Test
    void deveArquivarORepositorioDaAnaliseDoUsuario() {
        service.arquivarRepositorio(usuarioId, analiseId);

        verify(registro).arquivarRepositorio(usuarioId, analiseId);
    }

    @Test
    void naoDeveEngolirOErroQuandoAnaliseNaoForDoUsuario() {
        doThrow(new AnaliseNaoEncontradaException(analiseId)).when(registro).arquivarRepositorio(usuarioId, analiseId);

        assertThatThrownBy(() -> service.arquivarRepositorio(usuarioId, analiseId))
                .isInstanceOf(AnaliseNaoEncontradaException.class);
    }

    @Test
    void naoDeveAceitarRepositorioPrivado() {
        when(github.buscarRepositorio(usuarioId, "artur", "koda")).thenReturn(repositorio("artur/koda", true));

        assertThatThrownBy(() -> service.iniciar(usuarioId, "artur", "artur", "koda"))
                .isInstanceOf(RepositorioNaoAnalisavelException.class);
        verify(registro, never()).registrarNovaAnalise(any(), anyLong(), anyString(), anyString(), anyString());
        verify(iniciador, never()).disparar(any());
    }

    @Test
    void naoDeveAceitarRepositorioDeOutraConta() {
        when(github.buscarRepositorio(usuarioId, "spring-projects", "spring-boot"))
                .thenReturn(repositorio("spring-projects/spring-boot", false));

        assertThatThrownBy(() -> service.iniciar(usuarioId, "artur", "spring-projects", "spring-boot"))
                .isInstanceOf(RepositorioNaoAnalisavelException.class);
        verify(iniciador, never()).disparar(any());
    }

    @Test
    void deveUsarODonoDevolvidoPeloGithubEIgnorarOQueVeioNaRequisicao() {
        when(github.buscarRepositorio(usuarioId, "ARTUR", "KODA")).thenReturn(repositorio("artur/koda", false));
        when(registro.registrarNovaAnalise(usuarioId, 42L, "artur", "koda", "main")).thenReturn(analiseId);

        service.iniciar(usuarioId, "artur", "ARTUR", "KODA");

        verify(registro).registrarNovaAnalise(usuarioId, 42L, "artur", "koda", "main");
    }

    @Test
    void deveMarcarAAnaliseComoFalhadaQuandoAFilaEstiverCheia() {
        when(github.buscarRepositorio(usuarioId, "artur", "koda")).thenReturn(repositorio("artur/koda", false));
        when(registro.registrarNovaAnalise(any(), anyLong(), anyString(), anyString(), anyString()))
                .thenReturn(analiseId);
        doThrow(new FilaDeAnaliseCheiaException()).when(iniciador).disparar(analiseId);

        assertThatThrownBy(() -> service.iniciar(usuarioId, "artur", "artur", "koda"))
                .isInstanceOf(FilaDeAnaliseCheiaException.class);

        verify(registro).falhar(analiseId, new FilaDeAnaliseCheiaException().getMessage());
    }

    @Test
    void deveTraduzirConflitoDoBancoParaAnaliseEmAndamento() {
        when(github.buscarRepositorio(usuarioId, "artur", "koda")).thenReturn(repositorio("artur/koda", false));
        when(registro.registrarNovaAnalise(any(), anyLong(), anyString(), anyString(), anyString()))
                .thenThrow(new DataIntegrityViolationException("duplicado"));

        assertThatThrownBy(() -> service.iniciar(usuarioId, "artur", "artur", "koda"))
                .isInstanceOf(AnaliseEmAndamentoException.class);
        verify(iniciador, never()).disparar(any());
    }

    @Test
    void deveConsultarComOResultadoJaInterpretado() {
        ResultadoAnalise resultado = new ResultadoAnalise(
                true, true, "21", "4.1.1", List.of(), List.of(), List.of(),
                List.of(), List.of(), List.of(), List.of(), List.of(),
                List.of(new Endpoint("GET", "/a", "AController")), false);
        String json = new SerializadorResultado().paraJson(resultado);
        Instant agora = Instant.now();
        when(consulta.buscarDoUsuario(usuarioId, analiseId)).thenReturn(new AnaliseDetalhe(
                analiseId, StatusAnalise.CONCLUIDA, "artur", "koda", json, null, null, agora, agora));

        AnaliseDetalheResposta resposta = service.consultar(usuarioId, analiseId);

        assertThat(resposta.status()).isEqualTo(StatusAnalise.CONCLUIDA);
        assertThat(resposta.resultado()).isEqualTo(resultado);
        assertThat(resposta.dono()).isEqualTo("artur");
    }

    @Test
    void deveConsultarComOContextoInterpretadoEDeixarNuloNasAnalisesAntigas() {
        ContextoProjeto contexto = new ContextoProjeto(
                ContextoProjeto.VERSAO_ESQUEMA, "21", "4.1.1", "maven", Arquitetura.POR_FEATURE,
                List.of("Pedido"), List.of(), List.of("pedidos"), List.of(),
                new ComponentesContexto(List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), false),
                new TestesContexto(0, List.of(), List.of()),
                new InfraContexto(false, false), false, false, 0);
        String resultadoJson = new SerializadorResultado().paraJson(new ResultadoAnalise(
                true, true, "21", null, List.of(), List.of(), List.of(),
                List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), false));
        Instant agora = Instant.now();
        UUID antiga = UUID.randomUUID();
        when(consulta.buscarDoUsuario(usuarioId, analiseId)).thenReturn(new AnaliseDetalhe(
                analiseId, StatusAnalise.CONCLUIDA, "artur", "koda", resultadoJson,
                new SerializadorContexto().paraJson(contexto), null, agora, agora));
        when(consulta.buscarDoUsuario(usuarioId, antiga)).thenReturn(new AnaliseDetalhe(
                antiga, StatusAnalise.CONCLUIDA, "artur", "velho", resultadoJson, null, null, agora, agora));

        assertThat(service.consultar(usuarioId, analiseId).contexto()).isEqualTo(contexto);
        assertThat(service.consultar(usuarioId, antiga).contexto()).isNull();
    }

    @Test
    void deveConsultarAnaliseSemResultadoAinda() {
        Instant agora = Instant.now();
        when(consulta.buscarDoUsuario(usuarioId, analiseId)).thenReturn(new AnaliseDetalhe(
                analiseId, StatusAnalise.PENDENTE, "artur", "koda", null, null, null, agora, null));

        AnaliseDetalheResposta resposta = service.consultar(usuarioId, analiseId);

        assertThat(resposta.resultado()).isNull();
        assertThat(resposta.concluidaEm()).isNull();
    }

    @Test
    void deveListarResumosComOsDadosDoResultadoQuandoHouver() {
        ResultadoAnalise resultado = new ResultadoAnalise(
                true, true, "21", "4.1.1", List.of(), List.of(Tecnologia.POSTGRESQL), List.of(),
                List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), true);
        Instant agora = Instant.now();
        when(consulta.listarUltimasDoUsuario(usuarioId)).thenReturn(List.of(
                new AnaliseDetalhe(analiseId, StatusAnalise.CONCLUIDA, "artur", "koda",
                        new SerializadorResultado().paraJson(resultado), null, null, agora, agora),
                new AnaliseDetalhe(UUID.randomUUID(), StatusAnalise.FALHOU, "artur", "outro",
                        null, null, "O repositório não é um projeto Spring Boot.", agora, agora)));

        List<AnaliseResumoResposta> resumos = service.listar(usuarioId);

        assertThat(resumos).hasSize(2);
        assertThat(resumos.get(0).framework()).isEqualTo("Spring Boot");
        assertThat(resumos.get(0).versaoLinguagem()).isEqualTo("21");
        assertThat(resumos.get(0).tecnologias()).containsExactly(Tecnologia.POSTGRESQL);
        assertThat(resumos.get(0).parcial()).isTrue();
        assertThat(resumos.get(1).framework()).isNull();
        assertThat(resumos.get(1).versaoLinguagem()).isNull();
        assertThat(resumos.get(1).tecnologias()).isEmpty();
        assertThat(resumos.get(1).mensagemErro()).isEqualTo("O repositório não é um projeto Spring Boot.");
    }

    @Test
    void deveRepassarNaoEncontradaQuandoAAnaliseNaoForDoUsuario() {
        when(consulta.buscarDoUsuario(usuarioId, analiseId)).thenThrow(new AnaliseNaoEncontradaException(analiseId));

        assertThatThrownBy(() -> service.consultar(usuarioId, analiseId))
                .isInstanceOf(AnaliseNaoEncontradaException.class);
    }

    private RepositorioResposta repositorio(String nomeCompleto, boolean privado) {
        String nome = nomeCompleto.substring(nomeCompleto.indexOf('/') + 1);
        return new RepositorioResposta(
                42L, nome, nomeCompleto, null, "Java", "https://github.com/" + nomeCompleto,
                "main", "2026-09-20T10:00:00Z", privado);
    }
}
