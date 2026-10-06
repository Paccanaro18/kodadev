package com.koda.v1.seguranca;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CatalogoDeSegurancaTest {

    private static final String PADRAO_REAL = "classpath:seguranca/desafios/*.json";

    private static final String DESAFIO_VALIDO = """
            {"slug":"%s","titulo":"T","categoria":"WEB","dificuldade":"FACIL","resumo":"R","enunciado":["E"],
             "formatoDaFlag":"KODA{x}","artefatos":[{"nome":"a","linguagem":"text","conteudo":"c"}],
             "dicas":["D"],"solucao":["S"],"flagHash":"%s"}""";

    private static final String HASH = "a".repeat(64);

    @TempDir
    Path pasta;

    @Test
    void deveCarregarOsDozeDesafiosReaisEmOrdem() {
        CatalogoDeSeguranca catalogo = new CatalogoDeSeguranca(PADRAO_REAL);

        assertThat(catalogo.todos()).hasSize(12);
        assertThat(catalogo.todos().get(0).slug()).isEqualTo("logs-quem-bateu-a-porta");
        assertThat(catalogo.todos().get(11).slug()).isEqualTo("web-cors-generoso");
    }

    @Test
    void deveTerSlugsUnicosEmQuatroCategoriasComTresDesafiosCada() {
        List<DefinicaoDeDesafio> desafios = new CatalogoDeSeguranca(PADRAO_REAL).todos();

        assertThat(desafios.stream().map(DefinicaoDeDesafio::slug).collect(Collectors.toSet())).hasSize(12);
        Map<Categoria, Long> porCategoria = desafios.stream()
                .collect(Collectors.groupingBy(DefinicaoDeDesafio::categoria, Collectors.counting()));
        assertThat(porCategoria).containsOnlyKeys(Categoria.values());
        assertThat(porCategoria.values()).containsOnly(3L);
    }

    @Test
    void deveMisturarDificuldadesEPontuarPeloNivel() {
        List<DefinicaoDeDesafio> desafios = new CatalogoDeSeguranca(PADRAO_REAL).todos();

        Set<Dificuldade> niveis = desafios.stream().map(DefinicaoDeDesafio::dificuldade).collect(Collectors.toSet());
        assertThat(niveis).containsExactlyInAnyOrder(Dificuldade.values());
        assertThat(Arrays.stream(Dificuldade.values()).map(Dificuldade::pontos)).containsExactly(100, 200, 300);
        assertThat(desafios).allSatisfy(desafio -> assertThat(desafio.pontos()).isEqualTo(desafio.dificuldade().pontos()));
    }

    @Test
    void deveTerConteudoCompletoEmTodosOsDesafios() {
        assertThat(new CatalogoDeSeguranca(PADRAO_REAL).todos()).allSatisfy(desafio -> {
            assertThat(desafio.enunciado()).isNotEmpty();
            assertThat(desafio.artefatos()).isNotEmpty();
            assertThat(desafio.dicas()).hasSizeGreaterThanOrEqualTo(2);
            assertThat(desafio.solucao()).hasSizeGreaterThanOrEqualTo(2);
            assertThat(desafio.formatoDaFlag()).startsWith("KODA{");
            assertThat(desafio.flagHash()).matches("[0-9a-f]{64}");
        });
    }

    @Test
    void naoDeveGuardarNenhumaFlagEmTextoNosArquivos() throws IOException {
        try (var arquivos = Files.list(Path.of("src/main/resources/seguranca/desafios"))) {
            for (Path arquivo : arquivos.toList()) {
                String conteudo = Files.readString(arquivo);
                String soSolucao = conteudo.substring(conteudo.indexOf("\"solucao\""));
                assertThat(soSolucao).as(arquivo.getFileName().toString()).doesNotContain("KODA{");
            }
        }
    }

    @Test
    void deveBuscarPorSlug() {
        CatalogoDeSeguranca catalogo = new CatalogoDeSeguranca(PADRAO_REAL);

        assertThat(catalogo.buscar("cripto-camadas")).map(DefinicaoDeDesafio::titulo).contains("Camadas de cebola");
        assertThat(catalogo.buscar("nao-existe")).isEmpty();
    }

    @Test
    void deveAceitarUmaPastaSemDesafios() {
        CatalogoDeSeguranca catalogo = new CatalogoDeSeguranca("file:" + pasta.toAbsolutePath().toString().replace('\\', '/') + "/*.json");

        assertThat(catalogo.todos()).isEmpty();
    }

    @Test
    void deveRecusarSlugRepetido() throws IOException {
        Files.writeString(pasta.resolve("1.json"), DESAFIO_VALIDO.formatted("igual", HASH));
        Files.writeString(pasta.resolve("2.json"), DESAFIO_VALIDO.formatted("igual", HASH));

        assertThatThrownBy(() -> new CatalogoDeSeguranca(padraoDa(pasta)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("igual");
    }

    @Test
    void deveRecusarArquivoInvalidoDizendoQualEle() throws IOException {
        Files.writeString(pasta.resolve("quebrado.json"), "{ isto nao e json");

        assertThatThrownBy(() -> new CatalogoDeSeguranca(padraoDa(pasta)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("quebrado.json");
    }

    @Test
    void deveRecusarDesafioComHashInvalido() throws IOException {
        Files.writeString(pasta.resolve("hash.json"), DESAFIO_VALIDO.formatted("hash-ruim", "curto"));

        assertThatThrownBy(() -> new CatalogoDeSeguranca(padraoDa(pasta)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("hash.json");
    }

    @Test
    void deveLerUmDesafioValido() throws IOException {
        Files.writeString(pasta.resolve("ok.json"), DESAFIO_VALIDO.formatted("valido", HASH));

        assertThat(new CatalogoDeSeguranca(padraoDa(pasta)).todos()).extracting(DefinicaoDeDesafio::slug).containsExactly("valido");
    }

    private String padraoDa(Path diretorio) {
        return "file:" + diretorio.toAbsolutePath().toString().replace('\\', '/') + "/*.json";
    }
}
