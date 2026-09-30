package com.koda.v1.analyzer.detector;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTimeoutPreemptively;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DetectorEntidadeTest {

    private final DetectorEntidade detector = new DetectorEntidade();

    @Test
    void deveReconhecerEntidadeJpa() {
        String codigo = """
                package com.koda.v1.user;

                @Entity
                @Table(name = "usuarios")
                public class Usuario {
                    @Id
                    private java.util.UUID id;
                }
                """;

        assertThat(detector.ehEntidade(codigo)).isTrue();
    }

    @Test
    void deveReconhecerAnotacaoComPacoteCompleto() {
        String codigo = """
                @jakarta.persistence.Entity
                public class Produto { }
                """;

        assertThat(detector.ehEntidade(codigo)).isTrue();
    }

    @Test
    void naoDeveConfundirEntityListenersComEntity() {
        String codigo = """
                @EntityListeners(AuditoriaListener.class)
                public class Auditoria { }
                """;

        assertThat(detector.ehEntidade(codigo)).isFalse();
    }

    @Test
    void naoDeveContarEntityComentada() {
        String codigo = """
                // @Entity
                /*
                 * @Entity
                 */
                public class Rascunho { }
                """;

        assertThat(detector.ehEntidade(codigo)).isFalse();
    }

    @Test
    void naoDeveContarClasseSemAnotacao() {
        String codigo = """
                public class UsuarioResposta {
                    private String nome;
                }
                """;

        assertThat(detector.ehEntidade(codigo)).isFalse();
    }

    @Test
    void deveTerminarRapidoComArquivoHostilNoTamanhoMaximo() {
        int maximo = LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO;
        String quebras = "a" + "\n".repeat(maximo - 1);
        String espacosComQuebras = "a" + " \n".repeat(maximo / 2 - 1);
        String blocosAbertos = "/*\n".repeat(maximo / 3);

        assertTimeoutPreemptively(Duration.ofSeconds(2), () -> {
            detector.ehEntidade(quebras);
            detector.ehEntidade(espacosComQuebras);
            detector.ehEntidade(blocosAbertos);
        });
    }

    @Test
    void deveRecusarArquivoMaiorQueOLimiteEArquivoVazio() {
        String gigante = "a".repeat(LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO + 1);

        assertThatThrownBy(() -> detector.ehEntidade(gigante))
                .isInstanceOf(ArquivoNaoAnalisavelException.class)
                .hasMessageContaining("limite");
        assertThatThrownBy(() -> detector.ehEntidade("  "))
                .isInstanceOf(ArquivoNaoAnalisavelException.class);
    }
}