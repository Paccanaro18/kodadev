package com.koda.v1.challenge;

import com.koda.v1.analyzer.contexto.Arquitetura;
import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.EndpointContexto;
import com.koda.v1.analyzer.contexto.InfraContexto;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.analyzer.contexto.TestesContexto;
import com.koda.v1.challenge.persistence.RegistroDesafio;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
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
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Base dos testes de API com banco real, provedor de IA falso e um usuário já logado. */
@SpringBootTest(properties = "koda.ia.provedor=falso")
@AutoConfigureMockMvc
@Transactional
public abstract class TesteDeApiComSessao {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected JdbcTemplate jdbc;

    @Autowired
    protected RegistroDesafio registro;

    @Autowired
    protected SerializadorContexto serializadorContexto;

    @Autowired
    protected SerializadorConteudo serializadorConteudo;

    @Autowired
    protected EntityManager entityManager;

    protected final JsonMapper leitor = JsonMapper.builder().build();

    protected long githubId;
    protected UUID usuarioId;
    protected MockHttpSession sessao;

    @BeforeEach
    void prepararUsuario() {
        githubId = ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE - 1);
        usuarioId = criarUsuario(githubId, "artur");
        sessao = sessaoDe(githubId, "artur");
    }

    protected String token(MockHttpSession daSessao) throws Exception {
        String json = mockMvc.perform(get("/api/csrf").session(daSessao))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return leitor.readTree(json).get("token").asString();
    }

    protected UUID criarUsuario(long id, String login) {
        return jdbc.queryForObject("INSERT INTO usuarios (github_id, login) VALUES (?, ?) RETURNING id",
                UUID.class, id, login);
    }

    protected UUID criarAnalise(UUID usuario, String nomeDoRepositorio) {
        UUID repositorio = jdbc.queryForObject(
                "INSERT INTO repositorios (usuario_id, github_id_repositorio, dono, nome, branch_padrao) "
                        + "VALUES (?, ?, 'artur', ?, 'main') RETURNING id",
                UUID.class, usuario, ThreadLocalRandom.current().nextLong(1, Long.MAX_VALUE), nomeDoRepositorio);
        return jdbc.queryForObject(
                "INSERT INTO analises_projeto (repositorio_id, status, resultado, contexto, versao_esquema_contexto) "
                        + "VALUES (?, 'CONCLUIDA', '{}'::jsonb, ?::jsonb, 1) RETURNING id",
                UUID.class, repositorio, serializadorContexto.paraJson(contexto()));
    }

    protected MockHttpSession sessaoDe(long id, String login) {
        DefaultOAuth2User principal = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")), Map.of("id", id, "login", login), "login");
        OAuth2AuthenticationToken autenticacao = new OAuth2AuthenticationToken(
                principal, principal.getAuthorities(), "github");
        MockHttpSession nova = new MockHttpSession();
        nova.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                new SecurityContextImpl(autenticacao));
        return nova;
    }

    protected ConteudoDesafio conteudo(String sufixo, List<String> habilidades) {
        return new ConteudoDesafio("Título " + sufixo, "Contexto " + sufixo + ".", "Cenário " + sufixo + ".",
                "Objetivo " + sufixo + ".", List.of("R1", "R2"), List.of("Q1", "Q2"), List.of("C1", "C2"),
                List.of("T1"), List.of("X1"), habilidades);
    }

    protected ContextoProjeto contexto() {
        return new ContextoProjeto(
                1, "21", "4.1.1", "maven", Arquitetura.EM_CAMADAS, List.of("Pedido"), List.of(), List.of("pedidos"),
                List.of(new EndpointContexto("GET", "/pedidos", "PedidoController")),
                new ComponentesContexto(List.of("PedidoController"), List.of("PedidoService"),
                        List.of("PedidoRepository"), List.of("Pedido"), List.of(), List.of(), false),
                new TestesContexto(0, List.of("PedidoService"), List.of("PedidoController")),
                new InfraContexto(false, false), false, false, 0);
    }
}
