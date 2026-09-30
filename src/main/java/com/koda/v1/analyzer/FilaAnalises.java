package com.koda.v1.analyzer;

import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

@Component
public class FilaAnalises {

    private final ThreadPoolExecutor executor;

    public FilaAnalises(@Value("${koda.analise.threads:2}") int threads,
                        @Value("${koda.analise.capacidade-fila:10}") int capacidadeFila) {
        this.executor = new ThreadPoolExecutor(
                threads, threads, 0L, TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(capacidadeFila),
                tarefa -> {
                    Thread thread = new Thread(tarefa, "analise-repositorio");
                    thread.setDaemon(true);
                    return thread;
                },
                new ThreadPoolExecutor.AbortPolicy());
    }

    public void enfileirar(Runnable tarefa) {
        try {
            executor.execute(tarefa);
        } catch (RejectedExecutionException e) {
            throw new FilaDeAnaliseCheiaException();
        }
    }

    @PreDestroy
    void encerrar() {
        executor.shutdownNow();
    }
}
