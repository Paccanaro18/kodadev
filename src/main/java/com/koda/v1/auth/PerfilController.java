package com.koda.v1.auth;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PerfilController {

    @GetMapping("/eu")
    public PerfilResposta eu(@AuthenticationPrincipal OAuth2User principal) {
        return new PerfilResposta(
                principal.getAttribute("login"),
                principal.getAttribute("name"),
                principal.getAttribute("avatar_url"));
    }
}