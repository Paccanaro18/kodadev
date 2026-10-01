package com.koda.v1.auth;

import com.koda.v1.github.ConexaoGithubService;
import com.koda.v1.user.DadosUsuarioGithub;
import com.koda.v1.user.UsuarioResposta;
import com.koda.v1.user.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class GithubOAuth2UserServiceTest {

    private static final String URL_DO_USUARIO = "https://api.github.com/user";

    private UsuarioService usuarios;
    private ConexaoGithubService conexoes;
    private GithubOAuth2UserService servico;
    private MockRestServiceServer github;
    private final UUID usuarioId = UUID.randomUUID();

    @BeforeEach
    void preparar() {
        usuarios = mock(UsuarioService.class);
        conexoes = mock(ConexaoGithubService.class);
        servico = new GithubOAuth2UserService(usuarios, conexoes);
        RestTemplate rest = new RestTemplate();
        github = MockRestServiceServer.bindTo(rest).build();
        servico.setRestOperations(rest);
        when(usuarios.registrarOuAtualizar(any())).thenReturn(new UsuarioResposta(usuarioId, "artur", "Artur", "https://a/1.png"));
    }

    private OAuth2UserRequest requisicao(String token, Set<String> escopos) {
        ClientRegistration registro = ClientRegistration.withRegistrationId("github")
                .clientId("id").clientSecret("segredo")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("http://localhost/login/oauth2/code/github")
                .authorizationUri("https://github.com/login/oauth/authorize")
                .tokenUri("https://github.com/login/oauth/access_token")
                .userInfoUri(URL_DO_USUARIO)
                .userNameAttributeName("login")
                .build();
        OAuth2AccessToken acesso = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER, token, Instant.now(), Instant.now().plusSeconds(3600), escopos);
        return new OAuth2UserRequest(registro, acesso);
    }

    @Test
    void deveRegistrarOUsuarioEGuardarOTokenComOsEscoposDoLogin() {
        github.expect(requestTo(URL_DO_USUARIO))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header("Authorization", "Bearer gho_abc"))
                .andRespond(withSuccess("""
                        {"id": 4242, "login": "artur", "name": "Artur", "avatar_url": "https://a/1.png"}
                        """, MediaType.APPLICATION_JSON));

        OAuth2User principal = servico.loadUser(requisicao("gho_abc", Set.of("read:user")));

        assertThat(principal.<String>getAttribute("login")).isEqualTo("artur");
        ArgumentCaptor<DadosUsuarioGithub> dados = ArgumentCaptor.forClass(DadosUsuarioGithub.class);
        verify(usuarios).registrarOuAtualizar(dados.capture());
        assertThat(dados.getValue()).isEqualTo(new DadosUsuarioGithub(4242L, "artur", "Artur", "https://a/1.png"));
        verify(conexoes).salvarOuAtualizar(eq(usuarioId), eq("gho_abc"), eq(Set.of("read:user")));
        github.verify();
    }

    @Test
    void deveAceitarPerfilSemNomeNemAvatar() {
        github.expect(requestTo(URL_DO_USUARIO))
                .andRespond(withSuccess("{\"id\": 7, \"login\": \"anonimo\"}", MediaType.APPLICATION_JSON));

        servico.loadUser(requisicao("gho_x", Set.of("read:user")));

        ArgumentCaptor<DadosUsuarioGithub> dados = ArgumentCaptor.forClass(DadosUsuarioGithub.class);
        verify(usuarios).registrarOuAtualizar(dados.capture());
        assertThat(dados.getValue().nome()).isNull();
        assertThat(dados.getValue().avatarUrl()).isNull();
    }

    @Test
    void naoDeveRegistrarNadaQuandoOGithubRecusaOToken() {
        github.expect(requestTo(URL_DO_USUARIO)).andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        assertThatThrownBy(() -> servico.loadUser(requisicao("gho_invalido", Set.of("read:user"))))
                .isInstanceOf(OAuth2AuthenticationException.class);

        verify(usuarios, never()).registrarOuAtualizar(any());
        verify(conexoes, never()).salvarOuAtualizar(any(), any(), any());
    }
}
