package com.koda.v1.challenge.dica;

import com.koda.v1.user.UsuarioResposta;
import com.koda.v1.user.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/desafios/{desafioId}/dicas")
public class DicaController {

    private final DicaService dicaService;
    private final UsuarioService usuarioService;

    public DicaController(DicaService dicaService, UsuarioService usuarioService) {
        this.dicaService = dicaService;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public DicasResposta listar(@AuthenticationPrincipal OAuth2User principal, @PathVariable UUID desafioId) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return dicaService.listar(usuario.id(), desafioId);
    }

    @PostMapping
    public ResponseEntity<DicaResposta> pedir(@AuthenticationPrincipal OAuth2User principal,
                                              @PathVariable UUID desafioId) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return ResponseEntity.status(201).body(dicaService.pedir(usuario.id(), desafioId));
    }
}
