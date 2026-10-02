package com.koda.v1.analyzer.ecossistema;

import com.koda.v1.analyzer.AnaliseRecusadaException;
import com.koda.v1.analyzer.ArquivoParaAbrir;
import com.koda.v1.analyzer.detector.ArquivoNaoAnalisavelException;
import com.koda.v1.github.ArquivoGrandeDemaisException;
import com.koda.v1.github.GithubService;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;

/** Lê arquivos do repositório respeitando o prazo da análise e lembrando se algo ficou de fora. */
public class LeitorDeArquivos {

    private final GithubService github;
    private final UUID usuarioId;
    private final String dono;
    private final String nome;
    private final Instant prazo;
    private boolean parcial;

    public LeitorDeArquivos(GithubService github, UUID usuarioId, String dono, String nome, Instant prazo) {
        this.github = github;
        this.usuarioId = usuarioId;
        this.dono = dono;
        this.nome = nome;
        this.prazo = prazo;
    }

    public String ler(ArquivoParaAbrir arquivo) {
        if (Instant.now().isAfter(prazo)) {
            throw new AnaliseRecusadaException("A análise demorou mais que o permitido.");
        }
        return github.lerArquivo(usuarioId, dono, nome, arquivo.sha()).conteudo();
    }

    public <T> Optional<T> lerEAnalisar(ArquivoParaAbrir arquivo, Function<String, T> detector) {
        try {
            return Optional.of(detector.apply(ler(arquivo)));
        } catch (ArquivoGrandeDemaisException | ArquivoNaoAnalisavelException e) {
            parcial = true;
            return Optional.empty();
        }
    }

    public void marcarParcial() {
        parcial = true;
    }

    public boolean parcial() {
        return parcial;
    }
}
