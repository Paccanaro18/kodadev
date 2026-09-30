package com.koda.v1.challenge.api;

import com.koda.v1.analyzer.persistence.AnaliseNaoEncontradaException;
import com.koda.v1.challenge.DesafiosEsgotadosException;
import com.koda.v1.challenge.SemAnguloAplicavelException;
import com.koda.v1.challenge.geracao.ContextoIndisponivelException;
import com.koda.v1.challenge.geracao.FilaDeDesafiosCheiaException;
import com.koda.v1.challenge.persistence.DesafioNaoEncontradoException;
import com.koda.v1.challenge.persistence.GeracaoEmAndamentoException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.koda.v1.challenge")
class DesafioExceptionHandler {

    @ExceptionHandler(AnaliseNaoEncontradaException.class)
    ProblemDetail tratar(AnaliseNaoEncontradaException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Análise não encontrada.");
    }

    @ExceptionHandler(DesafioNaoEncontradoException.class)
    ProblemDetail tratar(DesafioNaoEncontradoException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "Desafio não encontrado.");
    }

    @ExceptionHandler({GeracaoEmAndamentoException.class, ContextoIndisponivelException.class})
    ProblemDetail tratarConflito(RuntimeException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, excecao.getMessage());
    }

    @ExceptionHandler({SemAnguloAplicavelException.class, DesafiosEsgotadosException.class})
    ProblemDetail tratarSemOpcao(RuntimeException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_CONTENT, excecao.getMessage());
    }

    @ExceptionHandler({LimiteDiarioExcedidoException.class, FilaDeDesafiosCheiaException.class})
    ProblemDetail tratarLimite(RuntimeException excecao) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.TOO_MANY_REQUESTS, excecao.getMessage());
    }
}
