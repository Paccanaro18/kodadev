package com.koda.v1.analyzer;

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

class IniciadorAnaliseTest {

    private FilaAnalises fila;
    private AnalisadorRepositorio analisador;
    private IniciadorAnalise iniciador;

    @BeforeEach
    void preparar() {
        fila = new FilaAnalises(1, 5);
        analisador = mock(AnalisadorRepositorio.class);
        iniciador = new IniciadorAnalise(fila, analisador);
    }

    @AfterEach
    void encerrar() {
        fila.encerrar();
    }

    @Test
    void deveDispararAAnaliseEmSegundoPlano() {
        UUID analiseId = UUID.randomUUID();

        iniciador.disparar(analiseId);

        verify(analisador, timeout(5000)).analisar(analiseId);
    }

    @Test
    void deveContinuarFuncionandoDepoisDeUmaFalhaInesperada() throws InterruptedException {
        UUID quebra = UUID.randomUUID();
        UUID normal = UUID.randomUUID();
        CountDownLatch segundaRodou = new CountDownLatch(1);
        doThrow(new IllegalStateException("erro")).when(analisador).analisar(quebra);
        doAnswer(chamada -> {
            segundaRodou.countDown();
            return null;
        }).when(analisador).analisar(normal);

        iniciador.disparar(quebra);
        iniciador.disparar(normal);

        assertThat(segundaRodou.await(5, TimeUnit.SECONDS)).isTrue();
    }

    @Test
    void deveDevolverErroDeFilaCheiaParaQuemChamou() {
        FilaAnalises cheia = new FilaAnalises(1, 1);
        IniciadorAnalise comFilaCheia = new IniciadorAnalise(cheia, analisador);
        CountDownLatch liberar = new CountDownLatch(1);
        doAnswer(chamada -> {
            liberar.await();
            return null;
        }).when(analisador).analisar(any());

        try {
            comFilaCheia.disparar(UUID.randomUUID());
            verify(analisador, timeout(5000)).analisar(any());
            comFilaCheia.disparar(UUID.randomUUID());

            assertThatThrownBy(() -> comFilaCheia.disparar(UUID.randomUUID()))
                    .isInstanceOf(FilaDeAnaliseCheiaException.class);
        } finally {
            liberar.countDown();
            cheia.encerrar();
        }
    }
}
