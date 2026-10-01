package com.koda.v1.challenge.notificacao;

import com.koda.v1.user.UsuarioResposta;
import com.koda.v1.user.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {

    private final ConsultaNotificacoes consulta;
    private final UsuarioService usuarioService;

    public NotificacaoController(ConsultaNotificacoes consulta, UsuarioService usuarioService) {
        this.consulta = consulta;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public NotificacoesResposta listar(@AuthenticationPrincipal OAuth2User principal) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return consulta.listar(usuario.id());
    }

    @PostMapping("/lidas")
    public ResponseEntity<Void> marcarTodasComoLidas(@AuthenticationPrincipal OAuth2User principal) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);
        consulta.marcarTodasComoLidas(usuario.id());

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/lida")
    public ResponseEntity<Void> marcarComoLida(@AuthenticationPrincipal OAuth2User principal, @PathVariable UUID id) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);
        consulta.marcarComoLida(usuario.id(), id);

        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(NotificacaoNaoEncontradaException.class)
    ProblemDetail tratar(NotificacaoNaoEncontradaException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, excecao.getMessage());
    }
}
