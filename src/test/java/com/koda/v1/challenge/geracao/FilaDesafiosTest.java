package com.koda.v1.challenge.geracao;

import org.junit.jupiter.api.Test;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FilaDesafiosTest {

    @Test
    void deveExecutarATarefaEmOutraThread() throws InterruptedException {
        FilaDesafios fila = new FilaDesafios(1, 1);
        CountDownLatch executou = new CountDownLatch(1);
        String[] nomeDaThread = new String[1];

        fila.enfileirar(() -> {
            nomeDaThread[0] = Thread.currentThread().getName();
            executou.countDown();
        });

        assertThat(executou.await(5, TimeUnit.SECONDS)).isTrue();
        assertThat(nomeDaThread[0]).isEqualTo("geracao-de-desafio");
        fila.encerrar();
    }

    @Test
    void deveRecusarQuandoAThreadEAFilaEstiveremCheias() throws InterruptedException {
        FilaDesafios fila = new FilaDesafios(1, 1);
        CountDownLatch comecou = new CountDownLatch(1);
        CountDownLatch liberar = new CountDownLatch(1);
        Runnable bloqueada = () -> {
            comecou.countDown();
            try {
                liberar.await();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        };

        fila.enfileirar(bloqueada);
        assertThat(comecou.await(5, TimeUnit.SECONDS)).isTrue();
        fila.enfileirar(bloqueada);

        assertThatThrownBy(() -> fila.enfileirar(bloqueada)).isInstanceOf(FilaDeDesafiosCheiaException.class);

        liberar.countDown();
        fila.encerrar();
    }
}
