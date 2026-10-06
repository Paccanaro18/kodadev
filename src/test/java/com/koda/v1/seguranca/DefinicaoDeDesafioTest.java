package com.koda.v1.seguranca;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DefinicaoDeDesafioTest {

    private static final String HASH = "b".repeat(64);
    private static final Artefato ARTEFATO = new Artefato("log.txt", "text", "linha");

    private DefinicaoDeDesafio criar(String slug, String titulo, String hash, List<String> enunciado, List<Artefato> artefatos) {
        return new DefinicaoDeDesafio(slug, titulo, Categoria.LOGS, Dificuldade.MEDIO, "resumo", enunciado,
                "KODA{x}", artefatos, List.of("dica"), List.of("solução"), hash);
    }

    @Test
    void deveCriarComDadosValidosEPontuarPelaDificuldade() {
        DefinicaoDeDesafio desafio = criar("logs-um", "Título", HASH, List.of("a"), List.of(ARTEFATO));

        assertThat(desafio.pontos()).isEqualTo(200);
        assertThat(desafio.slug()).isEqualTo("logs-um");
    }

    @Test
    void deveCopiarAsListasParaNaoMudarDepois() {
        List<String> enunciado = new ArrayList<>(List.of("a"));
        DefinicaoDeDesafio desafio = criar("logs-um", "Título", HASH, enunciado, List.of(ARTEFATO));

        enunciado.add("b");

        assertThat(desafio.enunciado()).containsExactly("a");
        assertThatThrownBy(() -> desafio.enunciado().add("c")).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void deveRecusarSlugsInvalidos() {
        for (String slug : new String[]{null, " ", "Maiuscula", "com_underline", "-comeco", "fim-", "a".repeat(81)}) {
            assertThatThrownBy(() -> criar(slug, "T", HASH, List.of("a"), List.of(ARTEFATO)))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test
    void deveRecusarCamposObrigatoriosVazios() {
        assertThatThrownBy(() -> criar("ok", " ", HASH, List.of("a"), List.of(ARTEFATO))).hasMessageContaining("título");
        assertThatThrownBy(() -> criar("ok", "T", HASH, List.of(), List.of(ARTEFATO))).hasMessageContaining("enunciado");
        assertThatThrownBy(() -> criar("ok", "T", HASH, null, List.of(ARTEFATO))).hasMessageContaining("enunciado");
        assertThatThrownBy(() -> criar("ok", "T", HASH, List.of("a"), List.of())).hasMessageContaining("artefatos");
    }

    @Test
    void deveRecusarCategoriaDificuldadeResumoEFormatoAusentes() {
        assertThatThrownBy(() -> new DefinicaoDeDesafio("ok", "T", null, Dificuldade.FACIL, "r", List.of("a"), "f", List.of(ARTEFATO), List.of("d"), List.of("s"), HASH))
                .isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new DefinicaoDeDesafio("ok", "T", Categoria.WEB, null, "r", List.of("a"), "f", List.of(ARTEFATO), List.of("d"), List.of("s"), HASH))
                .isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new DefinicaoDeDesafio("ok", "T", Categoria.WEB, Dificuldade.FACIL, "", List.of("a"), "f", List.of(ARTEFATO), List.of("d"), List.of("s"), HASH))
                .hasMessageContaining("resumo");
        assertThatThrownBy(() -> new DefinicaoDeDesafio("ok", "T", Categoria.WEB, Dificuldade.FACIL, "r", List.of("a"), null, List.of(ARTEFATO), List.of("d"), List.of("s"), HASH))
                .hasMessageContaining("formato");
        assertThatThrownBy(() -> new DefinicaoDeDesafio("ok", "T", Categoria.WEB, Dificuldade.FACIL, "r", List.of("a"), "f", List.of(ARTEFATO), List.of(), List.of("s"), HASH))
                .hasMessageContaining("dicas");
        assertThatThrownBy(() -> new DefinicaoDeDesafio("ok", "T", Categoria.WEB, Dificuldade.FACIL, "r", List.of("a"), "f", List.of(ARTEFATO), List.of("d"), List.of(), HASH))
                .hasMessageContaining("solução");
    }

    @Test
    void deveRecusarHashForaDoFormato() {
        for (String hash : new String[]{null, "", "abc", "A".repeat(64), "g".repeat(64), "a".repeat(63), "a".repeat(65)}) {
            assertThatThrownBy(() -> criar("ok", "T", hash, List.of("a"), List.of(ARTEFATO)))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("SHA-256");
        }
    }

    @Test
    void deveRecusarArtefatoIncompleto() {
        assertThatThrownBy(() -> new Artefato(null, "text", "c")).hasMessageContaining("nome");
        assertThatThrownBy(() -> new Artefato("n", " ", "c")).hasMessageContaining("linguagem");
        assertThatThrownBy(() -> new Artefato("n", "text", "")).hasMessageContaining("conteúdo");
    }
}
