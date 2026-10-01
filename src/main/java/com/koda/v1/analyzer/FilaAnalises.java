package com.koda.v1.analyzer;

import com.koda.v1.shared.FilaLimitada;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Fila da análise de repositórios: duas threads por padrão e no máximo 10 pedidos esperando. */
@Component
public class FilaAnalises extends FilaLimitada {

    public FilaAnalises(@Value("${koda.analise.threads:2}") int threads,
                        @Value("${koda.analise.capacidade-fila:10}") int capacidadeFila) {
        super(threads, capacidadeFila, "analise-repositorio", FilaDeAnaliseCheiaException::new);
    }
}
