package com.koda.v1.analyzer.estrutura;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AnalisadorEstruturaTest {

    private final AnalisadorEstrutura analisador = new AnalisadorEstrutura();

    @Test
    void deveClassificarComponentesPorConvencao() {
        List<String> caminhos = List.of(
                "pom.xml",
                "src/main/java/com/loja/pedido/PedidoController.java",
                "src/main/java/com/loja/pedido/PedidoService.java",
                "src/main/java/com/loja/pedido/PedidoRepository.java",
                "src/main/java/com/loja/pedido/entity/Pedido.java",
                "src/test/java/com/loja/pedido/PedidoServiceTest.java"
        );

        ResultadoEstrutura resultado = analisador.analisar(caminhos);

        assertThat(resultado.temCodigoJava()).isTrue();
        assertThat(resultado.controllers()).containsExactly("src/main/java/com/loja/pedido/PedidoController.java");
        assertThat(resultado.services()).containsExactly("src/main/java/com/loja/pedido/PedidoService.java");
        assertThat(resultado.repositories()).containsExactly("src/main/java/com/loja/pedido/PedidoRepository.java");
        assertThat(resultado.entidades()).containsExactly("src/main/java/com/loja/pedido/entity/Pedido.java");
        assertThat(resultado.testes()).containsExactly("src/test/java/com/loja/pedido/PedidoServiceTest.java");
    }

    @Test
    void naoDeveContarClasseAuxiliarDeTesteComoTeste() {
        List<String> caminhos = List.of(
                "src/main/java/com/loja/App.java",
                "src/test/java/com/loja/FabricaDePedido.java"
        );

        ResultadoEstrutura resultado = analisador.analisar(caminhos);

        assertThat(resultado.testes()).isEmpty();
    }

    @Test
    void deveIndicarQueRepositorioSemJavaNaoTemCodigoJava() {
        List<String> caminhos = List.of("README.md", "package.json", "src/index.js");

        ResultadoEstrutura resultado = analisador.analisar(caminhos);

        assertThat(resultado.temCodigoJava()).isFalse();
        assertThat(resultado.controllers()).isEmpty();
    }

    @Test
    void deveReconhecerProjetoMultiModulo() {
        List<String> caminhos = List.of(
                "pagamentos/src/main/java/com/loja/PagamentoController.java",
                "pagamentos/src/test/java/com/loja/PagamentoControllerTest.java"
        );

        ResultadoEstrutura resultado = analisador.analisar(caminhos);

        assertThat(resultado.temCodigoJava()).isTrue();
        assertThat(resultado.controllers()).hasSize(1);
        assertThat(resultado.testes()).hasSize(1);
    }

    @Test
    void naoDeveContarDtoDentroDePastaModelComoEntidade() {
        List<String> caminhos = List.of(
                "src/main/java/com/loja/model/Cliente.java",
                "src/main/java/com/loja/model/ClienteDto.java",
                "src/main/java/com/loja/model/CriarClienteRequest.java"
        );

        ResultadoEstrutura resultado = analisador.analisar(caminhos);

        assertThat(resultado.entidades()).containsExactly("src/main/java/com/loja/model/Cliente.java");
    }

    @Test
    void deveAceitarListaVazia() {
        ResultadoEstrutura resultado = analisador.analisar(List.of());

        assertThat(resultado.temCodigoJava()).isFalse();
        assertThat(resultado.testes()).isEmpty();
    }
}