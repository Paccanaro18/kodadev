package com.koda.v1.challenge.geracao;

import com.koda.v1.analyzer.contexto.Arquitetura;
import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.InfraContexto;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.analyzer.contexto.TestesContexto;
import com.koda.v1.analyzer.persistence.AnaliseDetalhe;
import com.koda.v1.analyzer.persistence.AnaliseNaoEncontradaException;
import com.koda.v1.analyzer.persistence.ConsultaAnalise;
import com.koda.v1.analyzer.persistence.StatusAnalise;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CarregadorContextoTest {

    private final UUID usuarioId = UUID.randomUUID();
    private final UUID analiseId = UUID.randomUUID();
    private final SerializadorContexto serializador = new SerializadorContexto();

    private ConsultaAnalise consultaAnalise;
    private CarregadorContexto carregador;

    @BeforeEach
    void preparar() {
        consultaAnalise = mock(ConsultaAnalise.class);
        carregador = new CarregadorContexto(consultaAnalise, serializador);
    }

    private ContextoProjeto contexto() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS, List.of("Pedido"), List.of(), List.of(), List.of(),
                new ComponentesContexto(List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), false),
                new TestesContexto(0, List.of(), List.of()), new InfraContexto(false, false), false, false, 0);
    }

    private AnaliseDetalhe detalhe(StatusAnalise status, String contextoJson) {
        Instant agora = Instant.now();
        return new AnaliseDetalhe(analiseId, status, "artur", "koda", "{}", contextoJson, null, agora, agora);
    }

    @Test
    void deveCarregarOContextoDeUmaAnaliseConcluida() {
        when(consultaAnalise.buscarDoUsuario(usuarioId, analiseId))
                .thenReturn(detalhe(StatusAnalise.CONCLUIDA, serializador.paraJson(contexto())));

        assertThat(carregador.carregar(usuarioId, analiseId)).isEqualTo(contexto());
    }

    @Test
    void deveRecusarAnaliseSemContextoOuQueNaoTerminou() {
        when(consultaAnalise.buscarDoUsuario(usuarioId, analiseId)).thenReturn(detalhe(StatusAnalise.CONCLUIDA, null));
        assertThatThrownBy(() -> carregador.carregar(usuarioId, analiseId))
                .isInstanceOf(ContextoIndisponivelException.class);

        for (StatusAnalise status : List.of(StatusAnalise.PENDENTE, StatusAnalise.EM_ANDAMENTO, StatusAnalise.FALHOU)) {
            when(consultaAnalise.buscarDoUsuario(usuarioId, analiseId))
                    .thenReturn(detalhe(status, serializador.paraJson(contexto())));
            assertThatThrownBy(() -> carregador.carregar(usuarioId, analiseId))
                    .as(status.name()).isInstanceOf(ContextoIndisponivelException.class);
        }
    }

    @Test
    void deveTratarAnaliseDeOutroUsuarioOuInexistenteComoSemContexto() {
        when(consultaAnalise.buscarDoUsuario(usuarioId, analiseId)).thenThrow(new AnaliseNaoEncontradaException(analiseId));

        assertThatThrownBy(() -> carregador.carregar(usuarioId, analiseId))
                .isInstanceOf(ContextoIndisponivelException.class)
                .hasMessageContaining("ainda não tem contexto");
    }
}
