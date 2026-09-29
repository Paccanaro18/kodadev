package com.koda.v1.github;

import com.koda.v1.github.dto.ArquivoResposta;
import com.koda.v1.github.dto.ArvoreResposta;
import com.koda.v1.github.dto.RepositorioResposta;
import com.koda.v1.user.UsuarioService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/repositorios")
public class GithubController {

    private final GithubService githubService;
    private final UsuarioService usuarioService;

    public GithubController(GithubService githubService, UsuarioService usuarioService) {
        this.githubService = githubService;
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public List<RepositorioResposta> listar(@AuthenticationPrincipal OAuth2User principal) {
        return githubService.listarRepositorios(usuarioIdDe(principal));
    }

    @GetMapping("/{dono}/{repositorio}/arvore")
    public ArvoreResposta arvore(@AuthenticationPrincipal OAuth2User principal,
                                 @PathVariable String dono,
                                 @PathVariable String repositorio) {
        return githubService.buscarArvore(usuarioIdDe(principal), dono, repositorio);
    }

    @GetMapping("/{dono}/{repositorio}/blobs/{sha}")
    public ArquivoResposta arquivo(@AuthenticationPrincipal OAuth2User principal,
                                   @PathVariable String dono,
                                   @PathVariable String repositorio,
                                   @PathVariable String sha) {
        return githubService.lerArquivo(usuarioIdDe(principal), dono, repositorio, sha);
    }

    private UUID usuarioIdDe(OAuth2User principal) {
        Number githubId = principal.getAttribute("id");
        return usuarioService.buscarPorGithubId(githubId.longValue()).id();
    }
}