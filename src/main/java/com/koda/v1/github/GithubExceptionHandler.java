package com.koda.v1.github;

import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.koda.v1.github")
class GithubExceptionHandler {

    @ExceptionHandler(GithubApiException.class)
    ProblemDetail tratar(GithubApiException excecao) {
        return ProblemDetail.forStatusAndDetail(excecao.getStatus(), excecao.getMessage());
    }
}
