package com.koda.v1.analyzer.detector;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTimeoutPreemptively;

class RemovedorComentariosTest {

    @Test
    void deveRemoverComentarioDeLinhaMantendoAQuebra() {
        String resultado = RemovedorComentarios.remover("a\n// b\nc");

        assertThat(resultado).isEqualTo("a\n\nc");
    }

    @Test
    void deveRemoverComentarioDeBlocoEComentarioNoFimDaLinha() {
        String resultado = RemovedorComentarios.remover("a /* x\ny */ b // z\nc");

        assertThat(resultado).isEqualTo("a  b \nc");
    }

    @Test
    void naoDeveRemoverBarrasDentroDeTexto() {
        String codigo = "@GetMapping(\"http://exemplo/*\") // fim";

        assertThat(RemovedorComentarios.remover(codigo)).isEqualTo("@GetMapping(\"http://exemplo/*\") ");
    }

    @Test
    void deveDescartarORestoQuandoOBlocoNaoFechar() {
        assertThat(RemovedorComentarios.remover("a /* aberto\nb")).isEqualTo("a ");
    }

    @Test
    void deveAguentarTextoNaoFechadoEBarraNoFimDoArquivo() {
        assertThat(RemovedorComentarios.remover("\"aberto\\")).isEqualTo("\"aberto\\");
        assertThat(RemovedorComentarios.remover("a/")).isEqualTo("a/");
    }

    @Test
    void deveTerminarRapidoComEntradaHostilNoTamanhoMaximo() {
        String quebras = "\n".repeat(LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO);
        String blocosAbertos = "/*\n".repeat(LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO / 3);
        String aspas = "\"\\".repeat(LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO / 2);

        assertTimeoutPreemptively(Duration.ofSeconds(2), () -> {
            RemovedorComentarios.remover(quebras);
            RemovedorComentarios.remover(blocosAbertos);
            RemovedorComentarios.remover(aspas);
        });
    }
}
