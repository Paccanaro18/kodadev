package com.koda.v1.plano;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class PlanoExceptionHandler {

    @ExceptionHandler(CotaMensalExcedidaException.class)
    ProblemDetail tratar(CotaMensalExcedidaException excecao) {
        return limite(excecao, "COTA_MENSAL");
    }

    @ExceptionHandler(LimiteDeRepositoriosExcedidoException.class)
    ProblemDetail tratar(LimiteDeRepositoriosExcedidoException excecao) {
        return limite(excecao, "LIMITE_DE_REPOSITORIOS");
    }

    private ProblemDetail limite(RuntimeException excecao, String codigo) {
        ProblemDetail problema = ProblemDetail.forStatusAndDetail(HttpStatus.PAYMENT_REQUIRED, excecao.getMessage());
        problema.setProperty("codigo", codigo);
        return problema;
    }
}
