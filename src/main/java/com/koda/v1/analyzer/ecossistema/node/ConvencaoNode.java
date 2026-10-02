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
    private static final int MAXIMO_PASTAS_NO_NOME = 3;
    private static final Set<String> PASTAS_FORA_DO_NOME = Set.of("src", "app", "pages");
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

    /** Uma entidade dentro de um arquivo (ex.: um model do Prisma) é escrita como "arquivo#Nome". */
    @Override
    public String nome(String caminho) {
        int marca = caminho.indexOf('#');
        if (marca >= 0) {
            return caminho.substring(marca + 1);
        }
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
        } else if (semExtensao.equals("route") || semExtensao.equals("page")) {
            semExtensao = ultimasPastas(caminho, MAXIMO_PASTAS_NO_NOME) + "-" + semExtensao;
        }
        return NomesEmPascal.de(semExtensao) + (teste ? "Test" : "");
    }

    private static String ultimasPastas(String caminho, int maximo) {
        String[] partes = caminho.split("/");
        List<String> pastas = new ArrayList<>();
        for (int i = partes.length - 2; i >= 0 && pastas.size() < maximo; i--) {
            if (!PASTAS_FORA_DO_NOME.contains(partes[i])) {
                pastas.add(0, partes[i]);
            }
        }
        return String.join("-", pastas);
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
