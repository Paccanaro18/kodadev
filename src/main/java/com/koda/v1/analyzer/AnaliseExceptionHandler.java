package com.koda.v1.analyzer;

import com.koda.v1.analyzer.persistence.AnaliseEmAndamentoException;
import com.koda.v1.analyzer.persistence.AnaliseNaoEncontradaException;
import com.koda.v1.github.GithubApiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.koda.v1.analyzer")
class AnaliseExceptionHandler {

    @ExceptionHandler(AnaliseNaoEncontradaException.class)
    ProblemDetail tratar(AnaliseNaoEncontradaException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Análise não encontrada.");
    }

    @ExceptionHandler(AnaliseEmAndamentoException.class)
    ProblemDetail tratar(AnaliseEmAndamentoException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, excecao.getMessage());
    }

    @ExceptionHandler(FilaDeAnaliseCheiaException.class)
    ProblemDetail tratar(FilaDeAnaliseCheiaException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS, excecao.getMessage());
    }

    @ExceptionHandler(RepositorioNaoAnalisavelException.class)
    ProblemDetail tratar(RepositorioNaoAnalisavelException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_CONTENT, excecao.getMessage());
    }

    @ExceptionHandler(GithubApiException.class)
    ProblemDetail tratar(GithubApiException excecao) {
        return ProblemDetail.forStatusAndDetail(excecao.getStatus(), excecao.getMessage());
    }
}
