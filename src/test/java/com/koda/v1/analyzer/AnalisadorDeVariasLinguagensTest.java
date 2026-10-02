package com.koda.v1.analyzer;

import com.koda.v1.analyzer.contexto.Arquitetura;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.MontadorContexto;
import com.koda.v1.analyzer.contexto.SanitizadorIdentificador;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.analyzer.detector.DetectorDockerCompose;
import com.koda.v1.analyzer.detector.DetectorEndpoints;
import com.koda.v1.analyzer.detector.DetectorEntidade;
import com.koda.v1.analyzer.detector.DetectorPom;
import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.analyzer.ecossistema.Linguagem;
import com.koda.v1.analyzer.ecossistema.java.EcossistemaJava;
import com.koda.v1.analyzer.ecossistema.node.DetectorPackageJson;
import com.koda.v1.analyzer.ecossistema.node.DetectorRotasNode;
import com.koda.v1.analyzer.ecossistema.node.EcossistemaNode;
import com.koda.v1.analyzer.ecossistema.python.DetectorPython;
import com.koda.v1.analyzer.ecossistema.python.EcossistemaPython;
import com.koda.v1.analyzer.estrutura.AnalisadorEstrutura;
import com.koda.v1.analyzer.persistence.DadosExecucao;
import com.koda.v1.analyzer.persistence.RegistroAnalise;
import com.koda.v1.github.GithubService;
import com.koda.v1.github.dto.ArquivoResposta;
import com.koda.v1.github.dto.ArvoreResposta;
import com.koda.v1.github.dto.ItemArvoreResposta;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import tools.jackson.databind.json.JsonMapper;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** O mesmo analisador escolhendo o ecossistema pelo conteúdo do repositório. */
class AnalisadorDeVariasLinguagensTest {

    private static final String PACKAGE_NEST = """
            {"name":"api","dependencies":{"@nestjs/core":"^10.3.1","pg":"^8.11.0"},
             "devDependencies":{"typescript":"^5.4.5"}}
            """;
    private static final String CONTROLLER_NEST = """
            @Controller('pedidos')
            export class PedidosController {
              @Get() listar() {}
              @Get(':id') buscar() {}
            }
            """;
    private static final String PYPROJECT_FASTAPI = """
            [project]
            name = "loja"
            requires-python = ">=3.11"
            dependencies = ["fastapi>=0.110", "sqlalchemy>=2.0", "psycopg2-binary"]
            """;
    private static final String ROTAS_FASTAPI = """
            router = APIRouter(prefix="/pedidos")

            @router.get("")
            def listar(): pass

            @router.get("/{pedido_id}")
            def buscar(pedido_id: int): pass
            """;
    private static final String MODELOS_PYTHON = """
            class Pedido(Base):
                __tablename__ = "pedidos"

            class Auxiliar:
                pass
            """;

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

        MontadorContexto montador = new MontadorContexto(new SanitizadorIdentificador());
        DetectorDockerCompose compose = new DetectorDockerCompose();
        analisador = new AnalisadorRepositorio(registro, github, List.of(
                new EcossistemaJava(new SelecaoArquivos(new AnalisadorEstrutura()), new DetectorPom(), compose,
                        new DetectorEndpoints(), new DetectorEntidade(), new MontadorResultado(), montador),
                new EcossistemaNode(new DetectorPackageJson(), new DetectorRotasNode(), compose, montador),
                new EcossistemaPython(new DetectorPython(), compose, montador)),
                new SerializadorResultado(), new SerializadorContexto(), Duration.ofMinutes(1));
    }

    @Test
    void deveAnalisarProjetoNestJs() {
        arvore(false, "package.json", "tsconfig.json", "pnpm-lock.yaml", "docker-compose.yml",
                "src/pedidos/pedidos.controller.ts", "src/pedidos/pedidos.service.ts",
                "src/pedidos/pedido.entity.ts", "src/pedidos/dto/create-pedido.dto.ts",
                "src/pedidos/pedidos.service.spec.ts", "src/shared/http-exception.filter.ts",
                "node_modules/x/index.js", "dist/main.js");
        conteudo("package.json", PACKAGE_NEST);
        conteudo("src/pedidos/pedidos.controller.ts", CONTROLLER_NEST);
        conteudo("docker-compose.yml", "services:\n  db:\n    image: redis:7\n");

        analisador.analisar(analiseId);

        ResultadoAnalise resultado = resultadoGravado();
        assertThat(resultado.linguagem()).isEqualTo(Linguagem.TYPESCRIPT);
        assertThat(resultado.framework()).isEqualTo("NestJS");
        assertThat(resultado.versaoLinguagem()).isEqualTo("5.4.5");
        assertThat(resultado.versaoFramework()).isEqualTo("10.3.1");
        assertThat(resultado.ferramentaDeBuild()).isEqualTo("pnpm");
        assertThat(resultado.tecnologias()).containsExactlyInAnyOrder(Tecnologia.POSTGRESQL, Tecnologia.REDIS);
        assertThat(resultado.endpoints()).containsExactly(
                new Endpoint("GET", "/pedidos", "PedidosController"),
                new Endpoint("GET", "/pedidos/{id}", "PedidosController"));
        assertThat(resultado.testes()).containsExactly("src/pedidos/pedidos.service.spec.ts");
        assertThat(resultado.parcial()).isFalse();
        verify(registro, never()).falhar(any(), anyString());

        ContextoProjeto contexto = contextoGravado();
        assertThat(contexto.linguagem()).isEqualTo(Linguagem.TYPESCRIPT);
        assertThat(contexto.componentes().controllers()).containsExactly("PedidosController");
        assertThat(contexto.componentes().services()).containsExactly("PedidosService");
        assertThat(contexto.componentes().entidades()).containsExactly("PedidoEntity");
        assertThat(contexto.componentes().dtos()).containsExactly("CreatePedidoDto");
        assertThat(contexto.componentes().temTratadorDeErros()).isTrue();
        assertThat(contexto.testes().servicesSemTeste()).isEmpty();
        assertThat(contexto.testes().controllersSemTeste()).containsExactly("PedidosController");
        assertThat(contexto.features()).containsExactly("pedidos");
        assertThat(contexto.arquitetura()).isNotEqualTo(Arquitetura.HEXAGONAL);
    }

    @Test
    void deveLerModelsDoPrismaComoEntidades() {
        arvore(false, "package.json", "prisma/schema.prisma", "src/server.ts");
        conteudo("package.json", "{\"dependencies\":{\"express\":\"4.19.2\"}}");
        conteudo("prisma/schema.prisma", "model User {\n  id Int\n}\n\nmodel Pedido {\n  id Int\n}\nenum Papel { A }\n");
        conteudo("src/server.ts", "app.get('/saude', h);");

        analisador.analisar(analiseId);

        ResultadoAnalise resultado = resultadoGravado();
        assertThat(resultado.linguagem()).isEqualTo(Linguagem.JAVASCRIPT);
        assertThat(resultado.entidades()).containsExactly("prisma/schema.prisma#User", "prisma/schema.prisma#Pedido");
        assertThat(resultado.endpoints()).containsExactly(new Endpoint("GET", "/saude", "Server"));
        assertThat(resultado.ferramentaDeBuild()).isEqualTo("npm");
        assertThat(contextoGravado().componentes().entidades()).containsExactly("Pedido", "User");
    }

    @Test
    void deveRecusarNodeSemFrameworkDeServidor() {
        arvore(false, "package.json", "src/App.tsx");
        conteudo("package.json", "{\"dependencies\":{\"react\":\"18.2.0\"}}");

        analisador.analisar(analiseId);

        verify(registro).falhar(analiseId,
                "O repositório não parece um servidor Node (NestJS, Express, Fastify, Koa, Hono, Hapi ou Next.js).");
        verify(registro, never()).concluir(any(), anyString(), anyString(), anyInt());
    }

    @Test
    void deveMarcarComoParcialQuandoUmArquivoDeRotaNaoPodeSerLido() {
        arvore(false, "package.json", "src/a.controller.ts", "src/b.controller.ts");
        conteudo("package.json", "{\"dependencies\":{\"express\":\"4\"}}");
        conteudo("src/a.controller.ts", "app.get('/a', h);");
        when(github.lerArquivo(usuarioId, "artur", "loja", "sha-src/b.controller.ts"))
                .thenThrow(new com.koda.v1.github.ArquivoGrandeDemaisException());

        analisador.analisar(analiseId);

        ResultadoAnalise resultado = resultadoGravado();
        assertThat(resultado.parcial()).isTrue();
        assertThat(resultado.endpoints()).containsExactly(new Endpoint("GET", "/a", "AController"));
    }

    @Test
    void deveLimitarOsEndpointsDoNodeEMarcarParcial() {
        StringBuilder muitos = new StringBuilder();
        for (int i = 0; i < EcossistemaNodeTestes.MAXIMO_ENDPOINTS + 50; i++) {
            muitos.append("app.get('/e").append(i).append("', h);\n");
        }
        arvore(false, "package.json", "src/server.ts");
        conteudo("package.json", "{\"dependencies\":{\"express\":\"4\"}}");
        conteudo("src/server.ts", muitos.toString());

        analisador.analisar(analiseId);

        ResultadoAnalise resultado = resultadoGravado();
        assertThat(resultado.endpoints()).hasSize(EcossistemaNodeTestes.MAXIMO_ENDPOINTS);
        assertThat(resultado.parcial()).isTrue();
    }

    @Test
    void deveRecusarPackageJsonIlegivel() {
        arvore(false, "package.json", "src/server.ts");
        conteudo("package.json", "{ quebrado");

        analisador.analisar(analiseId);

        verify(registro).falhar(any(), anyString());
        verify(registro, never()).concluir(any(), anyString(), anyString(), anyInt());
    }

    @Test
    void deveAnalisarProjetoFastApi() {
        arvore(false, "pyproject.toml", "poetry.lock", "app/main.py", "app/routers/pedidos.py",
                "app/models.py", "app/pedido_service.py", "tests/test_pedido_service.py", "app/__init__.py");
        conteudo("pyproject.toml", PYPROJECT_FASTAPI);
        conteudo("app/routers/pedidos.py", ROTAS_FASTAPI);
        conteudo("app/models.py", MODELOS_PYTHON);
        conteudo("app/main.py", "app = FastAPI()\n");

        analisador.analisar(analiseId);

        ResultadoAnalise resultado = resultadoGravado();
        assertThat(resultado.linguagem()).isEqualTo(Linguagem.PYTHON);
        assertThat(resultado.framework()).isEqualTo("FastAPI");
        assertThat(resultado.ferramentaDeBuild()).isEqualTo("poetry");
        assertThat(resultado.versaoLinguagem()).isEqualTo("3.11");
        assertThat(resultado.endpoints()).containsExactly(
                new Endpoint("GET", "/pedidos", "Pedidos"),
                new Endpoint("GET", "/pedidos/{pedido_id}", "Pedidos"));
        assertThat(resultado.entidades()).containsExactly("app/models.py#Pedido");
        assertThat(resultado.tecnologias()).containsExactly(Tecnologia.POSTGRESQL);

        ContextoProjeto contexto = contextoGravado();
        assertThat(contexto.linguagem()).isEqualTo(Linguagem.PYTHON);
        assertThat(contexto.componentes().entidades()).containsExactly("Pedido");
        assertThat(contexto.componentes().services()).containsExactly("PedidoService");
        assertThat(contexto.testes().servicesSemTeste()).isEmpty();
    }

    @Test
    void deveEscolherOEcossistemaComMaisArquivosEmUmRepositorioMisto() {
        arvore(false, "package.json", "pyproject.toml", "src/a.ts", "app/a.py", "app/b.py", "app/c.py");
        conteudo("pyproject.toml", PYPROJECT_FASTAPI);

        analisador.analisar(analiseId);

        assertThat(resultadoGravado().linguagem()).isEqualTo(Linguagem.PYTHON);
    }

    @Test
    void deveRecusarRepositorioDeLinguagemNaoSuportada() {
        arvore(false, "go.mod", "main.go", "README.md");

        analisador.analisar(analiseId);

        verify(registro).falhar(analiseId, AnalisadorRepositorio.MENSAGEM_LINGUAGEM_NAO_SUPORTADA);
    }

    private void arvore(boolean truncada, String... caminhos) {
        List<ItemArvoreResposta> itens = new ArrayList<>();
        for (String caminho : caminhos) {
            itens.add(new ItemArvoreResposta(caminho, "blob", "sha-" + caminho, 100L));
        }
        when(github.buscarArvore(usuarioId, "artur", "loja"))
                .thenReturn(new ArvoreResposta("main", truncada, itens));
    }

    private void conteudo(String caminho, String texto) {
        when(github.lerArquivo(usuarioId, "artur", "loja", "sha-" + caminho))
                .thenReturn(new ArquivoResposta("sha-" + caminho, texto.length(), texto));
    }

    private ResultadoAnalise resultadoGravado() {
        ArgumentCaptor<String> json = ArgumentCaptor.forClass(String.class);
        verify(registro).concluir(any(), json.capture(), anyString(), anyInt());
        return leitor.readValue(json.getValue(), ResultadoAnalise.class);
    }

    private ContextoProjeto contextoGravado() {
        ArgumentCaptor<String> json = ArgumentCaptor.forClass(String.class);
        verify(registro).concluir(any(), anyString(), json.capture(), anyInt());
        return new SerializadorContexto().deJson(json.getValue());
    }

    /** O limite é do ecossistema Node; copiado aqui para o teste não depender de visibilidade de pacote. */
    private static final class EcossistemaNodeTestes {
        static final int MAXIMO_ENDPOINTS = 500;
    }
}
