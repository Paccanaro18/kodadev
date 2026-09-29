package com.koda.v1.auth;

import com.koda.v1.user.DadosUsuarioGithub;
import com.koda.v1.user.UsuarioService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class GithubOAuth2UserService extends DefaultOAuth2UserService {

    private final UsuarioService usuarioService;

    public GithubOAuth2UserService(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest requisicao) throws OAuth2AuthenticationException {
        OAuth2User usuarioGithub = super.loadUser(requisicao);

        Number githubId = usuarioGithub.getAttribute("id");
        String login = usuarioGithub.getAttribute("login");
        String nome = usuarioGithub.getAttribute("name");
        String avatarUrl = usuarioGithub.getAttribute("avatar_url");

        usuarioService.registrarOuAtualizar(
                new DadosUsuarioGithub(githubId.longValue(), login, nome, avatarUrl));

        return usuarioGithub;
    }
}
