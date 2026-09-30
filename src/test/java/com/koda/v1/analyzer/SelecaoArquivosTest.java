package com.koda.v1.analyzer;

import com.koda.v1.analyzer.detector.LimitesAnalise;
import com.koda.v1.analyzer.estrutura.AnalisadorEstrutura;
import com.koda.v1.github.dto.ItemArvoreResposta;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SelecaoArquivosTest {

    private final SelecaoArquivos selecao = new SelecaoArquivos(new AnalisadorEstrutura());

    @Test
    void deveSelecionarPomComposeControllersEEntidadesComSeusShas() {
        List<ItemArvoreResposta> itens = List.of(
                arquivo("pom.xml"),
                arquivo("docker-compose.yml"),
                arquivo("src/main/java/com/loja/PedidoController.java"),
                arquivo("src/main/java/com/loja/model/Pedido.java"),
                arquivo("src/main/java/com/loja/PedidoService.java"));

        ArquivosSelecionados resultado = selecao.selecionar(itens);

        assertThat(resultado.pom()).isEqualTo(new ArquivoParaAbrir("pom.xml", "sha-pom.xml"));
        assertThat(resultado.compose().caminho()).isEqualTo("docker-compose.yml");
        assertThat(resultado.controllers())
                .containsExactly(new ArquivoParaAbrir(
                        "src/main/java/com/loja/PedidoController.java",
                        "sha-src/main/java/com/loja/PedidoController.java"));
        assertThat(resultado.candidatasEntidade())
                .extracting(ArquivoParaAbrir::caminho)
                .containsExactly("src/main/java/com/loja/model/Pedido.java");
        assertThat(resultado.estrutura().temCodigoJava()).isTrue();
        assertThat(resultado.estrutura().services()).hasSize(1);
        assertThat(resultado.limitesAplicados()).isFalse();
    }

    @Test
    void deveLimitarControllersECandidatasEmOrdemAlfabetica() {
        List<ItemArvoreResposta> itens = new ArrayList<>();
        for (int i = 50; i >= 1; i--) {
            itens.add(arquivo(String.format("src/main/java/a/C%02dController.java", i)));
            itens.add(arquivo(String.format("src/main/java/a/model/E%02d.java", i)));
        }

        ArquivosSelecionados resultado = selecao.selecionar(itens);

        assertThat(resultado.controllers()).hasSize(SelecaoArquivos.MAXIMO_CONTROLLERS);
        assertThat(resultado.controllers().get(0).caminho()).isEqualTo("src/main/java/a/C01Controller.java");
        assertThat(resultado.controllers().get(29).caminho()).isEqualTo("src/main/java/a/C30Controller.java");
        assertThat(resultado.candidatasEntidade()).hasSize(SelecaoArquivos.MAXIMO_CANDIDATAS_ENTIDADE);
        assertThat(resultado.candidatasEntidade().get(0).caminho()).isEqualTo("src/main/java/a/model/E01.java");
        assertThat(resultado.estrutura().controllers()).hasSize(50);
        assertThat(resultado.limitesAplicados()).isTrue();
    }

    @Test
    void deveIgnorarPomForaDaRaiz() {
        ArquivosSelecionados resultado = selecao.selecionar(List.of(
                arquivo("modulo/pom.xml"),
                arquivo("modulo/docker-compose.yml")));

        assertThat(resultado.pom()).isNull();
        assertThat(resultado.compose()).isNull();
        assertThat(resultado.limitesAplicados()).isFalse();
    }

    @Test
    void deveIgnorarPastasEItensSemShaOuCaminho() {
        ArquivosSelecionados resultado = selecao.selecionar(List.of(
                new ItemArvoreResposta("pom.xml", "tree", "sha", null),
                new ItemArvoreResposta("docker-compose.yml", "blob", null, 100L),
                new ItemArvoreResposta(null, "blob", "sha", 100L),
                new ItemArvoreResposta("src/main/java/a/AController.java", "commit", "sha", 100L)));

        assertThat(resultado.pom()).isNull();
        assertThat(resultado.compose()).isNull();
        assertThat(resultado.controllers()).isEmpty();
        assertThat(resultado.estrutura().temCodigoJava()).isFalse();
    }

    @Test
    void deveDescartarArquivoSemTamanhoOuMaiorQueOLimiteEAvisar() {
        long acimaDoLimite = LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO + 1L;

        ArquivosSelecionados resultado = selecao.selecionar(List.of(
                new ItemArvoreResposta("pom.xml", "blob", "sha-pom", acimaDoLimite),
                new ItemArvoreResposta("src/main/java/a/AController.java", "blob", "sha-a", null),
                new ItemArvoreResposta("src/main/java/a/BController.java", "blob", "sha-b", 0L),
                new ItemArvoreResposta("src/main/java/a/CController.java", "blob", "sha-c",
                        (long) LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO)));

        assertThat(resultado.pom()).isNull();
        assertThat(resultado.controllers())
                .extracting(ArquivoParaAbrir::caminho)
                .containsExactly("src/main/java/a/CController.java");
        assertThat(resultado.limitesAplicados()).isTrue();
    }

    @Test
    void devePreferirDockerComposeYmlEUsarAlternativaSeEleForGrande() {
        ArquivosSelecionados comAmbos = selecao.selecionar(List.of(
                arquivo("compose.yaml"),
                arquivo("docker-compose.yml")));
        ArquivosSelecionados soGrande = selecao.selecionar(List.of(
                new ItemArvoreResposta("docker-compose.yml", "blob", "sha-grande",
                        LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO + 1L),
                arquivo("compose.yaml")));

        assertThat(comAmbos.compose().caminho()).isEqualTo("docker-compose.yml");
        assertThat(soGrande.compose().caminho()).isEqualTo("compose.yaml");
        assertThat(soGrande.limitesAplicados()).isTrue();
    }

    @Test
    void deveDizerQueNaoHaCodigoJavaEmRepositorioSemJava() {
        ArquivosSelecionados resultado = selecao.selecionar(List.of(
                arquivo("README.md"),
                arquivo("package.json"),
                arquivo("src/index.js")));

        assertThat(resultado.estrutura().temCodigoJava()).isFalse();
        assertThat(resultado.controllers()).isEmpty();
        assertThat(resultado.candidatasEntidade()).isEmpty();
    }

    @Test
    void deveAceitarArvoreVazia() {
        ArquivosSelecionados resultado = selecao.selecionar(List.of());

        assertThat(resultado.pom()).isNull();
        assertThat(resultado.compose()).isNull();
        assertThat(resultado.estrutura().temCodigoJava()).isFalse();
        assertThat(resultado.limitesAplicados()).isFalse();
    }

    private ItemArvoreResposta arquivo(String caminho) {
        return new ItemArvoreResposta(caminho, "blob", "sha-" + caminho, 1000L);
    }
}
