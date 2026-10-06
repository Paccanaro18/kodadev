package com.koda.v1.seguranca;

import com.koda.v1.user.UsuarioResposta;
import com.koda.v1.user.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/seguranca")
public class SegurancaController {

    private final SegurancaService segurancaService;
    private final UsuarioService usuarioService;

    public SegurancaController(SegurancaService segurancaService, UsuarioService usuarioService) {
        this.segurancaService = segurancaService;
        this.usuarioService = usuarioService;
    }

    @GetMapping("/desafios")
    public List<ResumoDeDesafioDeSeguranca> listar(@AuthenticationPrincipal OAuth2User principal) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return segurancaService.listar(usuario.id());
    }

    @GetMapping("/desafios/{slug}")
    public DetalheDeDesafioDeSeguranca detalhar(@AuthenticationPrincipal OAuth2User principal, @PathVariable String slug) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return segurancaService.detalhar(usuario.id(), slug);
    }

    @PostMapping("/desafios/{slug}/flag")
    public ResultadoDaFlag enviar(@AuthenticationPrincipal OAuth2User principal,
                                  @PathVariable String slug,
                                  @RequestBody EnvioDeFlag envio) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return segurancaService.enviar(usuario.id(), slug, envio);
    }

    @GetMapping("/placar")
    public PlacarDeSeguranca placar(@AuthenticationPrincipal OAuth2User principal) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return segurancaService.placar(usuario.id());
    }

    @ExceptionHandler(DesafioDeSegurancaNaoEncontradoException.class)
    ProblemDetail tratar(DesafioDeSegurancaNaoEncontradoException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, excecao.getMessage());
    }

    @ExceptionHandler(FlagInvalidaException.class)
    ProblemDetail tratar(FlagInvalidaException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, excecao.getMessage());
    }

    @ExceptionHandler(TentativasDemaisException.class)
    ProblemDetail tratar(TentativasDemaisException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS, excecao.getMessage());
    }
}
