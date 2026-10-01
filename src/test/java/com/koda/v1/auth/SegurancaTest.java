package com.koda.v1.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SegurancaTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private Environment ambiente;

    @Test
    void deveDevolverCabecalhosDeSegurancaNaApi() throws Exception {
        mockMvc.perform(get("/api/eu"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().exists("Permissions-Policy"))
                .andExpect(header().string("Cache-Control", containsString("no-store")));
    }

    @Test
    void deveDevolver401ParaQuemNaoTemSessaoEBarrarPostSemSessao() throws Exception {
        mockMvc.perform(post("/api/analises").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/logout")).andExpect(status().isUnauthorized());
    }

    @Test
    void deveDevolver403ParaQuemTemSessaoMasNaoEnviaOTokenCsrf() throws Exception {
        mockMvc.perform(post("/api/analises").session(sessao()).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveExporSoOHealthDoActuatorSemLogin() throws Exception {
        mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
        mockMvc.perform(get("/actuator/env")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/actuator/beans")).andExpect(status().isUnauthorized());
        assertThat(ambiente.getProperty("management.endpoints.web.exposure.include", "health")).isEqualTo("health");
    }

    @Test
    void deveConfigurarOCookieDeSessaoComHttpOnlyESameSiteLax() {
        assertThat(ambiente.getProperty("server.servlet.session.cookie.http-only")).isEqualTo("true");
        assertThat(ambiente.getProperty("server.servlet.session.cookie.same-site")).isEqualTo("lax");
        assertThat(ambiente.getProperty("server.servlet.session.cookie.name")).isEqualTo("KODA_SESSAO");
    }

    @Test
    void deveEscutarSoNaPropriaMaquinaPorPadrao() {
        assertThat(ambiente.getProperty("server.address")).isEqualTo("127.0.0.1");
    }

    private MockHttpSession sessao() {
        DefaultOAuth2User principal = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("ROLE_USER")), Map.of("id", 1L, "login", "artur"), "login");
        OAuth2AuthenticationToken autenticacao = new OAuth2AuthenticationToken(
                principal, principal.getAuthorities(), "github");
        MockHttpSession nova = new MockHttpSession();
        nova.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                new SecurityContextImpl(autenticacao));
        return nova;
    }
}
