package com.koda.v1.analyzer.ecossistema.node;

import com.koda.v1.analyzer.detector.ArquivoNaoAnalisavelException;
import com.koda.v1.analyzer.detector.Endpoint;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DetectorRotasNodeTest {

    private final DetectorRotasNode detector = new DetectorRotasNode();

    private List<Endpoint> detectar(String codigo, String caminho) {
        return detector.detectar(codigo, caminho, "Componente");
    }

    @Test
    void deveLerControllerDoNestComPrefixoEParametros() {
        List<Endpoint> endpoints = detectar("""
                @Controller('users')
                export class UsersController {
                  @Get()
                  findAll() {}

                  @Get(':id')
                  findOne() {}

                  @Post()
                  create() {}

                  @Delete(':id/roles/:roleId')
                  remove() {}

                  @All('ping')
                  ping() {}
                }
                """, "src/users/users.controller.ts");

        assertThat(endpoints).containsExactly(
                new Endpoint("GET", "/users", "UsersController"),
                new Endpoint("GET", "/users/{id}", "UsersController"),
                new Endpoint("POST", "/users", "UsersController"),
                new Endpoint("DELETE", "/users/{id}/roles/{roleId}", "UsersController"),
                new Endpoint("QUALQUER", "/users/ping", "UsersController"));
    }

    @Test
    void deveLerControllerDoNestSemPrefixo() {
        List<Endpoint> endpoints = detectar("""
                @Controller()
                export class AppController {
                  @Get('health')
                  health() {}
                }
                """, "src/app.controller.ts");

        assertThat(endpoints).containsExactly(new Endpoint("GET", "/health", "AppController"));
    }

    @Test
    void deveSepararOsMetodosDeCadaControllerDoMesmoArquivo() {
        List<Endpoint> endpoints = detectar("""
                @Controller('a')
                export class AController {
                  @Get('x') x() {}
                }

                @Controller({ path: 'b' })
                export class BController {
                  @Post('y') y() {}
                }
                """, "src/ab.controller.ts");

        assertThat(endpoints).containsExactly(
                new Endpoint("GET", "/a/x", "AController"),
                new Endpoint("POST", "/b/y", "BController"));
    }

    @Test
    void deveIgnorarControllerSemClasse() {
        assertThat(detectar("@Controller('x')", "src/x.controller.ts")).isEmpty();
    }

    @Test
    void deveLerRotasDeExpressEOutrosServidores() {
        List<Endpoint> endpoints = detectar("""
                const app = express();
                app.get('/health', (req, res) => res.send('ok'));
                router.post("/items", handler);
                fastify.put(`/items/:id`, handler);
                server.delete('/items/:id?', handler);
                app.all('/qualquer', handler);
                cache.get('/nao-e-rota', handler);
                app.get('sem-barra', handler);
                """, "src/server.ts");

        assertThat(endpoints).containsExactly(
                new Endpoint("GET", "/health", "Componente"),
                new Endpoint("POST", "/items", "Componente"),
                new Endpoint("PUT", "/items/{id}", "Componente"),
                new Endpoint("DELETE", "/items/{id}", "Componente"),
                new Endpoint("QUALQUER", "/qualquer", "Componente"));
    }

    @Test
    void deveIgnorarRotasEmComentarios() {
        List<Endpoint> endpoints = detectar("""
                // app.get('/comentada', h);
                /* router.post('/bloco', h); */
                app.get('/real', h);
                """, "src/app.ts");

        assertThat(endpoints).containsExactly(new Endpoint("GET", "/real", "Componente"));
    }

    @Test
    void deveLerRotasDoNextPeloCaminhoDoArquivo() {
        List<Endpoint> endpoints = detectar("""
                export async function GET(request) {}
                export const POST = async (request) => {};
                export function helper() {}
                """, "src/app/api/(admin)/users/[id]/route.ts");

        assertThat(endpoints).containsExactly(
                new Endpoint("GET", "/api/users/{id}", "Componente"),
                new Endpoint("POST", "/api/users/{id}", "Componente"));
    }

    @Test
    void deveLerRotaRaizDoNextEPagesApi() {
        assertThat(detectar("export function GET() {}", "app/route.ts"))
                .containsExactly(new Endpoint("GET", "/", "Componente"));
        assertThat(detectar("export default function handler() {}", "pages/api/users/[...slug].ts"))
                .containsExactly(new Endpoint("QUALQUER", "/api/users/{slug}", "Componente"));
    }

    @Test
    void deveReconhecerArquivosDeRotaDoNext() {
        assertThat(DetectorRotasNode.pareceArquivoDeRotaDoNext("src/app/api/x/route.ts")).isTrue();
        assertThat(DetectorRotasNode.pareceArquivoDeRotaDoNext("pages/api/x.js")).isTrue();
        assertThat(DetectorRotasNode.pareceArquivoDeRotaDoNext("src/lib/route.ts")).isFalse();
        assertThat(DetectorRotasNode.pareceArquivoDeRotaDoNext("my-app/x/route.ts")).isFalse();
    }

    @Test
    void naoDeveAcharRotaEmArquivoQueNaoTemNenhuma() {
        assertThat(detectar("export const soma = (a, b) => a + b;", "src/util.ts")).isEmpty();
    }

    @Test
    void deveRecusarArquivoVazioOuGrande() {
        assertThatThrownBy(() -> detectar("   ", "src/a.ts")).isInstanceOf(ArquivoNaoAnalisavelException.class);
        assertThatThrownBy(() -> detectar("a".repeat(300_000), "src/a.ts"))
                .isInstanceOf(ArquivoNaoAnalisavelException.class);
    }
}
