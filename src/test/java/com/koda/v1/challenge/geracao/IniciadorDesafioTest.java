package com.koda.v1.challenge.geracao;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;

class IniciadorDesafioTest {

    private FilaDesafios fila;
    private GeradorDesafio gerador;
    private IniciadorDesafio iniciador;

    @BeforeEach
    void preparar() {
        fila = new FilaDesafios(1, 5);
        gerador = mock(GeradorDesafio.class);
        iniciador = new IniciadorDesafio(fila, gerador);
    }

    @AfterEach
    void encerrar() {
        fila.encerrar();
    }

    @Test
    void deveDispararAGeracaoEmSegundoPlano() {
        UUID desafioId = UUID.randomUUID();

        iniciador.disparar(desafioId);

        verify(gerador, timeout(5000)).gerar(desafioId);
    }

    @Test
    void deveContinuarFuncionandoDepoisDeUmaFalhaInesperada() throws InterruptedException {
        UUID quebra = UUID.randomUUID();
        UUID normal = UUID.randomUUID();
        CountDownLatch segundaRodou = new CountDownLatch(1);
        doThrow(new IllegalStateException("erro")).when(gerador).gerar(quebra);
        doAnswer(chamada -> {
            segundaRodou.countDown();
            return null;
        }).when(gerador).gerar(normal);

        iniciador.disparar(quebra);
        iniciador.disparar(normal);

        assertThat(segundaRodou.await(5, TimeUnit.SECONDS)).isTrue();
    }

    @Test
    void deveDevolverErroDeFilaCheiaParaQuemChamou() {
        FilaDesafios cheia = new FilaDesafios(1, 1);
        IniciadorDesafio comFilaCheia = new IniciadorDesafio(cheia, gerador);
        CountDownLatch liberar = new CountDownLatch(1);
        doAnswer(chamada -> {
            liberar.await();
            return null;
        }).when(gerador).gerar(any());

        try {
            comFilaCheia.disparar(UUID.randomUUID());
            verify(gerador, timeout(5000)).gerar(any());
            comFilaCheia.disparar(UUID.randomUUID());

            assertThatThrownBy(() -> comFilaCheia.disparar(UUID.randomUUID()))
                    .isInstanceOf(FilaDeDesafiosCheiaException.class);
        } finally {
            liberar.countDown();
            cheia.encerrar();
        }
    }
}
