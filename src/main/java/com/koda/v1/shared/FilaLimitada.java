package com.koda.v1.shared;

import jakarta.annotation.PreDestroy;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * Fila de trabalhos em segundo plano com tamanho máximo: um número fixo de threads e uma fila limitada. Quando a fila
 * enche, o trabalho novo é recusado na hora com a exceção que cada uso escolhe, em vez de acumular sem limite. As
 * threads são daemon e a fila encerra junto com a aplicação.
 */
public class FilaLimitada {

    private final ThreadPoolExecutor executor;
    private final Supplier<? extends RuntimeException> quandoCheia;

    public FilaLimitada(int threads, int capacidadeFila, String nomeDaThread,
                        Supplier<? extends RuntimeException> quandoCheia) {
        this.quandoCheia = quandoCheia;
        this.executor = new ThreadPoolExecutor(
                threads, threads, 0L, TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(capacidadeFila),
                tarefa -> {
                    Thread thread = new Thread(tarefa, nomeDaThread);
                    thread.setDaemon(true);
                    return thread;
                },
                new ThreadPoolExecutor.AbortPolicy());
    }

    public void enfileirar(Runnable tarefa) {
        try {
            executor.execute(tarefa);
        } catch (RejectedExecutionException e) {
            throw quandoCheia.get();
        }
    }

    @PreDestroy
    public void encerrar() {
        executor.shutdownNow();
    }
}
