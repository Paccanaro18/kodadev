package com.koda.v1.challenge.dica;

import com.koda.v1.analyzer.contexto.Arquitetura;
import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.EndpointContexto;
import com.koda.v1.analyzer.contexto.InfraContexto;
import com.koda.v1.analyzer.contexto.TestesContexto;
import com.koda.v1.challenge.ConteudoDesafio;
import com.koda.v1.challenge.NivelDesafio;
import com.koda.v1.challenge.SerializadorConteudo;
import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.VerificadorConteudo;
import com.koda.v1.challenge.geracao.CarregadorContexto;
import com.koda.v1.challenge.geracao.ContextoIndisponivelException;
import com.koda.v1.challenge.ia.MotivoFalhaIa;
import com.koda.v1.challenge.ia.ProvedorIa;
import com.koda.v1.challenge.ia.ProvedorIaException;
import com.koda.v1.challenge.ia.RespostaIa;
import com.koda.v1.challenge.persistence.ConsultaDesafio;
import com.koda.v1.challenge.persistence.DesafioDetalhe;
import com.koda.v1.challenge.persistence.DesafioNaoEncontradoException;
import com.koda.v1.challenge.persistence.StatusGeracao;
import com.koda.v1.challenge.persistence.StatusProgresso;
import com.koda.v1.challenge.prompt.PromptDesafio;
import com.koda.v1.challenge.validacao.MotivoReprovacao;
import com.koda.v1.challenge.validacao.ValidadorDesafio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.Clock;
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
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DicaServiceTest {

    private static final Instant AGORA = Instant.parse("2026-09-30T18:00:00Z");
    private static final String DICA_BOA = "Comece relendo o objetivo e descubra onde o comportamento atual difere do esperado.";

    private final UUID usuarioId = UUID.randomUUID();
    private final UUID analiseId = UUID.randomUUID();
    private final UUID desafioId = UUID.randomUUID();
    private final SerializadorConteudo serializador = new SerializadorConteudo();

    private ConsultaDesafio consulta;
    private CarregadorContexto carregador;
    private ProvedorIa provedor;
    private ValidadorDesafio validador;
    private DicaRepository dicas;
    private RegistroDica registro;
    private DicaService service;

    @BeforeEach
    void preparar() {
        consulta = mock(ConsultaDesafio.class);
        carregador = mock(CarregadorContexto.class);
        provedor = mock(ProvedorIa.class);
        validador = mock(ValidadorDesafio.class);
        dicas = mock(DicaRepository.class);
        registro = mock(RegistroDica.class);
        service = new DicaService(consulta, carregador, serializador, new MontadorPromptDica(), provedor,
                new VerificadorConteudo(), validador, dicas, registro, 10, Clock.fixed(AGORA, ZoneOffset.UTC));

        when(consulta.buscarDoUsuario(usuarioId, desafioId)).thenReturn(detalhe(StatusGeracao.PRONTO, StatusProgresso.EM_ANDAMENTO));
        when(carregador.carregar(usuarioId, analiseId)).thenReturn(contexto());
        when(dicas.findByDesafioIdOrderByNivelAsc(desafioId)).thenReturn(List.of());
        when(dicas.countByUsuarioIdAndCriadoEmAfter(any(), any())).thenReturn(0L);
        when(validador.validarDica(anyString(), any())).thenReturn(List.of());
        when(registro.registrar(any(), any(), anyInt(), anyString(), any())).thenAnswer(invocacao -> {
            Dica dica = new Dica(usuarioId, desafioId, invocacao.getArgument(2), invocacao.getArgument(3), invocacao.getArgument(4));
            return dica;
        });
    }

    @Test
    void deveGerarAPrimeiraDicaEGravarComONivelEOModelo() {
        when(provedor.gerar(any())).thenReturn(resposta(DICA_BOA, "modelo-x"));

        DicaResposta dica = service.pedir(usuarioId, desafioId);

        assertThat(dica.nivel()).isEqualTo(1);
        assertThat(dica.texto()).isEqualTo(DICA_BOA);
        verify(registro).registrar(usuarioId, desafioId, 1, DICA_BOA, "modelo-x");
        verify(provedor, times(1)).gerar(any());
    }

    @Test
    void deveGerarOProximoNivelEPassarAsDicasAnterioresNoPrompt() {
        when(dicas.findByDesafioIdOrderByNivelAsc(desafioId)).thenReturn(List.of(
                new Dica(usuarioId, desafioId, 1, "Primeira dica já dada.", "m")));
        when(provedor.gerar(any())).thenReturn(resposta(DICA_BOA, "m"));

        DicaResposta dica = service.pedir(usuarioId, desafioId);

        ArgumentCaptor<PromptDesafio> prompt = ArgumentCaptor.forClass(PromptDesafio.class);
        verify(provedor).gerar(prompt.capture());
        assertThat(dica.nivel()).isEqualTo(2);
        assertThat(prompt.getValue().usuario()).contains("Nível 2").contains("Primeira dica já dada.");
    }

    @Test
    void deveTentarDeNovoQuandoAPrimeiraRespostaVemForaDoFormato() {
        when(provedor.gerar(any())).thenReturn(resposta("isso não é json", "m"), resposta(DICA_BOA, "m"));

        service.pedir(usuarioId, desafioId);

        verify(provedor, times(2)).gerar(any());
        verify(registro).registrar(usuarioId, desafioId, 1, DICA_BOA, "m");
    }

    @Test
    void deveTentarDeNovoComAsCorrecoesQuandoOValidadorReprovaAPrimeiraDica() {
        when(validador.validarDica(anyString(), any()))
                .thenReturn(List.of(MotivoReprovacao.SOLUCAO_ENTREGUE))
                .thenReturn(List.of());
        when(provedor.gerar(any())).thenReturn(resposta("Chame o método x() para resolver.", "m"), resposta(DICA_BOA, "m"));

        service.pedir(usuarioId, desafioId);

        ArgumentCaptor<PromptDesafio> prompts = ArgumentCaptor.forClass(PromptDesafio.class);
        verify(provedor, times(2)).gerar(prompts.capture());
        assertThat(prompts.getAllValues().get(0).usuario()).doesNotContain("foi recusada");
        assertThat(prompts.getAllValues().get(1).usuario())
                .contains("foi recusada").contains(MotivoReprovacao.SOLUCAO_ENTREGUE.orientacao());
        verify(registro).registrar(usuarioId, desafioId, 1, DICA_BOA, "m");
    }

    @Test
    void deveFalharSemGravarNemCobrarQuandoAsDuasTentativasSaoReprovadas() {
        when(validador.validarDica(anyString(), any())).thenReturn(List.of(MotivoReprovacao.SOLUCAO_ENTREGUE));
        when(provedor.gerar(any())).thenReturn(resposta("Dica ruim número um.", "m"), resposta("Dica ruim número dois.", "m"));

        assertThatThrownBy(() -> service.pedir(usuarioId, desafioId))
                .isInstanceOf(DicaNaoGeradaException.class)
                .hasMessage(DicaService.MENSAGEM_NAO_GERADA);
        verify(provedor, times(2)).gerar(any());
        verify(registro, never()).registrar(any(), any(), anyInt(), anyString(), any());
    }

    @Test
    void deveTentarDeNovoQuandoOProvedorNaoResponde() {
        when(provedor.gerar(any()))
                .thenThrow(new ProvedorIaException(MotivoFalhaIa.INDISPONIVEL))
                .thenReturn(resposta(DICA_BOA, "m"));

        service.pedir(usuarioId, desafioId);

        verify(provedor, times(2)).gerar(any());
    }

    @Test
    void naoDeveTentarDeNovoQuandoOLimiteOuACredencialDoProvedorFalham() {
        for (MotivoFalhaIa motivo : List.of(MotivoFalhaIa.LIMITE_ATINGIDO, MotivoFalhaIa.NAO_AUTORIZADO)) {
            provedor = mock(ProvedorIa.class);
            when(provedor.gerar(any())).thenThrow(new ProvedorIaException(motivo));
            service = new DicaService(consulta, carregador, serializador, new MontadorPromptDica(), provedor,
                    new VerificadorConteudo(), validador, dicas, registro, 10, Clock.fixed(AGORA, ZoneOffset.UTC));

            assertThatThrownBy(() -> service.pedir(usuarioId, desafioId))
                    .isInstanceOf(DicaNaoGeradaException.class)
                    .hasMessage(motivo.mensagem());
            verify(provedor, times(1)).gerar(any());
        }
        verify(registro, never()).registrar(any(), any(), anyInt(), anyString(), any());
    }

    @Test
    void deveSoDarDicaEnquantoOTicketEstaEmAndamento() {
        for (StatusProgresso progresso : List.of(StatusProgresso.NAO_INICIADO, StatusProgresso.CONCLUIDO)) {
            when(consulta.buscarDoUsuario(usuarioId, desafioId)).thenReturn(detalhe(StatusGeracao.PRONTO, progresso));
            assertThatThrownBy(() -> service.pedir(usuarioId, desafioId)).isInstanceOf(DicaIndisponivelException.class);
        }
        when(consulta.buscarDoUsuario(usuarioId, desafioId)).thenReturn(detalhe(StatusGeracao.PENDENTE, StatusProgresso.NAO_INICIADO));
        assertThatThrownBy(() -> service.pedir(usuarioId, desafioId)).isInstanceOf(DicaIndisponivelException.class);

        verify(provedor, never()).gerar(any());
    }

    @Test
    void deveRecusarMaisQueTresDicasPorDesafioSemChamarAIa() {
        when(dicas.findByDesafioIdOrderByNivelAsc(desafioId)).thenReturn(List.of(
                new Dica(usuarioId, desafioId, 1, "a", "m"), new Dica(usuarioId, desafioId, 2, "b", "m"),
                new Dica(usuarioId, desafioId, 3, "c", "m")));

        assertThatThrownBy(() -> service.pedir(usuarioId, desafioId)).isInstanceOf(LimiteDeDicasDoDesafioException.class);
        verify(provedor, never()).gerar(any());
    }

    @Test
    void deveRecusarQuandoACotaDiariaDeDicasAcabouContandoAsUltimas24Horas() {
        when(dicas.countByUsuarioIdAndCriadoEmAfter(usuarioId, AGORA.minusSeconds(24 * 3600))).thenReturn(10L);

        assertThatThrownBy(() -> service.pedir(usuarioId, desafioId))
                .isInstanceOf(LimiteDiarioDeDicasExcedidoException.class);
        verify(provedor, never()).gerar(any());
    }

    @Test
    void deveDeixarPassarOErroQuandoOTicketNaoEDoUsuario() {
        when(consulta.buscarDoUsuario(usuarioId, desafioId)).thenThrow(new DesafioNaoEncontradoException(desafioId));

        assertThatThrownBy(() -> service.pedir(usuarioId, desafioId)).isInstanceOf(DesafioNaoEncontradoException.class);
        assertThatThrownBy(() -> service.listar(usuarioId, desafioId)).isInstanceOf(DesafioNaoEncontradoException.class);
    }

    @Test
    void deveFalharComMensagemFixaQuandoAAnaliseNaoTemMaisContexto() {
        when(carregador.carregar(usuarioId, analiseId)).thenThrow(new ContextoIndisponivelException());

        assertThatThrownBy(() -> service.pedir(usuarioId, desafioId))
                .isInstanceOf(DicaNaoGeradaException.class).hasMessage(DicaService.MENSAGEM_NAO_GERADA);
        verify(provedor, never()).gerar(any());
    }

    @Test
    void deveRecusarUmSegundoPedidoEnquantoOPrimeiroAindaEstaGerando() {
        when(provedor.gerar(any())).thenAnswer(invocacao -> {
            assertThatThrownBy(() -> service.pedir(usuarioId, desafioId))
                    .isInstanceOf(DicaIndisponivelException.class)
                    .hasMessage(DicaService.MENSAGEM_JA_GERANDO);
            return resposta(DICA_BOA, "m");
        });

        service.pedir(usuarioId, desafioId);
        service.pedir(usuarioId, desafioId);

        verify(provedor, times(2)).gerar(any());
    }

    @Test
    void deveTraduzirConflitoDeGravacaoEmMensagemFixa() {
        when(provedor.gerar(any())).thenReturn(resposta(DICA_BOA, "m"));
        doThrow(new DataIntegrityViolationException("duplicado"))
                .when(registro).registrar(any(), any(), anyInt(), anyString(), any());

        assertThatThrownBy(() -> service.pedir(usuarioId, desafioId))
                .isInstanceOf(DicaIndisponivelException.class).hasMessage(DicaService.MENSAGEM_CONFLITO);
    }

    @Test
    void deveListarAsDicasComOUsoDoDia() {
        when(dicas.findByDesafioIdOrderByNivelAsc(desafioId)).thenReturn(List.of(
                new Dica(usuarioId, desafioId, 1, "a", "m")));
        when(dicas.countByUsuarioIdAndCriadoEmAfter(any(), any())).thenReturn(4L);

        DicasResposta lista = service.listar(usuarioId, desafioId);

        assertThat(lista.dicas()).hasSize(1);
        assertThat(lista.maximoPorDesafio()).isEqualTo(3);
        assertThat(lista.usadasHoje()).isEqualTo(4);
        assertThat(lista.limiteDiario()).isEqualTo(10);
    }

    private RespostaIa resposta(String texto, String modelo) {
        boolean json = texto.contains("json") || texto.startsWith("isso não é");
        String corpo = json ? texto : "{\"dica\":\"" + texto + "\"}";
        return new RespostaIa(corpo, modelo);
    }

    private DesafioDetalhe detalhe(StatusGeracao geracao, StatusProgresso progresso) {
        ConteudoDesafio conteudo = new ConteudoDesafio("Adicionar paginação", "Contexto do módulo.",
                "O PedidoController devolve tudo de uma vez.", "Permitir paginar os pedidos.",
                List.of("Regra 1", "Regra 2"), List.of("Requisito 1", "Requisito 2"),
                List.of("Critério 1", "Critério 2"), List.of("Teste 1"), List.of("Restrição 1"), List.of("Paginação"));
        boolean pronto = geracao == StatusGeracao.PRONTO;
        return new DesafioDetalhe(desafioId, analiseId, 1, TipoDesafio.FEATURE, NivelDesafio.JUNIOR, geracao,
                pronto ? conteudo.titulo() : null, pronto ? serializador.paraJson(conteudo) : null, "m", null, AGORA,
                pronto ? AGORA : null, progresso, null, null);
    }

    private ContextoProjeto contexto() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS, List.of("Pedido"), List.of(), List.of("pedidos"),
                List.of(new EndpointContexto("GET", "/pedidos", "PedidoController")),
                new ComponentesContexto(List.of("PedidoController"), List.of("PedidoService"),
                        List.of("PedidoRepository"), List.of("Pedido"), List.of(), List.of(), false),
                new TestesContexto(0, List.of("PedidoService"), List.of("PedidoController")),
                new InfraContexto(false, false), false, false, 0);
    }
}
