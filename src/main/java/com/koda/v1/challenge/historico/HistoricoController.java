package com.koda.v1.challenge.historico;

import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.persistence.StatusProgresso;
import com.koda.v1.user.UsuarioResposta;
import com.koda.v1.user.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class HistoricoController {

    private final HistoricoService historicoService;
    private final UsuarioService usuarioService;

    public HistoricoController(HistoricoService historicoService, UsuarioService usuarioService) {
        this.historicoService = historicoService;
        this.usuarioService = usuarioService;
    }

    @GetMapping("/historico")
    public PaginaHistorico historico(@AuthenticationPrincipal OAuth2User principal,
                                     @RequestParam(required = false) StatusProgresso status,
                                     @RequestParam(required = false) TipoDesafio tipo,
                                     @RequestParam(required = false) UUID analiseId,
                                     @RequestParam(required = false) Integer pagina,
                                     @RequestParam(required = false) Integer tamanho) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return historicoService.listar(usuario.id(), status, tipo, analiseId, pagina, tamanho);
    }

    @GetMapping("/progresso")
    public ResumoProgresso progresso(@AuthenticationPrincipal OAuth2User principal) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return historicoService.resumir(usuario.id());
    }

    @ExceptionHandler(ParametroDeHistoricoInvalidoException.class)
    ProblemDetail tratar(ParametroDeHistoricoInvalidoException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, excecao.getMessage());
    }
}
