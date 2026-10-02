package com.koda.v1.analyzer.ecossistema;

import com.koda.v1.analyzer.ArquivoParaAbrir;
import com.koda.v1.analyzer.detector.LimitesAnalise;
import com.koda.v1.github.dto.ItemArvoreResposta;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ArvoreDoRepositorioTest {

    private static ItemArvoreResposta arquivo(String caminho, long tamanho) {
        return new ItemArvoreResposta(caminho, "blob", "sha-" + caminho, tamanho);
    }

    @Test
    void deveIgnorarPastasEItensInvalidos() {
        ArvoreDoRepositorio arvore = new ArvoreDoRepositorio(java.util.Arrays.asList(
                arquivo("a.txt", 10),
                new ItemArvoreResposta("pasta", "tree", "s", 0L),
                new ItemArvoreResposta(null, "blob", "s", 1L),
                new ItemArvoreResposta("sem-sha", "blob", null, 1L),
                null));

        assertThat(arvore.caminhos()).containsExactly("a.txt");
        assertThat(arvore.temNaRaiz("a.txt")).isTrue();
        assertThat(arvore.temNaRaiz("b.txt")).isFalse();
    }

    @Test
    void deveEscolherNaRaizOPrimeiroNomeQueCabe() {
        ArvoreDoRepositorio arvore = new ArvoreDoRepositorio(List.of(
                arquivo("compose.yml", 10), arquivo("docker-compose.yml", 10)));

        assertThat(arvore.naRaiz("package.json", "compose.yml"))
                .contains(new ArquivoParaAbrir("compose.yml", "sha-compose.yml"));
        assertThat(arvore.compose()).contains(new ArquivoParaAbrir("docker-compose.yml", "sha-docker-compose.yml"));
        assertThat(arvore.limitou()).isFalse();
    }

    @Test
    void deveMarcarLimiteQuandoOArquivoDaRaizEGrandeDemais() {
        ArvoreDoRepositorio arvore = new ArvoreDoRepositorio(List.of(
                arquivo("package.json", LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO + 1L),
                arquivo("vazio.json", 0)));

        assertThat(arvore.naRaiz("package.json")).isEmpty();
        assertThat(arvore.limitou()).isTrue();
        assertThat(arvore.naRaiz("vazio.json")).isEmpty();
        assertThat(arvore.naRaiz("nao-existe.json")).isEmpty();
    }

    @Test
    void deveEscolherEmOrdemEstavelAteOMaximoEMarcarLimite() {
        List<ItemArvoreResposta> itens = new ArrayList<>();
        for (int i = 5; i >= 1; i--) {
            itens.add(arquivo("src/c" + i + ".ts", 10));
        }
        ArvoreDoRepositorio arvore = new ArvoreDoRepositorio(itens);

        List<ArquivoParaAbrir> escolhidos = arvore.escolher(caminho -> caminho.endsWith(".ts"), 3);

        assertThat(escolhidos).extracting(ArquivoParaAbrir::caminho)
                .containsExactly("src/c1.ts", "src/c2.ts", "src/c3.ts");
        assertThat(arvore.limitou()).isTrue();
    }

    @Test
    void naoDeveMarcarLimiteQuandoTudoCabe() {
        ArvoreDoRepositorio arvore = new ArvoreDoRepositorio(List.of(arquivo("src/a.ts", 10), arquivo("src/b.ts", 10)));

        assertThat(arvore.escolher(caminho -> caminho.endsWith(".ts"), 2)).hasSize(2);
        assertThat(arvore.limitou()).isFalse();
    }

    @Test
    void deveMarcarLimiteQuandoUmCandidatoNaoCabe() {
        ArvoreDoRepositorio arvore = new ArvoreDoRepositorio(List.of(
                arquivo("src/a.ts", 10), arquivo("src/gigante.ts", LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO + 1L)));

        assertThat(arvore.escolher(caminho -> caminho.endsWith(".ts"), 10)).hasSize(1);
        assertThat(arvore.limitou()).isTrue();
    }
}
