package com.koda.v1.challenge.api;

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
import com.koda.v1.challenge.geracao.FilaDeDesafiosCheiaException;
import com.koda.v1.challenge.geracao.IniciadorDesafio;
import com.koda.v1.challenge.persistence.Desafio;
import com.koda.v1.challenge.persistence.DesafioRepository;
import com.koda.v1.challenge.persistence.RegistroDesafio;
import com.koda.v1.challenge.persistence.StatusGeracao;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"koda.ia.provedor=falso", "koda.desafio.limite-diario=3"})
@AutoConfigureMockMvc
@Transactional
class DesafioControllerTest {

    private static final String CORPO_FEATURE = "{\"tipo\":\"FEATURE\"}";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private DesafioRepository repository;

    @Autowired
    private RegistroDesafio registro;

    @Autowired
    private SerializadorContexto serializadorContexto;

    @Autowired
    private SerializadorConteudo serializadorConteudo;

    @Autowired
    private EntityManager entityManager;

    @MockitoBean
    private IniciadorDesafio iniciador;

    private final JsonMapper leitor = JsonMapper.builder().build();

    private long githubIdDoUsuario;
    private UUID usuarioId;
    private UUID analiseId;
    private MockHttpSession sessao;

    @BeforeEach
    void preparar() {
        githubIdDoUsuario = ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE);
        usuarioId = criarUsuario(githubIdDoUsuario, "artur");
        analiseId = criarAnalise(usuarioId, contextoRico(), "CONCLUIDA");
        sessao = sessaoDe(githubIdDoUsuario, "artur");
    }

    @Test
    void deveDevolver401NasConsultasSemSessaoEBloquearOPostSemSessao() throws Exception {
        mockMvc.perform(get("/api/desafios/" + UUID.randomUUID())).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/analises/" + analiseId + "/desafios")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/desafios")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/analises/" + analiseId + "/desafios")
                        .contentType(MediaType.APPLICATION_JSON).content(CORPO_FEATURE))
                .andExpect(status().isForbidden());

        verify(iniciador, never()).disparar(any());
    }

    @Test
    void deveRecusarPostSemTokenCsrf() throws Exception {
        mockMvc.perform(post("/api/analises/" + analiseId + "/desafios").session(sessao)
                        .contentType(MediaType.APPLICATION_JSON).content(CORPO_FEATURE))
                .andExpect(status().isForbidden());

        verify(iniciador, never()).disparar(any());
    }

    @Test
    void deveIniciarODesafioEDevolver202ComLocationEStatusPendente() throws Exception {
        MvcResult resultado = iniciar(analiseId, CORPO_FEATURE)
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.statusGeracao").value("PENDENTE"))
                .andReturn();

        UUID desafioId = UUID.fromString(leitor.readTree(resultado.getResponse().getContentAsString())
                .get("id").asString());
        assertThat(resultado.getResponse().getHeader("Location")).isEqualTo("/api/desafios/" + desafioId);
        Desafio gravado = repository.findById(desafioId).orElseThrow();
        assertThat(gravado.getStatusGeracao()).isEqualTo(StatusGeracao.PENDENTE);
        assertThat(gravado.getTipo()).isEqualTo(TipoDesafio.FEATURE);
        assertThat(gravado.getUsuarioId()).isEqualTo(usuarioId);
        assertThat(gravado.getAnaliseId()).isEqualTo(analiseId);
        assertThat(gravado.getNumero()).isEqualTo(1);
        verify(iniciador).disparar(desafioId);
    }

    @Test
    void deveAceitarOPedidoAleatorio() throws Exception {
        iniciar(analiseId, "{\"tipo\":\"ALEATORIO\"}").andExpect(status().isAccepted());

        assertThat(repository.findByUsuarioIdAndAnaliseIdOrderByNumeroDesc(usuarioId, analiseId)).hasSize(1);
    }

    @Test
    void deveRecusarCorpoInvalido() throws Exception {
        iniciar(analiseId, "{\"tipo\":\"REFACTOR\"}").andExpect(status().isBadRequest());
        iniciar(analiseId, "{\"tipo\":null}").andExpect(status().isBadRequest());
        iniciar(analiseId, "{}").andExpect(status().isBadRequest());
        iniciar(analiseId, "isso não é json").andExpect(status().isBadRequest());

        verify(iniciador, never()).disparar(any());
    }

    @Test
    void deveDevolver404ParaAnaliseDeOutroUsuarioOuInexistente() throws Exception {
        long outroGithubId = githubIdDoUsuario == Long.MAX_VALUE ? 1 : githubIdDoUsuario + 1;
        UUID outro = criarUsuario(outroGithubId, "outro");
        UUID analiseDoOutro = criarAnalise(outro, contextoRico(), "CONCLUIDA");

        iniciar(analiseDoOutro, CORPO_FEATURE)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Análise não encontrada."));
        iniciar(UUID.randomUUID(), CORPO_FEATURE).andExpect(status().isNotFound());

        verify(iniciador, never()).disparar(any());
    }

    @Test
    void deveDevolver409QuandoAAnaliseAindaNaoTerminou() throws Exception {
        UUID emAndamento = criarAnalise(usuarioId, null, "EM_ANDAMENTO");

        iniciar(emAndamento, CORPO_FEATURE)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("A análise deste repositório ainda não tem contexto para gerar desafios."));
    }

    @Test
    void deveDevolver409EnquantoHouverUmaGeracaoEmAberto() throws Exception {
        iniciar(analiseId, CORPO_FEATURE).andExpect(status().isAccepted());

        iniciar(analiseId, "{\"tipo\":\"BUG\"}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Já existe um desafio sendo gerado para você. Aguarde ele terminar."));
    }

    @Test
    void deveDevolver429QuandoACotaDiariaAcabar() throws Exception {
        for (int i = 0; i < 3; i++) {
            criarPronto(analiseId, "ANGULO_" + i, "CLASSE:" + i, "Título " + i);
        }

        iniciar(analiseId, CORPO_FEATURE)
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.detail").value(containsString("3 desafios")));
        verify(iniciador, never()).disparar(any());
    }

    @Test
    void deveDevolver422QuandoNaoHaNadaAplicavelParaOTipoPedido() throws Exception {
        UUID semFeature = criarAnalise(usuarioId, contextoComUmaUnicaOpcaoDeTesting(), "CONCLUIDA");

        iniciar(semFeature, CORPO_FEATURE)
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.detail").value("Este projeto não tem nada aplicável para esse tipo de desafio."));
    }

    @Test
    void deveDevolver422QuandoOsDesafiosDoTipoEsgotaram() throws Exception {
        UUID unica = criarAnalise(usuarioId, contextoComUmaUnicaOpcaoDeTesting(), "CONCLUIDA");
        MvcResult primeiro = iniciar(unica, "{\"tipo\":\"TESTING\"}").andExpect(status().isAccepted()).andReturn();
        UUID desafioId = UUID.fromString(leitor.readTree(primeiro.getResponse().getContentAsString()).get("id").asString());
        registro.iniciar(desafioId);
        registro.concluir(desafioId, "Testes do cliente", serializadorConteudo.paraJson(conteudo("Testes do cliente")), 1, null);
        entityManager.flush();

        iniciar(unica, "{\"tipo\":\"TESTING\"}")
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.detail").value(containsString("já praticou tudo")));
    }

    @Test
    void deveDevolver429EMarcarComoFalhadoQuandoAFilaEstiverCheia() throws Exception {
        doThrow(new FilaDeDesafiosCheiaException()).when(iniciador).disparar(any());

        iniciar(analiseId, CORPO_FEATURE).andExpect(status().isTooManyRequests());
        entityManager.flush();

        Desafio gravado = repository.findByUsuarioIdAndAnaliseIdOrderByNumeroDesc(usuarioId, analiseId).get(0);
        assertThat(gravado.getStatusGeracao()).isEqualTo(StatusGeracao.FALHOU);
    }

    @Test
    void deveConsultarODesafioProntoDoProprioUsuarioComOConteudoEOCodigo() throws Exception {
        UUID desafioId = criarPronto(analiseId, "FEATURE_PAGINACAO", "ENDPOINT:GET /pedidos", "Adicionar paginação");

        mockMvc.perform(get("/api/desafios/" + desafioId).session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(desafioId.toString()))
                .andExpect(jsonPath("$.analiseId").value(analiseId.toString()))
                .andExpect(jsonPath("$.codigo").value("DEV-001"))
                .andExpect(jsonPath("$.tipo").value("FEATURE"))
                .andExpect(jsonPath("$.nivel").value("JUNIOR"))
                .andExpect(jsonPath("$.statusGeracao").value("PRONTO"))
                .andExpect(jsonPath("$.titulo").value("Adicionar paginação"))
                .andExpect(jsonPath("$.conteudo.objetivo").value("Objetivo de Adicionar paginação."))
                .andExpect(jsonPath("$.conteudo.criteriosDeAceite.length()").value(2))
                .andExpect(jsonPath("$.modelo").doesNotExist())
                .andExpect(jsonPath("$.conteudoJson").doesNotExist());
    }

    @Test
    void deveListarOsRecentesDoUsuarioComHabilidadesETotalSemMostrarOsDeOutraPessoa() throws Exception {
        criarPronto(analiseId, "FEATURE_PAGINACAO", "ENDPOINT:GET /pedidos", "Adicionar paginação");
        registro.registrarNovo(usuarioId, analiseId, TipoDesafio.BUG, "BUG_NULO_EM_CAMPO_OPCIONAL", "x", "perspectiva");
        entityManager.flush();
        long outroGithubId = githubIdDoUsuario == Long.MAX_VALUE ? 1 : githubIdDoUsuario + 1;
        UUID outroUsuario = criarUsuario(outroGithubId, "outra");
        UUID outraAnalise = criarAnalise(outroUsuario, contextoRico(), "CONCLUIDA");
        UUID outroDesafio = registro.registrarNovo(
                outroUsuario, outraAnalise, TipoDesafio.FEATURE, "FEATURE_PAGINACAO", "y", "perspectiva");
        entityManager.flush();

        String corpo = mockMvc.perform(get("/api/desafios").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGerados").value(1))
                .andExpect(jsonPath("$.recentes.length()").value(2))
                .andReturn().getResponse().getContentAsString();

        var recentes = leitor.readTree(corpo).get("recentes");
        var ids = new java.util.ArrayList<String>();
        var habilidades = new java.util.ArrayList<String>();
        for (var recente : recentes) {
            ids.add(recente.get("id").asString());
            assertThat(recente.has("conteudoJson")).isFalse();
            recente.get("habilidades").forEach(h -> habilidades.add(h.asString()));
        }
        assertThat(ids).doesNotContain(outroDesafio.toString());
        assertThat(habilidades).containsExactly("H1");
    }

    @Test
    void deveDevolverListaVaziaQuandoOUsuarioAindaNaoGerouNada() throws Exception {
        mockMvc.perform(get("/api/desafios").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGerados").value(0))
                .andExpect(jsonPath("$.recentes.length()").value(0));
    }

    @Test
    void deveConsultarODesafioAindaPendenteSemConteudo() throws Exception {
        MvcResult criado = iniciar(analiseId, CORPO_FEATURE).andExpect(status().isAccepted()).andReturn();
        String id = leitor.readTree(criado.getResponse().getContentAsString()).get("id").asString();

        mockMvc.perform(get("/api/desafios/" + id).session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusGeracao").value("PENDENTE"))
                .andExpect(jsonPath("$.conteudo").doesNotExist())
                .andExpect(jsonPath("$.titulo").doesNotExist());
    }

    @Test
    void naoDeveRevelarODesafioDeOutroUsuario() throws Exception {
        UUID desafioId = criarPronto(analiseId, "FEATURE_PAGINACAO", "ENDPOINT:GET /pedidos", "Privado");
        long outroGithubId = githubIdDoUsuario == Long.MAX_VALUE ? 1 : githubIdDoUsuario + 1;
        criarUsuario(outroGithubId, "intruso");

        mockMvc.perform(get("/api/desafios/" + desafioId).session(sessaoDe(outroGithubId, "intruso")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Desafio não encontrado."));
    }

    @Test
    void deveDevolver404ParaDesafioInexistenteE400ParaIdInvalido() throws Exception {
        mockMvc.perform(get("/api/desafios/" + UUID.randomUUID()).session(sessao)).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/desafios/isso-nao-e-uuid").session(sessao)).andExpect(status().isBadRequest());
    }

    @Test
    void deveListarOsDesafiosDaAnaliseDoMaisNovoParaOMaisAntigo() throws Exception {
        criarPronto(analiseId, "ANGULO_1", "CLASSE:A", "Primeiro");
        criarPronto(analiseId, "ANGULO_2", "CLASSE:B", "Segundo");

        mockMvc.perform(get("/api/analises/" + analiseId + "/desafios").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].codigo").value("DEV-002"))
                .andExpect(jsonPath("$[0].titulo").value("Segundo"))
                .andExpect(jsonPath("$[1].codigo").value("DEV-001"))
                .andExpect(jsonPath("$[0].conteudo").doesNotExist());
    }

    @Test
    void deveDevolver404AoListarDesafiosDeUmaAnaliseDeOutroUsuario() throws Exception {
        long outroGithubId = githubIdDoUsuario == Long.MAX_VALUE ? 1 : githubIdDoUsuario + 1;
        criarUsuario(outroGithubId, "intruso");

        mockMvc.perform(get("/api/analises/" + analiseId + "/desafios").session(sessaoDe(outroGithubId, "intruso")))
                .andExpect(status().isNotFound());
    }

    private ResultActions iniciar(UUID analise, String corpo) throws Exception {
        return mockMvc.perform(post("/api/analises/" + analise + "/desafios").session(sessao)
                .header("X-CSRF-TOKEN", tokenCsrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpo));
    }

    private String tokenCsrf() throws Exception {
        String json = mockMvc.perform(get("/api/csrf").session(sessao))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return leitor.readTree(json).get("token").asString();
    }

    private UUID criarPronto(UUID analise, String angulo, String alvo, String titulo) {
        UUID id = registro.registrarNovo(usuarioId, analise, TipoDesafio.FEATURE, angulo, alvo, "perspectiva");
        registro.iniciar(id);
        registro.concluir(id, titulo, serializadorConteudo.paraJson(conteudo(titulo)), 1, "modelo-secreto");
        entityManager.flush();
        return id;
    }

    private ConteudoDesafio conteudo(String titulo) {
        return new ConteudoDesafio(titulo, "Contexto de " + titulo + ".", "Cenário de " + titulo + ".",
                "Objetivo de " + titulo + ".", List.of("R1", "R2"), List.of("Q1", "Q2"), List.of("C1", "C2"),
                List.of("T1"), List.of("X1"), List.of("H1"));
    }

    private UUID criarAnalise(UUID usuario, ContextoProjeto contexto, String status) {
        UUID repositorio = jdbc.queryForObject(
                "INSERT INTO repositorios (usuario_id, github_id_repositorio, dono, nome, branch_padrao) "
                        + "VALUES (?, ?, 'artur', 'koda', 'main') RETURNING id",
                UUID.class, usuario, ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE));
        if (contexto == null) {
            return jdbc.queryForObject(
                    "INSERT INTO analises_projeto (repositorio_id, status) VALUES (?, ?) RETURNING id",
                    UUID.class, repositorio, status);
        }
        return jdbc.queryForObject(
                "INSERT INTO analises_projeto (repositorio_id, status, resultado, contexto, versao_esquema_contexto) "
                        + "VALUES (?, ?, '{}'::jsonb, ?::jsonb, 1) RETURNING id",
                UUID.class, repositorio, status, serializadorContexto.paraJson(contexto));
    }

    private UUID criarUsuario(long githubId, String login) {
        return jdbc.queryForObject("INSERT INTO usuarios (github_id, login) VALUES (?, ?) RETURNING id",
                UUID.class, githubId, login);
    }

    private MockHttpSession sessaoDe(long githubId, String login) {
        DefaultOAuth2User principal = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")), Map.of("id", githubId, "login", login), "login");
        OAuth2AuthenticationToken autenticacao = new OAuth2AuthenticationToken(
                principal, principal.getAuthorities(), "github");
        MockHttpSession novaSessao = new MockHttpSession();
        novaSessao.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, new SecurityContextImpl(autenticacao));
        return novaSessao;
    }

    private ContextoProjeto contextoRico() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS, List.of("Pedido"), List.of(), List.of("pedidos"),
                List.of(new EndpointContexto("GET", "/pedidos", "PedidoController"),
                        new EndpointContexto("POST", "/pedidos", "PedidoController"),
                        new EndpointContexto("GET", "/pedidos/{id}", "PedidoController"),
                        new EndpointContexto("DELETE", "/pedidos/{id}", "PedidoController")),
                new ComponentesContexto(
                        List.of("PedidoController"), List.of("PedidoService", "ClienteService"),
                        List.of("PedidoRepository"), List.of("Pedido", "Cliente"),
                        List.of("CriarPedidoRequest"), List.of("PedidoNaoEncontradoException"), false),
                new TestesContexto(0, List.of("PedidoService"), List.of("PedidoController")),
                new InfraContexto(false, false), false, false, 0);
    }

    private ContextoProjeto contextoComUmaUnicaOpcaoDeTesting() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.INDEFINIDA, List.of(), List.of(), List.of(), List.of(),
                new ComponentesContexto(List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), false),
                new TestesContexto(0, List.of("ClienteService"), List.of()), new InfraContexto(false, false),
                false, false, 0);
    }
}
