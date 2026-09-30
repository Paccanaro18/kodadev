package com.koda.v1.challenge.api;

import com.koda.v1.user.UsuarioResposta;
import com.koda.v1.user.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class DesafioController {

    private final DesafioService desafioService;
    private final UsuarioService usuarioService;

    public DesafioController(DesafioService desafioService, UsuarioService usuarioService) {
        this.desafioService = desafioService;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/analises/{analiseId}/desafios")
    public ResponseEntity<DesafioResposta> iniciar(@AuthenticationPrincipal OAuth2User principal,
                                                   @PathVariable UUID analiseId,
                                                   @Valid @RequestBody NovoDesafioRequisicao requisicao) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        DesafioResposta resposta = desafioService.iniciar(usuario.id(), analiseId, requisicao.tipo());

        return ResponseEntity.accepted()
                .location(URI.create("/api/desafios/" + resposta.id()))
                .body(resposta);
    }

    @GetMapping("/analises/{analiseId}/desafios")
    public List<DesafioResumoResposta> listar(@AuthenticationPrincipal OAuth2User principal,
                                              @PathVariable UUID analiseId) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return desafioService.listar(usuario.id(), analiseId);
    }

    @GetMapping("/desafios")
    public DesafiosRecentesResposta recentes(@AuthenticationPrincipal OAuth2User principal) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return desafioService.recentes(usuario.id());
    }

    @GetMapping("/desafios/{id}")
    public DesafioDetalheResposta consultar(@AuthenticationPrincipal OAuth2User principal,
                                            @PathVariable UUID id) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return desafioService.consultar(usuario.id(), id);
    }
}
