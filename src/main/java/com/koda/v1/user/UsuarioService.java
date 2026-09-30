package com.koda.v1.user;

import com.koda.v1.user.repository.UsuarioRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }
    @Transactional
    public UsuarioResposta registrarOuAtualizar(DadosUsuarioGithub dados) {
        Usuario usuario = usuarioRepository.findByGithubId(dados.githubId())
                .map(existente -> {
                    existente.atualizarPerfil(dados.login(), dados.nome(), dados.avatarUrl());
                    return existente;
                })
                .orElseGet(() -> usuarioRepository.save(
                        new Usuario(dados.githubId(), dados.login(), dados.nome(), dados.avatarUrl())));

        return UsuarioResposta.de(usuario);
    }

    public UsuarioResposta buscarDaSessao(OAuth2User principal) {
        Number githubId = principal.getAttribute("id");
        return buscarPorGithubId(githubId.longValue());
    }

    @Transactional(readOnly = true)
    public UsuarioResposta buscarPorGithubId(Long githubId) {
        return usuarioRepository.findByGithubId(githubId)
                .map(UsuarioResposta::de)
                .orElseThrow(() -> new IllegalStateException(
                        "Usuário não encontrado para o github_id " + githubId));
    }

}
