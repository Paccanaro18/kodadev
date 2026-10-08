package com.koda.v1.plano;

import com.koda.v1.user.UsuarioResposta;
import com.koda.v1.user.UsuarioService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/plano")
public class PlanoController {

    private final SituacaoDoPlanoService situacaoService;
    private final UsuarioService usuarioService;

    public PlanoController(SituacaoDoPlanoService situacaoService, UsuarioService usuarioService) {
        this.situacaoService = situacaoService;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public SituacaoDoPlano consultar(@AuthenticationPrincipal OAuth2User principal) {
        UsuarioResposta usuario = usuarioService.buscarDaSessao(principal);

        return situacaoService.situacaoDe(usuario.id());
    }
}
