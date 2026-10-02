package com.koda.v1.analyzer.ecossistema;

import com.koda.v1.analyzer.ecossistema.java.ConvencaoJava;
import com.koda.v1.analyzer.ecossistema.node.ConvencaoNode;
import com.koda.v1.analyzer.ecossistema.python.ConvencaoPython;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ConvencoesDeNomesTest {

    @Test
    void deveEscolherAConvencaoDeCadaLinguagem() {
        assertThat(ConvencaoDeNomes.de(Linguagem.JAVA)).isSameAs(ConvencaoJava.INSTANCIA);
        assertThat(ConvencaoDeNomes.de(Linguagem.TYPESCRIPT)).isSameAs(ConvencaoNode.INSTANCIA);
        assertThat(ConvencaoDeNomes.de(Linguagem.JAVASCRIPT)).isSameAs(ConvencaoNode.INSTANCIA);
        assertThat(ConvencaoDeNomes.de(Linguagem.PYTHON)).isSameAs(ConvencaoPython.INSTANCIA);
    }

    @Test
    void deveDarRotuloLegivelParaCadaLinguagem() {
        assertThat(Linguagem.TYPESCRIPT.rotulo()).isEqualTo("TypeScript");
        assertThat(Linguagem.JAVA.rotulo()).isEqualTo("Java");
    }

    @Test
    void deveEscreverEmPascalSemSimbolos() {
        assertThat(NomesEmPascal.de("create-user_dto")).isEqualTo("CreateUserDto");
        assertThat(NomesEmPascal.de("--a--")).isEqualTo("A");
        assertThat(NomesEmPascal.de("")).isEmpty();
    }

    @Test
    void javaDeveListarSoCodigoDeProducaoSemOPrefixo() {
        List<String> fontes = ConvencaoJava.INSTANCIA.arquivosDeFonte(List.of(
                "src/main/java/a/PedidoService.java", "src/test/java/a/PedidoServiceTest.java", "README.md"));

        assertThat(fontes).containsExactly("a/PedidoService.java");
        assertThat(ConvencaoJava.INSTANCIA.nome("src/main/java/a/PedidoService.java")).isEqualTo("PedidoService");
        assertThat(ConvencaoJava.INSTANCIA.nome("Leia")).isEqualTo("Leia");
    }

    @Test
    void nodeDeveNomearComponentesPelaConvencaoDeArquivos() {
        ConvencaoNode node = ConvencaoNode.INSTANCIA;

        assertThat(node.nome("src/users/users.controller.ts")).isEqualTo("UsersController");
        assertThat(node.nome("src/users/create-user.dto.ts")).isEqualTo("CreateUserDto");
        assertThat(node.nome("src/users/users.service.spec.ts")).isEqualTo("UsersServiceTest");
        assertThat(node.nome("src/routes/users/index.ts")).isEqualTo("UsersIndex");
        assertThat(node.nome("Makefile")).isEqualTo("Makefile");
    }

    @Test
    void nodeDeveSepararCodigoDeProducaoDeTesteEDeLixo() {
        assertThat(ConvencaoNode.ehCodigo("src/app.ts")).isTrue();
        assertThat(ConvencaoNode.ehCodigo("src/tipos.d.ts")).isFalse();
        assertThat(ConvencaoNode.ehCodigo("node_modules/x/index.js")).isFalse();
        assertThat(ConvencaoNode.ehCodigo("README.md")).isFalse();
        assertThat(ConvencaoNode.ehTeste("src/a.test.ts")).isTrue();
        assertThat(ConvencaoNode.ehTeste("test/a.ts")).isTrue();
        assertThat(ConvencaoNode.ehTeste("src/a.ts")).isFalse();

        assertThat(ConvencaoNode.INSTANCIA.arquivosDeFonte(List.of(
                "src/a.ts", "src/a.spec.ts", "dist/a.js", "docs/leia.md"))).containsExactly("src/a.ts");
    }

    @Test
    void pythonDeveNomearArquivosEClasses() {
        ConvencaoPython python = ConvencaoPython.INSTANCIA;

        assertThat(python.nome("app/user_service.py")).isEqualTo("UserService");
        assertThat(python.nome("tests/test_user_service.py")).isEqualTo("UserServiceTest");
        assertThat(python.nome("tests/user_service_test.py")).isEqualTo("UserServiceTest");
        assertThat(python.nome("app/models.py#User")).isEqualTo("User");
        assertThat(python.nome("script")).isEqualTo("Script");
    }

    @Test
    void pythonDeveSepararCodigoDeProducaoDeTesteEDeInfra() {
        assertThat(ConvencaoPython.ehCodigo("app/main.py")).isTrue();
        assertThat(ConvencaoPython.ehCodigo("app/__init__.py")).isFalse();
        assertThat(ConvencaoPython.ehCodigo(".venv/lib/x.py")).isFalse();
        assertThat(ConvencaoPython.ehCodigo("app/leia.md")).isFalse();
        assertThat(ConvencaoPython.ehTeste("tests/helpers.py")).isTrue();
        assertThat(ConvencaoPython.ehTeste("app/test_x.py")).isTrue();
        assertThat(ConvencaoPython.ehTeste("app/x_test.py")).isTrue();
        assertThat(ConvencaoPython.ehTeste("app/x.py")).isFalse();

        assertThat(ConvencaoPython.INSTANCIA.arquivosDeFonte(List.of(
                "app/main.py", "tests/test_main.py", "app/__init__.py"))).containsExactly("app/main.py");
    }
}
