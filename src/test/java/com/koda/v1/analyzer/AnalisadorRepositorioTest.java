package com.koda.v1.analyzer;

import com.koda.v1.analyzer.detector.DetectorDockerCompose;
import com.koda.v1.analyzer.detector.DetectorEndpoints;
import com.koda.v1.analyzer.detector.DetectorEntidade;
import com.koda.v1.analyzer.detector.DetectorPom;
import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.analyzer.estrutura.AnalisadorEstrutura;
import com.koda.v1.analyzer.persistence.AnaliseNaoEncontradaException;
import com.koda.v1.analyzer.persistence.DadosExecucao;
import com.koda.v1.analyzer.persistence.RegistroAnalise;
import com.koda.v1.github.ArquivoGrandeDemaisException;
import com.koda.v1.github.GithubApiException;
import com.koda.v1.github.GithubService;
import com.koda.v1.github.dto.ArquivoResposta;
import com.koda.v1.github.dto.ArvoreResposta;
import com.koda.v1.github.dto.ItemArvoreResposta;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import tools.jackson.databind.json.JsonMapper;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AnalisadorRepositorioTest {

    private static final String POM_SPRING_BOOT = """
            <project>
              <modelVersion>4.0.0</modelVersion>
              <parent>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-starter-parent</artifactId>
                <version>4.1.1</version>
              </parent>
              <properties><java.version>21</java.version></properties>
              <dependencies>
                <dependency>
                  <groupId>org.postgresql</groupId>
                  <artifactId>postgresql</artifactId>
                </dependency>
              </dependencies>
            </project>
            """;

    private static final String POM_SEM_SPRING = """
            <project>
              <modelVersion>4.0.0</modelVersion>
              <groupId>com.loja</groupId>
              <artifactId>loja</artifactId>
            </project>
            """;

    private static final String COMPOSE = """
            services:
              banco:
                image: postgres:16
            """;

    private static final String CONTROLLER = """
            @RestController
            @RequestMapping("/pedidos")
            public class PedidoController {

                @GetMapping
                public String listar() { return ""; }
            }
            """;

    private static final String ENTIDADE = """
            @Entity
            public class Pedido { }
            """;

    private static final String CLASSE_COMUM = """
            public class Nota { }
            """;

    private static final String CAMINHO_CONTROLLER = "src/main/java/a/PedidoController.java";
    private static final String CAMINHO_ENTIDADE = "src/main/java/a/model/Pedido.java";
    private static final String CAMINHO_NAO_ENTIDADE = "src/main/java/a/model/Nota.java";

    private final UUID analiseId = UUID.randomUUID();
    private final UUID usuarioId = UUID.randomUUID();
    private final JsonMapper leitor = JsonMapper.builder().build();

    private RegistroAnalise registro;
    private GithubService github;
    private AnalisadorRepositorio analisador;

    @BeforeEach
    void preparar() {
        registro = mock(RegistroAnalise.class);
        github = mock(GithubService.class);
        when(registro.iniciar(analiseId)).thenReturn(new DadosExecucao(usuarioId, "artur", "loja"));
        analisador = criarAnalisador(Duration.ofMinutes(1));
    }

    @Test
    void deveAnalisarProjetoCompletoEGravarOResultado() {
        arvore(false,
                arquivo("pom.xml"), arquivo("docker-compose.yml"), arquivo(CAMINHO_CONTROLLER),
                arquivo(CAMINHO_ENTIDADE), arquivo(CAMINHO_NAO_ENTIDADE),
                arquivo("src/main/java/a/PedidoService.java"),
                arquivo("src/test/java/a/PedidoServiceTest.java"));
        conteudo("pom.xml", POM_SPRING_BOOT);
        conteudo("docker-compose.yml", COMPOSE);
        conteudo(CAMINHO_CONTROLLER, CONTROLLER);
        conteudo(CAMINHO_ENTIDADE, ENTIDADE);
        conteudo(CAMINHO_NAO_ENTIDADE, CLASSE_COMUM);

        analisador.analisar(analiseId);

        ResultadoAnalise resultado = resultadoGravado();
        assertThat(resultado.springBoot()).isTrue();
        assertThat(resultado.versaoJava()).isEqualTo("21");
        assertThat(resultado.versaoSpringBoot()).isEqualTo("4.1.1");
        assertThat(resultado.tecnologias()).containsExactly(Tecnologia.POSTGRESQL);
        assertThat(resultado.imagensDocker()).containsExactly("postgres");
        assertThat(resultado.endpoints()).containsExactly(new Endpoint("GET", "/pedidos", "PedidoController"));
        assertThat(resultado.entidades()).containsExactly(CAMINHO_ENTIDADE);
        assertThat(resultado.controllers()).containsExactly(CAMINHO_CONTROLLER);
        assertThat(resultado.services()).hasSize(1);
        assertThat(resultado.testes()).hasSize(1);
        assertThat(resultado.parcial()).isFalse();
        verify(registro, never()).falhar(any(), anyString());
    }

    @Test
    void deveRecusarCedoQuandoNaoHaCodigoJava() {
        arvore(false, arquivo("README.md"), arquivo("src/index.js"));

        analisador.analisar(analiseId);

        verify(registro).falhar(analiseId, "O repositório não tem código Java em src/main/java.");
        verify(github, never()).lerArquivo(any(), any(), any(), any());
        verify(registro, never()).concluir(any(), anyString());
    }

    @Test
    void deveRecusarQuandoNaoHaPomNaRaiz() {
        arvore(false, arquivo(CAMINHO_CONTROLLER), arquivo("modulo/pom.xml"));

        analisador.analisar(analiseId);

        verify(registro).falhar(analiseId, "Não encontramos um pom.xml legível na raiz do repositório.");
        verify(github, never()).lerArquivo(any(), any(), any(), any());
    }

    @Test
    void deveRecusarProjetoQueNaoEhSpringBoot() {
        arvore(false, arquivo("pom.xml"), arquivo(CAMINHO_CONTROLLER));
        conteudo("pom.xml", POM_SEM_SPRING);

        analisador.analisar(analiseId);

        verify(registro).falhar(analiseId, "O repositório não é um projeto Spring Boot.");
        verify(registro, never()).concluir(any(), anyString());
    }

    @Test
    void deveFalharQuandoOPomNaoForLegivel() {
        arvore(false, arquivo("pom.xml"), arquivo(CAMINHO_CONTROLLER));
        conteudo("pom.xml", "<project");

        analisador.analisar(analiseId);

        ArgumentCaptor<String> mensagem = ArgumentCaptor.forClass(String.class);
        verify(registro).falhar(any(), mensagem.capture());
        assertThat(mensagem.getValue()).startsWith("Não foi possível analisar pom.xml");
    }

    @Test
    void deveMarcarComoParcialQuandoAArvoreVemTruncada() {
        arvore(true, arquivo("pom.xml"), arquivo(CAMINHO_CONTROLLER));
        conteudo("pom.xml", POM_SPRING_BOOT);
        conteudo(CAMINHO_CONTROLLER, CONTROLLER);

        analisador.analisar(analiseId);

        assertThat(resultadoGravado().parcial()).isTrue();
    }

    @Test
    void deveMarcarComoParcialQuandoUmTetoDeSelecaoForAplicado() {
        List<ItemArvoreResposta> itens = new ArrayList<>(List.of(arquivo("pom.xml")));
        for (int i = 0; i < SelecaoArquivos.MAXIMO_CONTROLLERS + 1; i++) {
            itens.add(arquivo(String.format("src/main/java/a/C%02dController.java", i)));
        }
        arvore(false, itens.toArray(ItemArvoreResposta[]::new));
        when(github.lerArquivo(any(), any(), any(), anyString()))
                .thenAnswer(chamada -> "sha-pom.xml".equals(chamada.getArgument(3))
                        ? new ArquivoResposta("sha-pom.xml", 10, POM_SPRING_BOOT)
                        : new ArquivoResposta("x", 10, CONTROLLER));

        analisador.analisar(analiseId);

        ResultadoAnalise resultado = resultadoGravado();
        assertThat(resultado.parcial()).isTrue();
        assertThat(resultado.endpoints()).hasSize(SelecaoArquivos.MAXIMO_CONTROLLERS);
    }

    @Test
    void devePularArquivosIlegiveisEGrandesMarcandoParcial() {
        String grande = "src/main/java/a/GrandeController.java";
        String vazio = "src/main/java/a/VazioController.java";
        arvore(false, arquivo("pom.xml"), arquivo(CAMINHO_CONTROLLER), arquivo(grande), arquivo(vazio));
        conteudo("pom.xml", POM_SPRING_BOOT);
        conteudo(CAMINHO_CONTROLLER, CONTROLLER);
        conteudo(vazio, "");
        when(github.lerArquivo(usuarioId, "artur", "loja", "sha-" + grande))
                .thenThrow(new ArquivoGrandeDemaisException());

        analisador.analisar(analiseId);

        ResultadoAnalise resultado = resultadoGravado();
        assertThat(resultado.parcial()).isTrue();
        assertThat(resultado.endpoints()).containsExactly(new Endpoint("GET", "/pedidos", "PedidoController"));
    }

    @Test
    void deveLimitarAQuantidadeDeEndpointsEMarcarParcial() {
        StringBuilder muitos = new StringBuilder("@RestController\npublic class MuitosController {\n");
        for (int i = 0; i < AnalisadorRepositorio.MAXIMO_ENDPOINTS + 100; i++) {
            muitos.append("@GetMapping(\"/e").append(i).append("\")\nvoid m").append(i).append("() {}\n");
        }
        muitos.append("}\n");
        String caminho = "src/main/java/a/MuitosController.java";
        arvore(false, arquivo("pom.xml"), arquivo(caminho));
        conteudo("pom.xml", POM_SPRING_BOOT);
        conteudo(caminho, muitos.toString());

        analisador.analisar(analiseId);

        ResultadoAnalise resultado = resultadoGravado();
        assertThat(resultado.endpoints()).hasSize(AnalisadorRepositorio.MAXIMO_ENDPOINTS);
        assertThat(resultado.parcial()).isTrue();
    }

    @Test
    void deveFalharComAMensagemDoGithubQuandoOLimiteDeRequisicoesAcabar() {
        when(github.buscarArvore(usuarioId, "artur", "loja"))
                .thenThrow(new GithubApiException(HttpStatus.TOO_MANY_REQUESTS,
                        "Limite de requisições do GitHub atingido. Tente novamente mais tarde."));

        analisador.analisar(analiseId);

        verify(registro).falhar(analiseId,
                "Limite de requisições do GitHub atingido. Tente novamente mais tarde.");
    }

    @Test
    void naoDeveVazarDetalheDeErroInesperadoNaMensagem() {
        when(github.buscarArvore(usuarioId, "artur", "loja"))
                .thenThrow(new RuntimeException("token-secreto-123 em /caminho/interno"));

        analisador.analisar(analiseId);

        verify(registro).falhar(analiseId, AnalisadorRepositorio.MENSAGEM_ERRO_INESPERADO);
    }

    @Test
    void deveFalharQuandoOPrazoMaximoEstourar() {
        AnalisadorRepositorio semTempo = criarAnalisador(Duration.ofMillis(-1));
        arvore(false, arquivo("pom.xml"), arquivo(CAMINHO_CONTROLLER));
        conteudo("pom.xml", POM_SPRING_BOOT);

        semTempo.analisar(analiseId);

        verify(registro).falhar(analiseId, "A análise demorou mais que o permitido.");
    }

    @Test
    void deveDeixarPassarQuandoAAnaliseNaoExiste() {
        UUID inexistente = UUID.randomUUID();
        when(registro.iniciar(inexistente)).thenThrow(new AnaliseNaoEncontradaException(inexistente));

        assertThatThrownBy(() -> analisador.analisar(inexistente))
                .isInstanceOf(AnaliseNaoEncontradaException.class);
        verify(registro, never()).falhar(any(), anyString());
    }

    private AnalisadorRepositorio criarAnalisador(Duration prazo) {
        return new AnalisadorRepositorio(
                registro,
                github,
                new SelecaoArquivos(new AnalisadorEstrutura()),
                new DetectorPom(),
                new DetectorDockerCompose(),
                new DetectorEndpoints(),
                new DetectorEntidade(),
                new MontadorResultado(),
                new SerializadorResultado(),
                prazo);
    }

    private ItemArvoreResposta arquivo(String caminho) {
        return new ItemArvoreResposta(caminho, "blob", "sha-" + caminho, 100L);
    }

    private void arvore(boolean truncada, ItemArvoreResposta... itens) {
        when(github.buscarArvore(usuarioId, "artur", "loja"))
                .thenReturn(new ArvoreResposta("main", truncada, List.of(itens)));
    }

    private void conteudo(String caminho, String texto) {
        when(github.lerArquivo(usuarioId, "artur", "loja", "sha-" + caminho))
                .thenReturn(new ArquivoResposta("sha-" + caminho, texto.length(), texto));
    }

    private ResultadoAnalise resultadoGravado() {
        ArgumentCaptor<String> json = ArgumentCaptor.forClass(String.class);
        verify(registro).concluir(any(), json.capture());
        return leitor.readValue(json.getValue(), ResultadoAnalise.class);
    }
}
