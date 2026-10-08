package com.koda.v1.plano;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PlanoServiceTest {

    private static final Instant AGORA = Instant.parse("2026-10-08T15:00:00Z");
    private static final CicloMensal CICLO = CicloMensal.contendo(AGORA);

    private final UUID usuarioId = UUID.randomUUID();

    private AssinaturaRepository repository;
    private PlanoService service;

    @BeforeEach
    void preparar() {
        repository = mock(AssinaturaRepository.class);
        service = new PlanoService(repository, Clock.fixed(AGORA, ZoneOffset.UTC));
    }

    @Test
    void semAssinaturaDeveSerGratis() {
        when(repository.findById(usuarioId)).thenReturn(Optional.empty());

        assertThat(service.planoDe(usuarioId)).isEqualTo(Plano.GRATIS);
    }

    @Test
    void comAssinaturaVigenteDeveUsarOPlanoDela() {
        when(repository.findById(usuarioId)).thenReturn(Optional.of(
                new Assinatura(usuarioId, Plano.PRO, AGORA.minusSeconds(60), null)));

        assertThat(service.planoDe(usuarioId)).isEqualTo(Plano.PRO);
    }

    @Test
    void comAssinaturaVencidaDeveVoltarParaGratis() {
        when(repository.findById(usuarioId)).thenReturn(Optional.of(
                new Assinatura(usuarioId, Plano.PRO, AGORA.minusSeconds(3600), AGORA.minusSeconds(1))));

        assertThat(service.planoDe(usuarioId)).isEqualTo(Plano.GRATIS);
    }

    @Test
    void comAssinaturaQueAindaNaoComecouDeveSerGratis() {
        when(repository.findById(usuarioId)).thenReturn(Optional.of(
                new Assinatura(usuarioId, Plano.PRO, AGORA.plusSeconds(60), null)));

        assertThat(service.planoDe(usuarioId)).isEqualTo(Plano.GRATIS);
    }

    @Test
    void deveRecusarTicketQuandoAUsoAtingirOLimiteDoPlanoGratis() {
        when(repository.findById(usuarioId)).thenReturn(Optional.empty());

        assertThatCode(() -> service.exigirTicket(usuarioId, 2, CICLO)).doesNotThrowAnyException();
        assertThatThrownBy(() -> service.exigirTicket(usuarioId, 3, CICLO))
                .isInstanceOf(CotaMensalExcedidaException.class)
                .hasMessage("Você usou os 3 tickets do plano Grátis neste mês. A cota renova em 01/11/2026.");
        assertThatThrownBy(() -> service.exigirTicket(usuarioId, 99, CICLO))
                .isInstanceOf(CotaMensalExcedidaException.class);
    }

    @Test
    void devePermitirMaisTicketsNoPlanoPro() {
        when(repository.findById(usuarioId)).thenReturn(Optional.of(
                new Assinatura(usuarioId, Plano.PRO, AGORA.minusSeconds(60), null)));

        assertThatCode(() -> service.exigirTicket(usuarioId, 59, CICLO)).doesNotThrowAnyException();
        assertThatThrownBy(() -> service.exigirTicket(usuarioId, 60, CICLO))
                .isInstanceOf(CotaMensalExcedidaException.class)
                .hasMessageContaining("60 tickets do plano Pro");
    }

    @Test
    void deveRecusarRepositorioNovoQuandoOLimiteDoPlanoEstiverCheio() {
        when(repository.findById(usuarioId)).thenReturn(Optional.empty());

        assertThatCode(() -> service.exigirRepositorio(usuarioId, 0)).doesNotThrowAnyException();
        assertThatThrownBy(() -> service.exigirRepositorio(usuarioId, 1))
                .isInstanceOf(LimiteDeRepositoriosExcedidoException.class)
                .hasMessage("O plano Grátis permite 1 repositório. Arquive um repositório conectado para liberar a vaga ou escolha um plano com mais espaço.");
    }

    @Test
    void deveUsarPluralNaMensagemQuandoOPlanoPermitirVariosRepositorios() {
        when(repository.findById(usuarioId)).thenReturn(Optional.of(
                new Assinatura(usuarioId, Plano.PRO, AGORA.minusSeconds(60), null)));

        assertThatCode(() -> service.exigirRepositorio(usuarioId, 19)).doesNotThrowAnyException();
        assertThatThrownBy(() -> service.exigirRepositorio(usuarioId, 20))
                .isInstanceOf(LimiteDeRepositoriosExcedidoException.class)
                .hasMessageContaining("20 repositórios");
    }
}
