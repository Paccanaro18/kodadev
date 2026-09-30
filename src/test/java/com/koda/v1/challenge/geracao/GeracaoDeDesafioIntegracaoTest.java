package com.koda.v1.challenge.geracao;

import com.koda.v1.analyzer.contexto.Arquitetura;
import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.EndpointContexto;
import com.koda.v1.analyzer.contexto.InfraContexto;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.analyzer.contexto.TestesContexto;
import com.koda.v1.challenge.ConteudoDesafio;
import com.koda.v1.challenge.SerializadorConteudo;
import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.persistence.ConsultaDesafio;
import com.koda.v1.challenge.persistence.DesafioDetalhe;
import com.koda.v1.challenge.persistence.DesafioRepository;
import com.koda.v1.challenge.persistence.RegistroDesafio;
import com.koda.v1.challenge.persistence.StatusGeracao;
import com.koda.v1.challenge.prompt.Perspectivas;
import com.koda.v1.challenge.selecao.SelecaoDeDesafio;
import com.koda.v1.challenge.selecao.SeletorDeDesafio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "koda.ia.provedor=falso")
@Transactional
class GeracaoDeDesafioIntegracaoTest {

    @Autowired
    private GeradorDesafio gerador;

    @Autowired
    private SeletorDeDesafio seletor;

    @Autowired
    private Perspectivas perspectivas;

    @Autowired
    private RegistroDesafio registro;

    @Autowired
    private ConsultaDesafio consulta;

    @Autowired
    private DesafioRepository repository;

    @Autowired
    private SerializadorContexto serializadorContexto;

    @Autowired
    private SerializadorConteudo serializadorConteudo;

    @Autowired
    private JdbcTemplate jdbc;

    private UUID usuario;
    private UUID analise;
    private ContextoProjeto contexto;

    @BeforeEach
    void preparar() {
        contexto = contextoRico();
        usuario = jdbc.queryForObject("INSERT INTO usuarios (github_id, login) VALUES (?, ?) RETURNING id",
                UUID.class, ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE), "usuario-teste");
        UUID repositorio = jdbc.queryForObject(
                "INSERT INTO repositorios (usuario_id, github_id_repositorio, dono, nome, branch_padrao) "
                        + "VALUES (?, ?, 'artur', 'koda', 'main') RETURNING id",
                UUID.class, usuario, ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE));
        analise = jdbc.queryForObject(
                "INSERT INTO analises_projeto (repositorio_id, status, resultado, contexto, versao_esquema_contexto) "
                        + "VALUES (?, 'CONCLUIDA', '{}'::jsonb, ?::jsonb, 1) RETURNING id",
                UUID.class, repositorio, serializadorContexto.paraJson(contexto));
    }

    @Test
    void deveGerarUmDesafioDeVerdadeDaSelecaoAteOBanco() {
        UUID id = gerarUm(TipoDesafio.FEATURE);

        DesafioDetalhe detalhe = consulta.buscarDoUsuario(usuario, id);

        assertThat(detalhe.statusGeracao()).isEqualTo(StatusGeracao.PRONTO);
        assertThat(detalhe.numero()).isEqualTo(1);
        assertThat(detalhe.tipo()).isEqualTo(TipoDesafio.FEATURE);
        assertThat(detalhe.titulo()).startsWith("[Simulado]");
        assertThat(detalhe.modelo()).isEqualTo("simulado");
        assertThat(detalhe.mensagemErro()).isNull();
        ConteudoDesafio conteudo = serializadorConteudo.deJson(detalhe.conteudoJson());
        assertThat(conteudo.criteriosDeAceite()).hasSizeGreaterThanOrEqualTo(2);
        assertThat(repository.findById(id).orElseThrow().getTentativas()).isEqualTo(1);
    }

    @Test
    void deveGerarUmaSequenciaLongaSemRepetirAnguloNemCombinacao() {
        int total = 8;
        List<UUID> ids = new ArrayList<>();
        for (int i = 0; i < total; i++) {
            ids.add(gerarUm(TipoDesafio.FEATURE));
        }

        Set<String> angulos = new HashSet<>();
        Set<String> combinacoes = new HashSet<>();
        Set<String> titulos = new HashSet<>();
        for (UUID id : ids) {
            var desafio = repository.findById(id).orElseThrow();
            assertThat(desafio.getStatusGeracao()).isEqualTo(StatusGeracao.PRONTO);
            angulos.add(desafio.getAnguloId());
            combinacoes.add(desafio.getAnguloId() + "|" + desafio.getAlvoChave());
            titulos.add(desafio.getTitulo());
        }

        assertThat(angulos).hasSize(total);
        assertThat(combinacoes).hasSize(total);
        assertThat(titulos).hasSize(total);
        assertThat(ids).extracting(id -> repository.findById(id).orElseThrow().getNumero())
                .containsExactly(1, 2, 3, 4, 5, 6, 7, 8);
    }

    @Test
    void deveAlternarOsTiposNoAleatorioNoFluxoCompleto() {
        List<TipoDesafio> tipos = new ArrayList<>();
        for (int i = 0; i < 9; i++) {
            tipos.add(repository.findById(gerarUm(null)).orElseThrow().getTipo());
        }

        for (int inicio = 0; inicio + 3 <= tipos.size(); inicio += 3) {
            assertThat(new HashSet<>(tipos.subList(inicio, inicio + 3))).as("trio %d", inicio).hasSize(3);
        }
    }

    @Test
    void deveFalharSemContextoEDeixarOUsuarioGerarDepois() {
        jdbc.update("UPDATE analises_projeto SET contexto = NULL, versao_esquema_contexto = NULL WHERE id = ?", analise);
        UUID sem = registro.registrarNovo(usuario, analise, TipoDesafio.FEATURE, "FEATURE_PAGINACAO",
                "ENDPOINT:GET /pedidos", perspectivas.todas().get(0));

        gerador.gerar(sem);

        DesafioDetalhe detalhe = consulta.buscarDoUsuario(usuario, sem);
        assertThat(detalhe.statusGeracao()).isEqualTo(StatusGeracao.FALHOU);
        assertThat(detalhe.mensagemErro()).contains("ainda não tem contexto");
        assertThat(registro.registrarNovo(usuario, analise, TipoDesafio.FEATURE, "FEATURE_ORDENACAO",
                "ENDPOINT:GET /pedidos", perspectivas.todas().get(1))).isNotNull();
    }

    private UUID gerarUm(TipoDesafio tipoPedido) {
        SelecaoDeDesafio selecao = seletor.selecionar(contexto, tipoPedido, consulta.historicoDeUso(usuario, analise));
        String perspectiva = perspectivas.escolher(consulta.perspectivasRecentes(usuario, 10));
        UUID id = registro.registrarNovo(usuario, analise, selecao.tipo(),
                selecao.angulo().id(), selecao.alvo().chave(), perspectiva);
        gerador.gerar(id);
        return id;
    }

    private ContextoProjeto contextoRico() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS, List.of("Cliente", "Pedido"), List.of(),
                List.of("pedidos", "clientes"),
                List.of(new EndpointContexto("GET", "/pedidos", "PedidoController"),
                        new EndpointContexto("GET", "/pedidos/{id}", "PedidoController"),
                        new EndpointContexto("POST", "/pedidos", "PedidoController"),
                        new EndpointContexto("DELETE", "/pedidos/{id}", "PedidoController"),
                        new EndpointContexto("GET", "/clientes", "ClienteController"),
                        new EndpointContexto("POST", "/clientes", "ClienteController")),
                new ComponentesContexto(
                        List.of("PedidoController", "ClienteController"), List.of("PedidoService", "ClienteService"),
                        List.of("PedidoRepository", "ClienteRepository"), List.of("Pedido", "Cliente"),
                        List.of("CriarPedidoRequest", "CriarClienteRequest"), List.of("PedidoNaoEncontradoException"), false),
                new TestesContexto(2, List.of("ClienteService"), List.of("ClienteController")),
                new InfraContexto(false, true), false, false, 0);
    }
}
