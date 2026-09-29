package com.koda.v1.user;

import com.koda.v1.user.repository.UsuarioRepository;
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
}
