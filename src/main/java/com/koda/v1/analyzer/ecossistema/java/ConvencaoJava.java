package com.koda.v1.analyzer.ecossistema.java;

import com.koda.v1.analyzer.ecossistema.ConvencaoDeNomes;

import java.util.ArrayList;
import java.util.List;

public final class ConvencaoJava implements ConvencaoDeNomes {

    public static final ConvencaoJava INSTANCIA = new ConvencaoJava();

    private static final String PREFIXO_MAIN = "src/main/java/";
    private static final String EXTENSAO = ".java";

    private ConvencaoJava() {
    }

    @Override
    public List<String> arquivosDeFonte(List<String> caminhosDaArvore) {
        List<String> arquivos = new ArrayList<>();
        for (String caminho : caminhosDaArvore) {
            int posicao = caminho.indexOf(PREFIXO_MAIN);
            if (posicao >= 0 && caminho.endsWith(EXTENSAO)) {
                arquivos.add(caminho.substring(posicao + PREFIXO_MAIN.length()));
            }
        }
        return arquivos;
    }

    @Override
    public String nome(String caminho) {
        String arquivo = caminho.substring(caminho.lastIndexOf('/') + 1);
        return arquivo.endsWith(EXTENSAO) ? arquivo.substring(0, arquivo.length() - EXTENSAO.length()) : arquivo;
    }
}
