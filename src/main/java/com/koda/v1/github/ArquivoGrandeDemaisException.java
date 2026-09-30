package com.koda.v1.github;

import org.springframework.http.HttpStatus;

public class ArquivoGrandeDemaisException extends GithubApiException {

    public ArquivoGrandeDemaisException() {
        super(HttpStatus.CONTENT_TOO_LARGE, "O arquivo é maior que o limite permitido.");
    }
}
