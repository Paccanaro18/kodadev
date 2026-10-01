package com.koda.v1.shared;

import org.junit.jupiter.api.Test;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FilaLimitadaTest {

    private static class FilaCheia extends RuntimeException {
    }

    @Test
    void deveExecutarOTrabalhoEmOutraThreadDaemonComONomePedido() throws InterruptedException {
        FilaLimitada fila = new FilaLimitada(1, 1, "minha-fila", FilaCheia::new);
        CountDownLatch terminou = new CountDownLatch(1);
        AtomicReference<Thread> rodouEm = new AtomicReference<>();

        fila.enfileirar(() -> {
            rodouEm.set(Thread.currentThread());
            terminou.countDown();
        });

        assertThat(terminou.await(5, TimeUnit.SECONDS)).isTrue();
        assertThat(rodouEm.get()).isNotSameAs(Thread.currentThread());
        assertThat(rodouEm.get().getName()).isEqualTo("minha-fila");
        assertThat(rodouEm.get().isDaemon()).isTrue();
        fila.encerrar();
    }

    @Test
    void deveRecusarNaHoraComAExcecaoEscolhidaQuandoAFilaEstaCheia() throws InterruptedException {
        FilaLimitada fila = new FilaLimitada(1, 1, "fila-cheia", FilaCheia::new);
        CountDownLatch ocupada = new CountDownLatch(1);
        CountDownLatch liberar = new CountDownLatch(1);
        fila.enfileirar(() -> {
            ocupada.countDown();
            try {
                liberar.await();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        assertThat(ocupada.await(5, TimeUnit.SECONDS)).isTrue();
        fila.enfileirar(() -> { });

        assertThatThrownBy(() -> fila.enfileirar(() -> { })).isInstanceOf(FilaCheia.class);

        liberar.countDown();
        fila.encerrar();
    }

    @Test
    void deveDevolverUmaExcecaoNovaACadaRecusa() throws InterruptedException {
        FilaLimitada fila = new FilaLimitada(1, 1, "fila-nova", FilaCheia::new);
        CountDownLatch liberar = new CountDownLatch(1);
        CountDownLatch ocupada = new CountDownLatch(1);
        fila.enfileirar(() -> {
            ocupada.countDown();
            try {
                liberar.await();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        assertThat(ocupada.await(5, TimeUnit.SECONDS)).isTrue();
        fila.enfileirar(() -> { });

        RuntimeException primeira = catchRecusa(fila);
        RuntimeException segunda = catchRecusa(fila);

        assertThat(primeira).isNotSameAs(segunda);
        liberar.countDown();
        fila.encerrar();
    }

    private RuntimeException catchRecusa(FilaLimitada fila) {
        try {
            fila.enfileirar(() -> { });
            throw new AssertionError("a fila deveria estar cheia");
        } catch (FilaCheia e) {
            return e;
        }
    }
}
