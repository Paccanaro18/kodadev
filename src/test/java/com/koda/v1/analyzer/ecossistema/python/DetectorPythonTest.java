package com.koda.v1.analyzer.ecossistema.python;

import com.koda.v1.analyzer.detector.ArquivoNaoAnalisavelException;
import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.detector.Tecnologia;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DetectorPythonTest {

    private final DetectorPython detector = new DetectorPython();

    private ResultadoPython manifesto(String nome, String conteudo) {
        return detector.detectar(Map.of(nome, conteudo));
    }

    @Test
    void deveLerPyprojectNoPadraoPep621() {
        ResultadoPython resultado = manifesto("pyproject.toml", """
                [project]
                name = "loja"
                requires-python = ">=3.11"
                dependencies = [
                    "fastapi>=0.110.0",  # a API
                    "SQLAlchemy[asyncio]>=2.0",
                    "psycopg2_binary",
                    "redis",
                ]

                [project.optional-dependencies]
                dev = ["pytest"]
                """);

        assertThat(resultado.versaoLinguagem()).isEqualTo("3.11");
        assertThat(resultado.framework()).isEqualTo("FastAPI");
        assertThat(resultado.versaoFramework()).isEqualTo("0.110.0");
        assertThat(resultado.dependencias()).containsExactly("fastapi", "sqlalchemy", "psycopg2-binary", "redis");
        assertThat(resultado.tecnologias()).containsExactlyInAnyOrder(Tecnologia.POSTGRESQL, Tecnologia.REDIS);
        assertThat(resultado.temFramework()).isTrue();
    }

    @Test
    void deveLerPyprojectDoPoetry() {
        ResultadoPython resultado = manifesto("pyproject.toml", """
                [tool.poetry.dependencies]
                python = "^3.10"
                Django = "^5.0.2"
                pika = "^1.3"

                [tool.poetry.group.dev.dependencies]
                pytest = "^8.0"
                """);

        assertThat(resultado.versaoLinguagem()).isEqualTo("3.10");
        assertThat(resultado.framework()).isEqualTo("Django");
        assertThat(resultado.versaoFramework()).isEqualTo("5.0.2");
        assertThat(resultado.dependencias()).containsExactly("django", "pika", "pytest");
        assertThat(resultado.tecnologias()).containsExactly(Tecnologia.RABBITMQ);
    }

    @Test
    void deveLerRequirementsIgnorandoOpcoesComentariosELinks() {
        ResultadoPython resultado = manifesto("requirements.txt", """
                # dependências
                -r base.txt
                Flask==3.0.2
                git+https://github.com/x/y.git
                psycopg[binary]>=3.1  # banco
                asyncpg

                """);

        assertThat(resultado.framework()).isEqualTo("Flask");
        assertThat(resultado.versaoFramework()).isEqualTo("3.0.2");
        assertThat(resultado.dependencias()).containsExactly("flask", "psycopg", "asyncpg");
        assertThat(resultado.versaoLinguagem()).isNull();
    }

    @Test
    void deveLerPipfile() {
        ResultadoPython resultado = manifesto("Pipfile", """
                [packages]
                fastapi = "*"
                uvicorn = {version = "*", extras = ["standard"]}

                [dev-packages]
                pytest = "*"

                [requires]
                python_version = "3.12"
                """);

        assertThat(resultado.framework()).isEqualTo("FastAPI");
        assertThat(resultado.versaoFramework()).isNull();
        assertThat(resultado.versaoLinguagem()).isEqualTo("3.12");
        assertThat(resultado.dependencias()).containsExactly("fastapi", "uvicorn", "pytest");
    }

    @Test
    void deveJuntarManifestosEManterAPrimeiraVersaoDoPython() {
        Map<String, String> manifestos = new LinkedHashMap<>();
        manifestos.put("pyproject.toml", "[project]\nrequires-python = \">=3.12\"\ndependencies = [\"flask\"]\n");
        manifestos.put("requirements.txt", "gunicorn\nflask==3.0.0\n");

        ResultadoPython resultado = detector.detectar(manifestos);

        assertThat(resultado.versaoLinguagem()).isEqualTo("3.12");
        assertThat(resultado.dependencias()).containsExactly("flask", "gunicorn");
    }

    @Test
    void deveDizerQueNaoHaFrameworkQuandoNenhumConhecidoAparece() {
        ResultadoPython resultado = manifesto("requirements.txt", "requests\nnumpy\n");

        assertThat(resultado.temFramework()).isFalse();
        assertThat(resultado.framework()).isNull();
    }

    @Test
    void deveLimitarAQuantidadeDeDependencias() {
        StringBuilder muitas = new StringBuilder("flask\n");
        for (int i = 0; i < DetectorPython.MAXIMO_DEPENDENCIAS + 40; i++) {
            muitas.append("pacote-").append(i).append('\n');
        }

        assertThat(manifesto("requirements.txt", muitas.toString()).dependencias())
                .hasSize(DetectorPython.MAXIMO_DEPENDENCIAS);
    }

    @Test
    void deveRecusarManifestoVazioOuGrande() {
        assertThatThrownBy(() -> manifesto("requirements.txt", " ")).isInstanceOf(ArquivoNaoAnalisavelException.class);
        assertThatThrownBy(() -> manifesto("requirements.txt", "a".repeat(300_000)))
                .isInstanceOf(ArquivoNaoAnalisavelException.class);
    }

    @Test
    void deveLerRotasDoFastApiComPrefixoDoRouter() {
        List<Endpoint> endpoints = detector.detectarRotas("""
                router = APIRouter(prefix="/pedidos", tags=["pedidos"])

                @router.get("")
                def listar(): pass

                @router.get("/{pedido_id}")
                def buscar(pedido_id: int): pass

                @router.post("/")
                def criar(): pass

                @app.delete("/saude")  # sem prefixo
                def apagar(): pass

                # @router.put("/comentada")
                """, "app/routers/pedidos.py", "Pedidos");

        assertThat(endpoints).containsExactly(
                new Endpoint("GET", "/pedidos", "Pedidos"),
                new Endpoint("GET", "/pedidos/{pedido_id}", "Pedidos"),
                new Endpoint("POST", "/pedidos", "Pedidos"),
                new Endpoint("DELETE", "/saude", "Pedidos"));
    }

    @Test
    void deveLerRotasDoFlaskComMetodosEParametros() {
        List<Endpoint> endpoints = detector.detectarRotas("""
                bp = Blueprint("itens", __name__, url_prefix="/itens")

                @bp.route("/")
                def listar(): pass

                @bp.route("/<int:item_id>", methods=["GET", "DELETE"])
                def item(item_id): pass

                @app.route("/ping", methods=("post",))
                def ping(): pass

                @app.route("/vazio", methods=[])
                def vazio(): pass
                """, "app/itens.py", "Itens");

        assertThat(endpoints).containsExactly(
                new Endpoint("GET", "/itens", "Itens"),
                new Endpoint("GET", "/itens/{item_id}", "Itens"),
                new Endpoint("DELETE", "/itens/{item_id}", "Itens"),
                new Endpoint("POST", "/ping", "Itens"),
                new Endpoint("GET", "/vazio", "Itens"));
    }

    @Test
    void deveLerRotasDoDjangoSoNoUrlsPy() {
        String urls = """
                urlpatterns = [
                    path("pedidos/", views.lista),
                    path('pedidos/<int:pk>/', views.detalhe),
                ]
                """;

        assertThat(detector.detectarRotas(urls, "loja/urls.py", "Urls")).containsExactly(
                new Endpoint("QUALQUER", "/pedidos", "Urls"),
                new Endpoint("QUALQUER", "/pedidos/{pk}", "Urls"));
        assertThat(detector.detectarRotas(urls, "loja/outro.py", "Outro")).isEmpty();
    }

    @Test
    void deveManterOHashDentroDeTextoEIgnorarAspasEscapadas() {
        List<Endpoint> endpoints = detector.detectarRotas(
                "@app.get(\"/a#b\")\ndef f(): x = 'it\\'s # nao'\n", "app/main.py", "Main");

        assertThat(endpoints).containsExactly(new Endpoint("GET", "/a#b", "Main"));
    }

    @Test
    void deveListarClassesFiltrandoPelasBases() {
        String modelos = """
                class Pedido(Base):
                    pass

                class Cliente(models.Model):
                    pass

                class Utilitario:
                    pass

                class Config(object):
                    pass

                # class Comentada(Base):
                """;

        assertThat(detector.classes(modelos, bases -> bases.contains("Base") || bases.contains("Model")))
                .containsExactly("Pedido", "Cliente");
        assertThat(detector.classes(modelos, String::isEmpty)).containsExactly("Utilitario");
    }

    @Test
    void deveLimitarAsClassesPorArquivo() {
        StringBuilder muitas = new StringBuilder();
        for (int i = 0; i < DetectorPython.MAXIMO_CLASSES_POR_ARQUIVO + 10; i++) {
            muitas.append("class M").append(i).append("(Base):\n    pass\n");
        }

        assertThat(detector.classes(muitas.toString(), bases -> true))
                .hasSize(DetectorPython.MAXIMO_CLASSES_POR_ARQUIVO);
    }
}
