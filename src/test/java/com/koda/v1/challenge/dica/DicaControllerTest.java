package com.koda.v1.challenge.dica;

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
import com.koda.v1.challenge.persistence.EventoDesafio;
import com.koda.v1.challenge.persistence.EventoDesafioRepository;
import com.koda.v1.challenge.persistence.RegistroDesafio;
import com.koda.v1.challenge.persistence.RegistroProgresso;
import com.koda.v1.challenge.persistence.StatusProgresso;
import com.koda.v1.challenge.persistence.TipoEvento;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"koda.ia.provedor=falso", "koda.dica.limite-diario=4"})
@AutoConfigureMockMvc
@Transactional
class DicaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private RegistroDesafio registro;

    @Autowired
    private RegistroProgresso progresso;

    @Autowired
    private EventoDesafioRepository eventos;

    @Autowired
    private DicaRepository dicas;

    @Autowired
    private SerializadorContexto serializadorContexto;

    @Autowired
    private SerializadorConteudo serializadorConteudo;

    @Autowired
    private EntityManager entityManager;

    private final JsonMapper leitor = JsonMapper.builder().build();

    private long githubId;
    private UUID usuarioId;
    private UUID analiseId;
    private MockHttpSession sessao;

    @BeforeEach
    void preparar() {
        githubId = ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE - 1);
        usuarioId = criarUsuario(githubId, "artur");
        analiseId = criarAnalise(usuarioId);
        sessao = sessaoDe(githubId, "artur");
    }

    @Test
    void deveExigirSessaoEToken() throws Exception {
        UUID desafio = criarEmAndamento("A");

        mockMvc.perform(get("/api/desafios/" + desafio + "/dicas")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/desafios/" + desafio + "/dicas")).andExpect(status().isForbidden());
        mockMvc.perform(post("/api/desafios/" + desafio + "/dicas").session(sessao)).andExpect(status().isForbidden());
        assertThat(dicas.findByDesafioIdOrderByNivelAsc(desafio)).isEmpty();
    }

    @Test
    void deveGerarTresDicasEmNiveisCrescentesRegistrandoEventoECota() throws Exception {
        UUID desafio = criarEmAndamento("A");

        for (int nivel = 1; nivel <= 3; nivel++) {
            pedir(sessao, desafio)
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.nivel").value(nivel))
                    .andExpect(jsonPath("$.texto").isNotEmpty());
        }
        pedir(sessao, desafio).andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Você já usou todas as dicas deste desafio."));

        mockMvc.perform(get("/api/desafios/" + desafio + "/dicas").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dicas.length()").value(3))
                .andExpect(jsonPath("$.dicas[0].nivel").value(1))
                .andExpect(jsonPath("$.dicas[2].nivel").value(3))
                .andExpect(jsonPath("$.maximoPorDesafio").value(3))
                .andExpect(jsonPath("$.usadasHoje").value(3))
                .andExpect(jsonPath("$.limiteDiario").value(4))
                .andExpect(jsonPath("$.dicas[0].modelo").doesNotExist());
        entityManager.flush();
        assertThat(eventos.findByDesafioIdOrderByCriadoEmAsc(desafio)).extracting(EventoDesafio::getTipo)
                .filteredOn(tipo -> tipo == TipoEvento.DICA_USADA).hasSize(3);
    }

    @Test
    void deveSoDarDicaEmTicketEmAndamento() throws Exception {
        UUID naoIniciado = criarPronto("B");
        UUID concluido = criarEmAndamento("C");
        progresso.mudar(usuarioId, concluido, StatusProgresso.CONCLUIDO);
        entityManager.flush();

        pedir(sessao, naoIniciado).andExpect(status().isConflict());
        pedir(sessao, concluido).andExpect(status().isConflict());
        assertThat(dicas.findByDesafioIdOrderByNivelAsc(naoIniciado)).isEmpty();
        assertThat(dicas.findByDesafioIdOrderByNivelAsc(concluido)).isEmpty();
    }

    @Test
    void deveRecusarQuandoACotaDiariaDeDicasAcaba() throws Exception {
        UUID primeiro = criarEmAndamento("A");
        for (int i = 0; i < 3; i++) {
            pedir(sessao, primeiro).andExpect(status().isCreated());
        }
        UUID segundo = criarEmAndamento("D");

        pedir(sessao, segundo).andExpect(status().isCreated());
        pedir(sessao, segundo).andExpect(status().isTooManyRequests());
    }

    @Test
    void deveTratarTicketDeOutraPessoaComoInexistente() throws Exception {
        UUID desafio = criarEmAndamento("A");
        long outroGithubId = githubId + 1;
        criarUsuario(outroGithubId, "intruso");
        MockHttpSession intruso = sessaoDe(outroGithubId, "intruso");

        pedir(intruso, desafio).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/desafios/" + desafio + "/dicas").session(intruso)).andExpect(status().isNotFound());
        pedir(sessao, UUID.randomUUID()).andExpect(status().isNotFound());
        assertThat(dicas.findByDesafioIdOrderByNivelAsc(desafio)).isEmpty();
    }

    @Test
    void deveBarrarNoBancoDuasDicasDoMesmoNivel() {
        UUID desafio = criarEmAndamento("A");
        dicas.saveAndFlush(new Dica(usuarioId, desafio, 1, "primeira", "m"));

        org.assertj.core.api.Assertions.assertThatThrownBy(
                        () -> dicas.saveAndFlush(new Dica(usuarioId, desafio, 1, "repetida", "m")))
                .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    }

    private ResultActions pedir(MockHttpSession daSessao, UUID desafio) throws Exception {
        return mockMvc.perform(post("/api/desafios/" + desafio + "/dicas").session(daSessao)
                .header("X-CSRF-TOKEN", token(daSessao)));
    }

    private String token(MockHttpSession daSessao) throws Exception {
        String json = mockMvc.perform(get("/api/csrf").session(daSessao))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return leitor.readTree(json).get("token").asString();
    }

    private UUID criarPronto(String sufixo) {
        UUID id = registro.registrarNovo(usuarioId, analiseId, TipoDesafio.FEATURE, "FEATURE_" + sufixo,
                "CLASSE:" + sufixo, "p");
        registro.iniciar(id);
        registro.concluir(id, "Título " + sufixo, serializadorConteudo.paraJson(conteudo(sufixo)), 1, "m");
        entityManager.flush();
        return id;
    }

    private UUID criarEmAndamento(String sufixo) {
        UUID id = criarPronto(sufixo);
        progresso.mudar(usuarioId, id, StatusProgresso.EM_ANDAMENTO);
        entityManager.flush();
        return id;
    }

    private ConteudoDesafio conteudo(String sufixo) {
        return new ConteudoDesafio("Título " + sufixo, "Contexto " + sufixo + ".", "Cenário " + sufixo + ".",
                "Objetivo " + sufixo + ".", List.of("R1", "R2"), List.of("Q1", "Q2"), List.of("C1", "C2"),
                List.of("T1"), List.of("X1"), List.of("H1"));
    }

    private UUID criarAnalise(UUID usuario) {
        UUID repositorio = jdbc.queryForObject(
                "INSERT INTO repositorios (usuario_id, github_id_repositorio, dono, nome, branch_padrao) "
                        + "VALUES (?, ?, 'artur', 'koda', 'main') RETURNING id",
                UUID.class, usuario, ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE));
        return jdbc.queryForObject(
                "INSERT INTO analises_projeto (repositorio_id, status, resultado, contexto, versao_esquema_contexto) "
                        + "VALUES (?, 'CONCLUIDA', '{}'::jsonb, ?::jsonb, 1) RETURNING id",
                UUID.class, repositorio, serializadorContexto.paraJson(contexto()));
    }

    private UUID criarUsuario(long id, String login) {
        return jdbc.queryForObject("INSERT INTO usuarios (github_id, login) VALUES (?, ?) RETURNING id",
                UUID.class, id, login);
    }

    private MockHttpSession sessaoDe(long id, String login) {
        DefaultOAuth2User principal = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")), Map.of("id", id, "login", login), "login");
        OAuth2AuthenticationToken autenticacao = new OAuth2AuthenticationToken(
                principal, principal.getAuthorities(), "github");
        MockHttpSession nova = new MockHttpSession();
        nova.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                new SecurityContextImpl(autenticacao));
        return nova;
    }

    private ContextoProjeto contexto() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS, List.of("Pedido"), List.of(), List.of("pedidos"),
                List.of(new EndpointContexto("GET", "/pedidos", "PedidoController")),
                new ComponentesContexto(List.of("PedidoController"), List.of("PedidoService"),
                        List.of("PedidoRepository"), List.of("Pedido"), List.of(), List.of(), false),
                new TestesContexto(0, List.of("PedidoService"), List.of("PedidoController")),
                new InfraContexto(false, false), false, false, 0);
    }
}
