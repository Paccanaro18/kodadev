package com.koda.v1.analyzer.ecossistema;

import com.koda.v1.analyzer.ResultadoAnalise;
import com.koda.v1.analyzer.contexto.ContextoProjeto;

public record ProdutoDaAnalise(ResultadoAnalise resultado, ContextoProjeto contexto) {
}
