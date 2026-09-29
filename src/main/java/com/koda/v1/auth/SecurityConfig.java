package com.koda.v1.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filtroDeSeguranca(HttpSecurity http,
                                          GithubOAuth2UserService githubUserService) throws Exception {
        http
                .authorizeHttpRequests(regras -> regras
                        .requestMatchers("/actuator/health").permitAll()
                        .anyRequest().authenticated())
                .oauth2Login(login -> login
                        .userInfoEndpoint(info -> info.userService(githubUserService)));

        return http.build();
    }
}
