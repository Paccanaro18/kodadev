package com.koda.v1.analyzer.ecossistema;

import com.koda.v1.analyzer.ecossistema.java.ConvencaoJava;
import com.koda.v1.analyzer.ecossistema.node.ConvencaoNode;
import com.koda.v1.analyzer.ecossistema.python.ConvencaoPython;

import java.util.List;

/** Como cada linguagem nomeia seus arquivos e como o contexto os enxerga como componentes. */
public interface ConvencaoDeNomes {

    static ConvencaoDeNomes de(Linguagem linguagem) {
        return switch (linguagem) {
            case JAVA -> ConvencaoJava.INSTANCIA;
            case TYPESCRIPT, JAVASCRIPT -> ConvencaoNode.INSTANCIA;
            case PYTHON -> ConvencaoPython.INSTANCIA;
        };
    }

    /** Os arquivos de código de produção (sem testes), com o caminho relativo à raiz de código. */
    List<String> arquivosDeFonte(List<String> caminhosDaArvore);

    /** O nome do componente que o arquivo representa. Em arquivo de teste, termina com "Test". */
    String nome(String caminho);
}
