package com.koda.v1.challenge.similaridade;

import com.koda.v1.challenge.ConteudoDesafio;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;
import static org.junit.jupiter.api.Assertions.assertTimeoutPreemptively;

class DetectorSimilaridadeTest {

    private final DetectorSimilaridade detector = new DetectorSimilaridade(0.70);

    private ConteudoDesafio paginacaoDePedidos() {
        return conteudo(
                "Adicionar paginação à listagem de pedidos",
                "Permitir que a listagem de pedidos seja consultada por páginas, com parâmetros de página e tamanho "
                        + "e um limite máximo de itens por página.",
                "O endpoint GET /pedidos devolve todos os pedidos de uma vez, o que deixa a resposta lenta quando "
                        + "há muitos registros.",
                List.of("A listagem aceita os parâmetros página e tamanho.",
                        "Tamanho acima do limite máximo retorna erro 400.",
                        "A resposta informa o total de itens e de páginas."));
    }

    private ConteudoDesafio paginacaoDeClientes() {
        return conteudo(
                "Adicionar paginação à listagem de clientes",
                "Permitir que a listagem de clientes seja consultada por páginas, com parâmetros de página e tamanho "
                        + "e um limite máximo de itens por página.",
                "O endpoint GET /clientes devolve todos os clientes de uma vez, o que deixa a resposta lenta quando "
                        + "há muitos registros.",
                List.of("A listagem aceita os parâmetros página e tamanho.",
                        "Tamanho acima do limite máximo retorna erro 400.",
                        "A resposta informa o total de clientes e de páginas."));
    }

    private ConteudoDesafio testesDoServiceDeEstoque() {
        return conteudo(
                "Cobrir o service de estoque com testes unitários",
                "Garantir que as regras de baixa e reposição de produtos estejam protegidas por testes automatizados.",
                "A classe de estoque concentra as regras de saldo, mas nenhum teste confirma o comportamento "
                        + "quando o saldo fica negativo.",
                List.of("Existe teste para reposição com quantidade válida.",
                        "Existe teste para baixa maior que o saldo disponível.",
                        "As dependências externas são isoladas com mocks."));
    }

    @Test
    void deveDarPontuacaoMaximaParaConteudosIguais() {
        assertThat(detector.pontuacao(paginacaoDePedidos(), paginacaoDePedidos())).isCloseTo(1.0, within(1e-9));
    }

    @Test
    void deveDarPontuacaoBaixaParaTicketsDeAssuntosDiferentes() {
        assertThat(detector.pontuacao(paginacaoDePedidos(), testesDoServiceDeEstoque())).isLessThan(0.15);
    }

    @Test
    void deveIgnorarAcentosMaiusculasEPlural() {
        ConteudoDesafio variacao = conteudo(
                "ADICIONAR PAGINACAO A LISTAGEM DE PEDIDO",
                "permitir que a listagem de pedido seja consultada por pagina, com parametro de pagina e tamanho "
                        + "e um limite maximo de iten por pagina.",
                "o endpoint get /pedidos devolve todos os pedido de uma vez, o que deixa a resposta lenta quando "
                        + "ha muito registro.",
                List.of("a listagem aceita os parametro pagina e tamanho.",
                        "tamanho acima do limite maximo retorna erro 400.",
                        "a resposta informa o total de item e de pagina."));

        assertThat(detector.pontuacao(paginacaoDePedidos(), variacao)).isGreaterThan(0.85);
    }

    @Test
    void deveIgnorarPalavrasSemValorAoComparar() {
        ConteudoDesafio comEnfeites = conteudo(
                "Então, adicionar paginação à listagem de pedidos para cada",
                "Permitir que a listagem de pedidos seja consultada por páginas, com parâmetros de página e tamanho "
                        + "e um limite máximo de itens por página, sem mais.",
                "O endpoint GET /pedidos devolve todos os pedidos de uma vez, o que deixa a resposta lenta quando "
                        + "há muitos registros, como hoje.",
                List.of("A listagem aceita os parâmetros página e tamanho.",
                        "Tamanho acima do limite máximo retorna erro 400.",
                        "A resposta informa o total de itens e de páginas."));

        assertThat(detector.pontuacao(paginacaoDePedidos(), comEnfeites)).isGreaterThan(0.95);
    }

    @Test
    void deveBarrarOMesmoTicketComOutroRecursoPorSerRepetitivo() {
        double pontuacao = detector.pontuacao(paginacaoDePedidos(), paginacaoDeClientes());

        assertThat(pontuacao).isGreaterThanOrEqualTo(0.70);
        assertThat(detector.buscarParecido(paginacaoDeClientes(), List.of(paginacaoDePedidos()))).isPresent();
    }

    @Test
    void naoDeveBarrarTicketsQueSoCompartilhamOTitulo() {
        ConteudoDesafio soOTitulo = conteudo(
                paginacaoDePedidos().titulo(),
                testesDoServiceDeEstoque().objetivo(),
                testesDoServiceDeEstoque().cenarioAtual(),
                testesDoServiceDeEstoque().criteriosDeAceite());

        assertThat(detector.pontuacao(paginacaoDePedidos(), soOTitulo)).isLessThan(0.70);
        assertThat(detector.buscarParecido(soOTitulo, List.of(paginacaoDePedidos()))).isEmpty();
    }

    @Test
    void deveBarrarTicketsIguaisMudandoSoOTitulo() {
        ConteudoDesafio soOutroTitulo = conteudo(
                "Dividir a consulta de pedidos em partes",
                paginacaoDePedidos().objetivo(),
                paginacaoDePedidos().cenarioAtual(),
                paginacaoDePedidos().criteriosDeAceite());

        assertThat(detector.buscarParecido(soOutroTitulo, List.of(paginacaoDePedidos()))).isPresent();
    }

    @Test
    void deveSerSimetrico() {
        assertThat(detector.pontuacao(paginacaoDePedidos(), paginacaoDeClientes()))
                .isCloseTo(detector.pontuacao(paginacaoDeClientes(), paginacaoDePedidos()), within(1e-9));
    }

    @Test
    void deveIndicarOMaisParecidoEntreVarios() {
        ConteudoDesafio parcial = conteudo(
                "Paginar listagens",
                paginacaoDePedidos().objetivo(),
                testesDoServiceDeEstoque().cenarioAtual(),
                testesDoServiceDeEstoque().criteriosDeAceite());
        DetectorSimilaridade permissivo = new DetectorSimilaridade(0.2);

        List<ConteudoDesafio> anteriores = List.of(testesDoServiceDeEstoque(), parcial, paginacaoDeClientes());
        Parecido parecido = permissivo.buscarParecido(paginacaoDePedidos(), anteriores).orElseThrow();

        assertThat(parecido.posicao()).isEqualTo(2);
        assertThat(parecido.pontuacao()).isGreaterThan(0.7);
    }

    @Test
    void deveDevolverVazioSemAnterioresOuSemNenhumParecido() {
        assertThat(detector.buscarParecido(paginacaoDePedidos(), List.of())).isEmpty();
        assertThat(detector.buscarParecido(paginacaoDePedidos(), List.of(testesDoServiceDeEstoque()))).isEmpty();
    }

    @Test
    void deveTratarOLimiteComoInclusivo() {
        double exata = detector.pontuacao(paginacaoDePedidos(), paginacaoDeClientes());

        assertThat(new DetectorSimilaridade(exata).buscarParecido(paginacaoDePedidos(), List.of(paginacaoDeClientes())))
                .isPresent();
        assertThat(new DetectorSimilaridade(Math.min(1.0, exata + 0.001))
                .buscarParecido(paginacaoDePedidos(), List.of(paginacaoDeClientes()))).isEmpty();
    }

    @Test
    void deveRecusarLimitesInvalidos() {
        assertThatThrownBy(() -> new DetectorSimilaridade(0)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new DetectorSimilaridade(-0.1)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new DetectorSimilaridade(1.01)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new DetectorSimilaridade(Double.NaN)).isInstanceOf(IllegalArgumentException.class);
        assertThat(new DetectorSimilaridade(1.0).limite()).isEqualTo(1.0);
    }

    @Test
    void deveAguentarCamposSemTermosUteisOuListasVazias() {
        ConteudoDesafio vazio = conteudo("de a o", "de a o", "de a o", List.of());

        assertThat(detector.pontuacao(vazio, vazio)).isEqualTo(0.0);
        assertThat(detector.pontuacao(vazio, paginacaoDePedidos())).isEqualTo(0.0);
    }

    @Test
    void deveComparar50TicketsRapidamente() {
        List<ConteudoDesafio> anteriores = new ArrayList<>();
        for (int i = 0; i < 50; i++) {
            anteriores.add(i % 2 == 0 ? paginacaoDeClientes() : testesDoServiceDeEstoque());
        }

        assertTimeoutPreemptively(Duration.ofSeconds(2),
                () -> detector.buscarParecido(paginacaoDePedidos(), anteriores));
    }

    private ConteudoDesafio conteudo(String titulo, String objetivo, String cenario, List<String> criterios) {
        return new ConteudoDesafio(
                titulo, "Contexto do módulo.", cenario, objetivo,
                List.of("Regra 1", "Regra 2"), List.of("Requisito 1", "Requisito 2"), criterios,
                List.of("Teste 1"), List.of("Restrição 1"), List.of("Habilidade 1"));
    }

    @Test
    void deveConsiderarParecidoQuandoAPontuacaoIgualaOLimiteExato() {
        DetectorSimilaridade exato = new DetectorSimilaridade(1.0);
        ConteudoDesafio igual = paginacaoDePedidos();

        assertThat(exato.pontuacao(igual, paginacaoDePedidos())).isEqualTo(1.0);
        assertThat(exato.buscarParecido(igual, List.of(paginacaoDePedidos()))).isPresent();
        assertThat(exato.buscarParecido(igual, List.of(paginacaoDeClientes()))).isEmpty();
    }

    @Test
    void deveContarTermosDeTresLetrasEIgnorarOsDeDuasNoTitulo() {
        assertThat(detector.pontuacao(comTituloEOutrosTermosDiferentes("abc", "a"), comTituloEOutrosTermosDiferentes("abc", "b")))
                .isCloseTo(0.25, within(1e-9));
        assertThat(detector.pontuacao(comTituloEOutrosTermosDiferentes("ab", "a"), comTituloEOutrosTermosDiferentes("ab", "b")))
                .isCloseTo(0.0, within(1e-9));
    }

    @Test
    void deveTratarPluralESingularComoOMesmoTermo() {
        assertThat(detector.pontuacao(comTituloEOutrosTermosDiferentes("ações", "a"), comTituloEOutrosTermosDiferentes("ação", "b")))
                .as("ações e ação").isCloseTo(0.25, within(1e-9));
        assertThat(detector.pontuacao(comTituloEOutrosTermosDiferentes("pedidos", "a"), comTituloEOutrosTermosDiferentes("pedido", "b")))
                .as("pedidos e pedido").isCloseTo(0.25, within(1e-9));
    }

    @Test
    void naoDeveCortarOSDePalavrasCurtasDeTresLetras() {
        // "gás" tem três letras: tirar o "s" deixaria "ga" (duas letras) e o termo sumiria.
        assertThat(detector.pontuacao(comTituloEOutrosTermosDiferentes("gás", "a"), comTituloEOutrosTermosDiferentes("gás", "b")))
                .isCloseTo(0.25, within(1e-9));
    }

    /** Só o título é igual (ou parecido); objetivo, cenário e critérios não têm nenhum termo em comum. */
    private ConteudoDesafio comTituloEOutrosTermosDiferentes(String titulo, String lado) {
        String[] palavras = lado.equals("a")
                ? new String[]{"alfa beta", "gama delta", "epsilon zeta"}
                : new String[]{"iota kappa", "lambda sigma", "omega theta"};
        return conteudo(titulo, palavras[0], palavras[1], List.of(palavras[2]));
    }

    @Test
    void emCasoDeEmpateDeveApontarOPrimeiroTicketParecido() {
        ConteudoDesafio novo = paginacaoDePedidos();

        var parecido = detector.buscarParecido(novo, List.of(paginacaoDePedidos(), paginacaoDePedidos()));

        assertThat(parecido).isPresent();
        assertThat(parecido.get().posicao()).isZero();
    }

    @Test
    void deveApontarOTicketMaisParecidoQuandoHaVarios() {
        ConteudoDesafio novo = paginacaoDePedidos();

        var parecido = detector.buscarParecido(novo, List.of(testesDoServiceDeEstoque(), paginacaoDePedidos()));

        assertThat(parecido).isPresent();
        assertThat(parecido.get().posicao()).isEqualTo(1);
    }
}
