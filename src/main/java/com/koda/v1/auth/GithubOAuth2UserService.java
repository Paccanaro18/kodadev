package com.koda.v1.auth;

import com.koda.v1.github.ConexaoGithubService;
import com.koda.v1.user.DadosUsuarioGithub;
import com.koda.v1.user.UsuarioResposta;
import com.koda.v1.user.UsuarioService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class GithubOAuth2UserService extends DefaultOAuth2UserService {

    private final UsuarioService usuarioService;
    private final ConexaoGithubService conexaoGithubService;

    public GithubOAuth2UserService(UsuarioService usuarioService,
                                   ConexaoGithubService conexaoGithubService) {
        this.usuarioService = usuarioService;
        this.conexaoGithubService = conexaoGithubService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest requisicao) throws OAuth2AuthenticationException {
        OAuth2User usuarioGithub = super.loadUser(requisicao);

        Number githubId = usuarioGithub.getAttribute("id");
        String login = usuarioGithub.getAttribute("login");
        String nome = usuarioGithub.getAttribute("name");
        String avatarUrl = usuarioGithub.getAttribute("avatar_url");

        UsuarioResposta usuario = usuarioService.registrarOuAtualizar(
                new DadosUsuarioGithub(githubId.longValue(), login, nome, avatarUrl));

        OAuth2AccessToken token = requisicao.getAccessToken();
        conexaoGithubService.salvarOuAtualizar(
                usuario.id(), token.getTokenValue(), token.getScopes());

        return usuarioGithub;
    }
}
