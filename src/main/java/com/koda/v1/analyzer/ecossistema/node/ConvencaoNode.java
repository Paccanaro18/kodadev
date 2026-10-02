package com.koda.v1.analyzer.ecossistema.node;

import com.koda.v1.analyzer.ecossistema.ConvencaoDeNomes;
import com.koda.v1.analyzer.ecossistema.NomesEmPascal;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

public final class ConvencaoNode implements ConvencaoDeNomes {

    public static final ConvencaoNode INSTANCIA = new ConvencaoNode();

    private static final Pattern ARQUIVO_DE_CODIGO = Pattern.compile(".*\\.(?:ts|tsx|js|jsx|mjs|cjs)");
    private static final Pattern ARQUIVO_DE_TESTE = Pattern.compile(".*\\.(?:test|spec)\\.(?:ts|tsx|js|jsx|mjs|cjs)");
    private static final Set<String> PASTAS_IGNORADAS = Set.of(
            "node_modules", "dist", "build", ".next", "coverage", "out", ".git", "vendor", "public");
    private static final Set<String> PASTAS_DE_TESTE = Set.of("__tests__", "test", "tests", "e2e", "__mocks__");

    private ConvencaoNode() {
    }

    public static boolean ehTeste(String caminho) {
        return ARQUIVO_DE_TESTE.matcher(caminho).matches() || estaEmPasta(caminho, PASTAS_DE_TESTE);
    }

    public static boolean ehCodigo(String caminho) {
        return ARQUIVO_DE_CODIGO.matcher(caminho).matches()
                && !caminho.endsWith(".d.ts")
                && !estaEmPasta(caminho, PASTAS_IGNORADAS);
    }

    @Override
    public List<String> arquivosDeFonte(List<String> caminhosDaArvore) {
        List<String> arquivos = new ArrayList<>();
        for (String caminho : caminhosDaArvore) {
            if (ehCodigo(caminho) && !ehTeste(caminho)) {
                arquivos.add(caminho);
            }
        }
        return arquivos;
    }

    @Override
    public String nome(String caminho) {
        String arquivo = caminho.substring(caminho.lastIndexOf('/') + 1);
        int ponto = arquivo.lastIndexOf('.');
        String semExtensao = ponto < 0 ? arquivo : arquivo.substring(0, ponto);
        boolean teste = false;
        if (semExtensao.endsWith(".test") || semExtensao.endsWith(".spec")) {
            semExtensao = semExtensao.substring(0, semExtensao.lastIndexOf('.'));
            teste = true;
        }
        if (semExtensao.equals("index")) {
            semExtensao = pastaPai(caminho) + "-index";
        }
        return NomesEmPascal.de(semExtensao) + (teste ? "Test" : "");
    }

    private static String pastaPai(String caminho) {
        String[] partes = caminho.split("/");
        return partes.length >= 2 ? partes[partes.length - 2] : "";
    }

    private static boolean estaEmPasta(String caminho, Set<String> pastas) {
        String[] partes = caminho.split("/");
        for (int i = 0; i < partes.length - 1; i++) {
            if (pastas.contains(partes[i])) {
                return true;
            }
        }
        return false;
    }
}
