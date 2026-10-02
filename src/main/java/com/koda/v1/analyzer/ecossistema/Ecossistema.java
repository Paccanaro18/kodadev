package com.koda.v1.analyzer.ecossistema;

import com.koda.v1.github.dto.ArvoreResposta;

import java.util.List;

/**
 * Um ecossistema (linguagem e seu framework) que a Koda sabe analisar. Todos entregam o mesmo
 * {@link ProdutoDaAnalise}, então o restante do sistema não depende da linguagem.
 */
public interface Ecossistema {

    /** Quanto o repositório parece deste ecossistema. Zero significa que não é dele. */
    int peso(List<String> caminhosDeArquivos);

    ProdutoDaAnalise analisar(ArvoreResposta arvore, LeitorDeArquivos leitor);
}
