package com.koda.v1.user;

import java.util.UUID;

public record UsuarioResposta(UUID id, String login, String nome, String avatarUrl) {

    static UsuarioResposta de(Usuario usuario) {
        return new UsuarioResposta(
                usuario.getID(),
                usuario.getLogin(),
                usuario.getNome(),
                usuario.getAvatarUrl());
    }
}
