package com.koda.v1.challenge.geracao;

import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

@Component
public class FilaDesafios {

    private final ThreadPoolExecutor executor;

    public FilaDesafios(@Value("${koda.desafio.threads:1}") int threads,
                        @Value("${koda.desafio.capacidade-fila:5}") int capacidadeFila) {
        this.executor = new ThreadPoolExecutor(
                threads, threads, 0L, TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(capacidadeFila),
                tarefa -> {
                    Thread thread = new Thread(tarefa, "geracao-de-desafio");
                    thread.setDaemon(true);
                    return thread;
                },
                new ThreadPoolExecutor.AbortPolicy());
    }

    public void enfileirar(Runnable tarefa) {
        try {
            executor.execute(tarefa);
        } catch (RejectedExecutionException e) {
            throw new FilaDeDesafiosCheiaException();
        }
    }

    @PreDestroy
    void encerrar() {
        executor.shutdownNow();
    }
}
