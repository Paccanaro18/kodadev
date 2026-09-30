package com.koda.v1.challenge.dica;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackageClasses = DicaController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class DicaExceptionHandler {

    @ExceptionHandler({DicaIndisponivelException.class, LimiteDeDicasDoDesafioException.class})
    ProblemDetail tratarConflito(RuntimeException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, excecao.getMessage());
    }

    @ExceptionHandler(LimiteDiarioDeDicasExcedidoException.class)
    ProblemDetail tratarLimite(LimiteDiarioDeDicasExcedidoException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS, excecao.getMessage());
    }

    @ExceptionHandler(DicaNaoGeradaException.class)
    ProblemDetail tratarFalha(DicaNaoGeradaException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, excecao.getMessage());
    }
}
