package com.koda.v1.analyzer;

import com.koda.v1.user.UsuarioResposta;
import com.koda.v1.user.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
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

    @GetMapping
    public List<AnaliseResumoResposta> listar(@AuthenticationPrincipal OAuth2User principal) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return analiseService.listar(usuario.id());
    }

    @DeleteMapping("/{id}/repositorio")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void arquivarRepositorio(@AuthenticationPrincipal OAuth2User principal, @PathVariable UUID id) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        analiseService.arquivarRepositorio(usuario.id(), id);
    }

    @GetMapping("/{id}")
    public AnaliseDetalheResposta consultar(@AuthenticationPrincipal OAuth2User principal,
                                            @PathVariable UUID id) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return analiseService.consultar(usuario.id(), id);
    }
}
