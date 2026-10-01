package com.koda.v1.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationTrustResolver;
import org.springframework.security.authentication.AuthenticationTrustResolverImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.access.AccessDeniedHandlerImpl;

import java.io.IOException;

/**
 * Quem não tem sessão e é barrado (por exemplo, um POST sem o token CSRF) recebe 401, como nas consultas: ele precisa
 * entrar. Quem tem sessão e é barrado recebe 403: está logado, mas a requisição não é permitida (por exemplo, sem CSRF).
 */
public class NegacaoDeAcesso implements AccessDeniedHandler {

    private final AuthenticationTrustResolver confianca = new AuthenticationTrustResolverImpl();
    private final AccessDeniedHandler proibido = new AccessDeniedHandlerImpl();

    @Override
    public void handle(HttpServletRequest requisicao, HttpServletResponse resposta,
                       org.springframework.security.access.AccessDeniedException negado) throws IOException, jakarta.servlet.ServletException {
        Authentication autenticacao = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacao == null || confianca.isAnonymous(autenticacao)) {
            resposta.setStatus(HttpStatus.UNAUTHORIZED.value());
            return;
        }
        proibido.handle(requisicao, resposta, negado);
    }
}
