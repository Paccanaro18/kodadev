package com.koda.v1.github;

import org.springframework.http.HttpStatus;

public class GithubApiException extends RuntimeException {

    private final HttpStatus status;

    public GithubApiException(HttpStatus status, String mensagem) {
        super(mensagem);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}