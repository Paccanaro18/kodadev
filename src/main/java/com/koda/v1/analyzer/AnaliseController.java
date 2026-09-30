package com.koda.v1.analyzer;

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
import java.util.UUID;

@RestController
@RequestMapping("/api/analises")
public class AnaliseController {

    private final AnaliseService analiseService;
    private final UsuarioService usuarioService;

    public AnaliseController(AnaliseService analiseService, UsuarioService usuarioService) {
        this.analiseService = analiseService;
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<AnaliseResposta> iniciar(@AuthenticationPrincipal OAuth2User principal,
                                                   @Valid @RequestBody NovaAnaliseRequisicao requisicao) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        AnaliseResposta resposta = analiseService.iniciar(
                usuario.id(), usuario.login(), requisicao.dono(), requisicao.nome());

        return ResponseEntity.accepted()
                .location(URI.create("/api/analises/" + resposta.id()))
                .body(resposta);
    }

    @GetMapping("/{id}")
    public AnaliseDetalheResposta consultar(@AuthenticationPrincipal OAuth2User principal,
                                            @PathVariable UUID id) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return analiseService.consultar(usuario.id(), id);
    }
}
