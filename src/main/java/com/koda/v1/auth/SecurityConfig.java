package com.koda.v1.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
import org.springframework.security.web.util.matcher.RequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filtroDeSeguranca(HttpSecurity http,
                                          GithubOAuth2UserService githubUserService,
                                          @Value("${koda.frontend.url}") String urlFront) throws Exception {
        RequestMatcher rotasDaApi = requisicao -> requisicao.getRequestURI().startsWith("/api/");

        http
                .authorizeHttpRequests(regras -> regras
                        .requestMatchers("/actuator/health").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(erros -> erros
                        .accessDeniedHandler(new NegacaoDeAcesso())
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), rotasDaApi))
                .oauth2Login(login -> login
                        .userInfoEndpoint(info -> info.userService(githubUserService))
                        .defaultSuccessUrl(urlFront + "/dashboard", true)
                        .failureUrl(urlFront + "/?erro=true"))
                .logout(logout -> logout
                        .logoutUrl("/api/logout")
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler()))
                .headers(cabecalhos -> cabecalhos
                        // A API só devolve JSON: nada dela deve ser carregado como página, script ou moldura.
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'none'; frame-ancestors 'none'"))
                        .referrerPolicy(referencia -> referencia.policy(ReferrerPolicy.NO_REFERRER))
                        .permissionsPolicyHeader(permissoes -> permissoes
                                .policy("geolocation=(), camera=(), microphone=(), payment=()")))
                .csrf(csrf -> csrf
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()));

        return http.build();
    }
}