package com.koda.v1.analyzer;

import com.koda.v1.analyzer.contexto.Arquitetura;
import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.InfraContexto;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.analyzer.contexto.TestesContexto;
import com.koda.v1.analyzer.persistence.AnaliseProjetoRepository;
import com.koda.v1.analyzer.persistence.RegistroAnalise;
import com.koda.v1.analyzer.persistence.StatusAnalise;
import com.koda.v1.github.GithubApiException;
import com.koda.v1.github.GithubService;
import com.koda.v1.github.dto.RepositorioResposta;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AnaliseControllerTest {

    private static final String CORPO_VALIDO = "{\"dono\":\"artur\",\"nome\":\"koda\"}";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private AnaliseProjetoRepository analiseRepository;

    @Autowired
    private RegistroAnalise registro;

    @Autowired
    private EntityManager entityManager;

    @MockitoBean
    private GithubService github;

    @MockitoBean
    private IniciadorAnalise iniciador;

    private final JsonMapper leitor = JsonMapper.builder().build();

    private long githubIdDoUsuario;
    private UUID usuarioId;
    private MockHttpSession sessao;

    @BeforeEach
    void preparar() {
        githubIdDoUsuario = ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE);
        usuarioId = criarUsuario(githubIdDoUsuario, "artur");
        sessao = sessaoDe(githubIdDoUsuario, "artur");
        when(github.buscarRepositorio(eq(usuarioId), eq("artur"), eq("koda")))
                .thenReturn(repositorio("artur/koda", false));
    }

    @Test
    void deveDevolver401NaConsultaSemSessaoEBloquearOPostSemSessao() throws Exception {
        mockMvc.perform(get("/api/analises/" + UUID.randomUUID()))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/analises"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/analises").contentType(MediaType.APPLICATION_JSON).content(CORPO_VALIDO))
                .andExpect(status().isUnauthorized());

        verify(iniciador, never()).disparar(any());
    }

    @Test
    void deveRecusarPostSemTokenCsrf() throws Exception {
        mockMvc.perform(post("/api/analises").session(sessao)
                        .contentType(MediaType.APPLICATION_JSON).content(CORPO_VALIDO))
                .andExpect(status().isForbidden());

        verify(iniciador, never()).disparar(any());
    }

    @Test
    void deveIniciarAnaliseEDevolver202ComLocationEStatusPendente() throws Exception {
        MvcResult resultado = iniciar(CORPO_VALIDO)
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.status").value("PENDENTE"))
                .andReturn();

        UUID analiseId = UUID.fromString(leitor.readTree(resultado.getResponse().getContentAsString())
                .get("id").asString());
        assertThat(resultado.getResponse().getHeader("Location")).isEqualTo("/api/analises/" + analiseId);
        assertThat(analiseRepository.findById(analiseId).orElseThrow().getStatus())
                .isEqualTo(StatusAnalise.PENDENTE);
        verify(iniciador).disparar(analiseId);
    }

    @Test
    void deveRecusarCorpoInvalido() throws Exception {
        iniciar("{\"dono\":\"artur/../x\",\"nome\":\"koda\"}").andExpect(status().isBadRequest());
        iniciar("{\"dono\":\"artur\",\"nome\":\" \"}").andExpect(status().isBadRequest());
        iniciar("{}").andExpect(status().isBadRequest());

        verify(iniciador, never()).disparar(any());
    }

    @Test
    void deveRecusarRepositorioDeOutraConta() throws Exception {
        when(github.buscarRepositorio(eq(usuarioId), eq("spring-projects"), eq("spring-boot")))
                .thenReturn(repositorio("spring-projects/spring-boot", false));

        iniciar("{\"dono\":\"spring-projects\",\"nome\":\"spring-boot\"}")
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.detail").value("Só é possível analisar repositórios da sua própria conta."));

        verify(iniciador, never()).disparar(any());
    }

    @Test
    void deveDevolver409QuandoJaHouverAnaliseEmAberto() throws Exception {
        iniciar(CORPO_VALIDO).andExpect(status().isAccepted());

        iniciar(CORPO_VALIDO)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Já existe uma análise em andamento para este repositório."));
    }

    @Test
    void deveDevolver429EFalharAAnaliseQuandoAFilaEstiverCheia() throws Exception {
        doThrow(new FilaDeAnaliseCheiaException()).when(iniciador).disparar(any());

        iniciar(CORPO_VALIDO).andExpect(status().isTooManyRequests());
        entityManager.flush();

        Integer falhadas = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM analises_projeto a JOIN repositorios r ON r.id = a.repositorio_id "
                        + "WHERE r.usuario_id = ? AND a.status = 'FALHOU'", Integer.class, usuarioId);
        assertThat(falhadas).isEqualTo(1);
    }

    @Test
    void deveTraduzirErroDoGithubParaOStatusCorreto() throws Exception {
        when(github.buscarRepositorio(eq(usuarioId), eq("artur"), eq("sumiu")))
                .thenThrow(new GithubApiException(HttpStatus.NOT_FOUND, "Recurso não encontrado no GitHub."));

        iniciar("{\"dono\":\"artur\",\"nome\":\"sumiu\"}")
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Recurso não encontrado no GitHub."));
    }

    @Test
    void deveConsultarAAnaliseDoProprioUsuarioComOResultado() throws Exception {
        UUID analiseId = registro.registrarNovaAnalise(usuarioId, 42L, "artur", "koda", "main");
        registro.iniciar(analiseId);
        ResultadoAnalise resultado = new ResultadoAnalise(
                true, true, "21", "4.1.1", List.of(), List.of(), List.of(),
                List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), true);
        registro.concluir(
                analiseId, new SerializadorResultado().paraJson(resultado),
                new SerializadorContexto().paraJson(contextoDeExemplo()), ContextoProjeto.VERSAO_ESQUEMA);

        mockMvc.perform(get("/api/analises/" + analiseId).session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contexto.versaoEsquema").value(2))
                .andExpect(jsonPath("$.contexto.arquitetura").value("EM_CAMADAS"))
                .andExpect(jsonPath("$.contexto.dominios[0]").value("Pedido"))
                .andExpect(jsonPath("$.contexto.testes.servicesSemTeste[0]").value("PedidoService"))
                .andExpect(jsonPath("$.status").value("CONCLUIDA"))
                .andExpect(jsonPath("$.dono").value("artur"))
                .andExpect(jsonPath("$.nome").value("koda"))
                .andExpect(jsonPath("$.resultado.framework").value("Spring Boot"))
                .andExpect(jsonPath("$.resultado.versaoLinguagem").value("21"))
                .andExpect(jsonPath("$.resultado.parcial").value(true));
    }

    @Test
    void deveConsultarAnaliseAntigaSemContextoSemQuebrar() throws Exception {
        UUID analiseId = registro.registrarNovaAnalise(usuarioId, 42L, "artur", "koda", "main");
        registro.iniciar(analiseId);
        jdbcTemplate.update(
                "UPDATE analises_projeto SET status = 'CONCLUIDA', resultado = ?::jsonb WHERE id = ?",
                new SerializadorResultado().paraJson(new ResultadoAnalise(
                        true, true, "17", null, List.of(), List.of(), List.of(),
                        List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), false)),
                analiseId);
        entityManager.clear();

        mockMvc.perform(get("/api/analises/" + analiseId).session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONCLUIDA"))
                .andExpect(jsonPath("$.resultado.versaoLinguagem").value("17"))
                .andExpect(jsonPath("$.contexto").doesNotExist());
    }

    @Test
    void deveConsultarAnalisePendenteSemResultado() throws Exception {
        UUID analiseId = registro.registrarNovaAnalise(usuarioId, 42L, "artur", "koda", "main");

        mockMvc.perform(get("/api/analises/" + analiseId).session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDENTE"))
                .andExpect(jsonPath("$.resultado").doesNotExist())
                .andExpect(jsonPath("$.contexto").doesNotExist());
    }

    @Test
    void deveListarSoAsAnalisesDoProprioUsuario() throws Exception {
        UUID minha = registro.registrarNovaAnalise(usuarioId, 42L, "artur", "koda", "main");
        long outroGithubId = githubIdDoUsuario == Long.MAX_VALUE ? 1 : githubIdDoUsuario + 1;
        UUID outroUsuario = criarUsuario(outroGithubId, "outro");
        registro.registrarNovaAnalise(outroUsuario, 99L, "outro", "segredo", "main");

        mockMvc.perform(get("/api/analises").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(minha.toString()))
                .andExpect(jsonPath("$[0].nome").value("koda"))
                .andExpect(jsonPath("$[0].status").value("PENDENTE"))
                .andExpect(jsonPath("$[0].tecnologias").isEmpty());
    }

    @Test
    void naoDeveRevelarAAnaliseDeOutroUsuario() throws Exception {
        UUID analiseId = registro.registrarNovaAnalise(usuarioId, 42L, "artur", "koda", "main");
        long outroGithubId = githubIdDoUsuario == Long.MAX_VALUE ? 1 : githubIdDoUsuario + 1;
        criarUsuario(outroGithubId, "intruso");
        MockHttpSession sessaoDoOutro = sessaoDe(outroGithubId, "intruso");

        mockMvc.perform(get("/api/analises/" + analiseId).session(sessaoDoOutro))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Análise não encontrada."));
    }

    @Test
    void deveExigirSessaoETokenCsrfParaArquivar() throws Exception {
        UUID analiseId = analiseTerminada(usuarioId);

        mockMvc.perform(delete("/api/analises/" + analiseId + "/repositorio")).andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/analises/" + analiseId + "/repositorio").session(sessao)).andExpect(status().isForbidden());
    }

    @Test
    void deveArquivarORepositorioEDeixarDeListaloMantendoAAnalise() throws Exception {
        UUID analiseId = analiseTerminada(usuarioId);

        arquivar(sessao, analiseId).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/analises").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        mockMvc.perform(get("/api/analises/" + analiseId).session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(analiseId.toString()));
    }

    @Test
    void deveDevolver409AoArquivarComAnaliseEmAberto() throws Exception {
        UUID analiseId = registro.registrarNovaAnalise(usuarioId, 42L, "artur", "koda", "main");

        arquivar(sessao, analiseId).andExpect(status().isConflict());

        mockMvc.perform(get("/api/analises").session(sessao)).andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void naoDeveArquivarRepositorioDeOutraPessoa() throws Exception {
        UUID analiseId = analiseTerminada(usuarioId);
        long outroGithubId = githubIdDoUsuario == Long.MAX_VALUE ? 1 : githubIdDoUsuario + 1;
        criarUsuario(outroGithubId, "intruso");

        arquivar(sessaoDe(outroGithubId, "intruso"), analiseId).andExpect(status().isNotFound());

        mockMvc.perform(get("/api/analises").session(sessao)).andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void deveVoltarAListarORepositorioQuandoForConectadoDeNovo() throws Exception {
        UUID analiseId = analiseTerminada(usuarioId);
        arquivar(sessao, analiseId).andExpect(status().isNoContent());

        iniciar(CORPO_VALIDO).andExpect(status().isAccepted());

        mockMvc.perform(get("/api/analises").session(sessao)).andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void deveDevolver404ParaAnaliseInexistenteE400ParaIdInvalido() throws Exception {
        mockMvc.perform(get("/api/analises/" + UUID.randomUUID()).session(sessao))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/analises/isso-nao-e-uuid").session(sessao))
                .andExpect(status().isBadRequest());
    }

    private ContextoProjeto contextoDeExemplo() {
        return new ContextoProjeto(
                ContextoProjeto.VERSAO_ESQUEMA, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS,
                List.of("Pedido"), List.of(), List.of("pedidos"), List.of(),
                new ComponentesContexto(List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), false),
                new TestesContexto(0, List.of("PedidoService"), List.of()),
                new InfraContexto(false, false), false, false, 0);
    }

    private UUID analiseTerminada(UUID dono) {
        UUID analiseId = registro.registrarNovaAnalise(dono, 42L, "artur", "koda", "main");
        registro.iniciar(analiseId);
        ResultadoAnalise resultado = new ResultadoAnalise(
                true, true, "21", "4.1.1", List.of(), List.of(), List.of(),
                List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), true);
        registro.concluir(analiseId, new SerializadorResultado().paraJson(resultado),
                new SerializadorContexto().paraJson(contextoDeExemplo()), ContextoProjeto.VERSAO_ESQUEMA);
        entityManager.flush();
        return analiseId;
    }

    private ResultActions arquivar(MockHttpSession daSessao, UUID analiseId) throws Exception {
        String json = mockMvc.perform(get("/api/csrf").session(daSessao)).andReturn().getResponse().getContentAsString();
        return mockMvc.perform(delete("/api/analises/" + analiseId + "/repositorio").session(daSessao)
                .header("X-CSRF-TOKEN", leitor.readTree(json).get("token").asString()));
    }

    private ResultActions iniciar(String corpo) throws Exception {
        return mockMvc.perform(post("/api/analises").session(sessao)
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

    private MockHttpSession sessaoDe(long githubId, String login) {
        DefaultOAuth2User principal = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")),
                Map.of("id", githubId, "login", login),
                "login");
        OAuth2AuthenticationToken autenticacao = new OAuth2AuthenticationToken(
                principal, principal.getAuthorities(), "github");
        MockHttpSession novaSessao = new MockHttpSession();
        novaSessao.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                new SecurityContextImpl(autenticacao));
        return novaSessao;
    }

    private UUID criarUsuario(long githubId, String login) {
        return jdbcTemplate.queryForObject(
                "INSERT INTO usuarios (github_id, login) VALUES (?, ?) RETURNING id",
                UUID.class, githubId, login);
    }

    private RepositorioResposta repositorio(String nomeCompleto, boolean privado) {
        String nome = nomeCompleto.substring(nomeCompleto.indexOf('/') + 1);
        return new RepositorioResposta(
                42L, nome, nomeCompleto, null, "Java", "https://github.com/" + nomeCompleto,
                "main", "2026-09-20T10:00:00Z", privado);
    }
}
