package com.koda.v1.analyzer.detector;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;

class DetectorEndpointsTest {

    private final DetectorEndpoints detector = new DetectorEndpoints();

    @Test
    void deveJuntarPrefixoDaClasseComOsCaminhosDosMetodos() {
        String codigo = """
                package com.loja;

                @RestController
                @RequestMapping("/api/pedidos")
                public class PedidoController {

                    @GetMapping
                    public List<Pedido> listar() { return List.of(); }

                    @GetMapping("/{id}")
                    public Pedido buscar(@PathVariable Long id) { return null; }

                    @PostMapping
                    public Pedido criar(@RequestBody PedidoRequest request) { return null; }

                    @DeleteMapping("/{id}")
                    public void remover(@PathVariable Long id) { }
                }
                """;

        List<Endpoint> endpoints = detector.detectar(codigo);

        assertThat(endpoints)
                .extracting(Endpoint::metodoHttp, Endpoint::caminho)
                .containsExactly(
                        tuple("GET", "/api/pedidos"),
                        tuple("GET", "/api/pedidos/{id}"),
                        tuple("POST", "/api/pedidos"),
                        tuple("DELETE", "/api/pedidos/{id}"));
        assertThat(endpoints).allMatch(e -> e.controller().equals("PedidoController"));
    }

    @Test
    void deveFuncionarSemPrefixoNaClasse() {
        String codigo = """
                @Controller
                public class PaginaController {

                    @GetMapping("/home")
                    public String home() { return "home"; }
                }
                """;

        assertThat(detector.detectar(codigo))
                .extracting(Endpoint::metodoHttp, Endpoint::caminho)
                .containsExactly(tuple("GET", "/home"));
    }

    @Test
    void deveLerCaminhoNomeadoMesmoComOutrosArgumentosAntes() {
        String codigo = """
                @RestController
                public class RelatorioController {

                    @GetMapping(produces = "application/json", path = "/relatorio")
                    public String gerar() { return ""; }
                }
                """;

        assertThat(detector.detectar(codigo))
                .extracting(Endpoint::caminho)
                .containsExactly("/relatorio");
    }

    @Test
    void deveLerRequestMappingNoMetodoComEQuemSemVerboHttp() {
        String codigo = """
                @RestController
                @RequestMapping("/contas")
                public class ContaController {

                    @RequestMapping(value = "/abrir", method = RequestMethod.POST)
                    public void abrir() { }

                    @RequestMapping("/listar")
                    public void listar() { }
                }
                """;

        assertThat(detector.detectar(codigo))
                .extracting(Endpoint::metodoHttp, Endpoint::caminho)
                .containsExactly(
                        tuple("POST", "/contas/abrir"),
                        tuple("QUALQUER", "/contas/listar"));
    }

    @Test
    void deveIgnorarMapeamentosComentados() {
        String codigo = """
                @RestController
                public class ProdutoController {

                    // @GetMapping("/antigo")

                    /*
                     * @PostMapping("/velho")
                     */

                    @GetMapping("/novo")
                    public String novo() { return ""; }
                }
                """;

        assertThat(detector.detectar(codigo))
                .extracting(Endpoint::caminho)
                .containsExactly("/novo");
    }

    @Test
    void deveNormalizarBarrasNoCaminho() {
        String codigo = """
                @RestController
                @RequestMapping("api/")
                public class ItemController {

                    @GetMapping("/itens/")
                    public String itens() { return ""; }
                }
                """;

        assertThat(detector.detectar(codigo))
                .extracting(Endpoint::caminho)
                .containsExactly("/api/itens");
    }

    @Test
    void deveDevolverListaVaziaParaClasseQueNaoEhController() {
        String codigo = """
                @Service
                public class PedidoService {

                    public void processar() { }
                }
                """;

        assertThat(detector.detectar(codigo)).isEmpty();
    }

    @Test
    void deveRecusarArquivoMaiorQueOLimiteEArquivoVazio() {
        String gigante = "a".repeat(LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO + 1);

        assertThatThrownBy(() -> detector.detectar(gigante))
                .isInstanceOf(ArquivoNaoAnalisavelException.class)
                .hasMessageContaining("limite");
        assertThatThrownBy(() -> detector.detectar("  "))
                .isInstanceOf(ArquivoNaoAnalisavelException.class);
    }
}