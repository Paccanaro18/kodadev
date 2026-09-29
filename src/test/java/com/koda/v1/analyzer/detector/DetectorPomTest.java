package com.koda.v1.analyzer.detector;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DetectorPomTest {

    private final DetectorPom detector = new DetectorPom();

    @Test
    void deveDetectarJavaSpringBootDependenciasETecnologias() {
        String pom = """
                <?xml version="1.0" encoding="UTF-8"?>
                <project xmlns="http://maven.apache.org/POM/4.0.0">
                  <parent>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-starter-parent</artifactId>
                    <version>3.4.1</version>
                  </parent>
                  <properties>
                    <java.version>21</java.version>
                  </properties>
                  <dependencies>
                    <dependency>
                      <groupId>org.springframework.boot</groupId>
                      <artifactId>spring-boot-starter-web</artifactId>
                    </dependency>
                    <dependency>
                      <groupId>org.postgresql</groupId>
                      <artifactId>postgresql</artifactId>
                    </dependency>
                    <dependency>
                      <groupId>org.springframework.boot</groupId>
                      <artifactId>spring-boot-starter-amqp</artifactId>
                    </dependency>
                  </dependencies>
                </project>
                """;

        ResultadoPom resultado = detector.detectar(pom);

        assertThat(resultado.ehSpringBoot()).isTrue();
        assertThat(resultado.versaoSpringBoot()).isEqualTo("3.4.1");
        assertThat(resultado.versaoJava()).isEqualTo("21");
        assertThat(resultado.dependencias()).contains(
                "org.springframework.boot:spring-boot-starter-web",
                "org.postgresql:postgresql");
        assertThat(resultado.tecnologias()).containsExactlyInAnyOrder(
                Tecnologia.POSTGRESQL, Tecnologia.RABBITMQ);
    }

    @Test
    void deveResolverVersaoDefinidaEmPropriedade() {
        String pom = """
                <?xml version="1.0" encoding="UTF-8"?>
                <project>
                  <properties>
                    <spring-boot.version>3.3.5</spring-boot.version>
                    <maven.compiler.release>17</maven.compiler.release>
                  </properties>
                  <dependencyManagement>
                    <dependencies>
                      <dependency>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-dependencies</artifactId>
                        <version>${spring-boot.version}</version>
                      </dependency>
                    </dependencies>
                  </dependencyManagement>
                </project>
                """;

        ResultadoPom resultado = detector.detectar(pom);

        assertThat(resultado.versaoSpringBoot()).isEqualTo("3.3.5");
        assertThat(resultado.versaoJava()).isEqualTo("17");
    }

    @Test
    void naoDeveIgnorarDependenciasDeDentroDoDependencyManagement() {
        String pom = """
                <?xml version="1.0" encoding="UTF-8"?>
                <project>
                  <dependencyManagement>
                    <dependencies>
                      <dependency>
                        <groupId>org.postgresql</groupId>
                        <artifactId>postgresql</artifactId>
                        <version>42.7.0</version>
                      </dependency>
                    </dependencies>
                  </dependencyManagement>
                </project>
                """;

        ResultadoPom resultado = detector.detectar(pom);

        assertThat(resultado.dependencias()).isEmpty();
        assertThat(resultado.tecnologias()).isEmpty();
    }

    @Test
    void deveIndicarQueProjetoSemSpringBootNaoEhSpringBoot() {
        String pom = """
                <?xml version="1.0" encoding="UTF-8"?>
                <project>
                  <dependencies>
                    <dependency>
                      <groupId>com.google.guava</groupId>
                      <artifactId>guava</artifactId>
                    </dependency>
                  </dependencies>
                </project>
                """;

        ResultadoPom resultado = detector.detectar(pom);

        assertThat(resultado.ehSpringBoot()).isFalse();
        assertThat(resultado.versaoJava()).isNull();
    }

    @Test
    void deveRecusarXmlInvalido() {
        assertThatThrownBy(() -> detector.detectar("isto não é xml"))
                .isInstanceOf(ArquivoNaoAnalisavelException.class);
    }

    @Test
    void deveRecusarXmlComDeclaracaoDeEntidadeExterna() {
        String pomMalicioso = """
                <?xml version="1.0" encoding="UTF-8"?>
                <!DOCTYPE project [ <!ENTITY segredo SYSTEM "file:///etc/passwd"> ]>
                <project>&segredo;</project>
                """;

        assertThatThrownBy(() -> detector.detectar(pomMalicioso))
                .isInstanceOf(ArquivoNaoAnalisavelException.class);
    }

    @Test
    void deveRecusarArquivoMaiorQueOLimite() {
        String gigante = "a".repeat(LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO + 1);

        assertThatThrownBy(() -> detector.detectar(gigante))
                .isInstanceOf(ArquivoNaoAnalisavelException.class)
                .hasMessageContaining("limite");
    }

    @Test
    void deveRecusarArquivoVazio() {
        assertThatThrownBy(() -> detector.detectar("   "))
                .isInstanceOf(ArquivoNaoAnalisavelException.class);
    }
}