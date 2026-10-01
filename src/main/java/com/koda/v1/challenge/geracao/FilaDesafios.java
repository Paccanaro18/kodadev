package com.koda.v1.challenge.geracao;

import com.koda.v1.shared.FilaLimitada;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Fila da geração de tickets: uma thread por padrão e no máximo 5 pedidos esperando. */
@Component
public class FilaDesafios extends FilaLimitada {

    public FilaDesafios(@Value("${koda.desafio.threads:1}") int threads,
                        @Value("${koda.desafio.capacidade-fila:5}") int capacidadeFila) {
        super(threads, capacidadeFila, "geracao-de-desafio", FilaDeDesafiosCheiaException::new);
    }
}
