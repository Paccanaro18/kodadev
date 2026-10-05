package com.koda.v1.estudo;

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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/estudo")
public class EstudoController {

    private final EstudoService estudoService;
    private final UsuarioService usuarioService;

    public EstudoController(EstudoService estudoService, UsuarioService usuarioService) {
        this.estudoService = estudoService;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public EstadoDeEstudo consultar(@AuthenticationPrincipal OAuth2User principal) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return estudoService.consultar(usuario.id());
    }

    @PutMapping("/{trilha}/{item}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void registrar(@AuthenticationPrincipal OAuth2User principal,
                          @PathVariable String trilha,
                          @PathVariable String item,
                          @RequestBody AtualizacaoDeEstudo atualizacao) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        estudoService.registrar(usuario.id(), trilha, item, atualizacao);
    }

    @PostMapping("/importacao")
    public EstadoDeEstudo importar(@AuthenticationPrincipal OAuth2User principal,
                                   @RequestBody EstadoDeEstudo estado) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return estudoService.importar(usuario.id(), estado);
    }

    @ExceptionHandler(DadosDeEstudoInvalidosException.class)
    ProblemDetail tratar(DadosDeEstudoInvalidosException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, excecao.getMessage());
    }

    @ExceptionHandler(LimiteDeEstudoExcedidoException.class)
    ProblemDetail tratar(LimiteDeEstudoExcedidoException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, excecao.getMessage());
    }
}
