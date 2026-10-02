package com.koda.v1.analyzer.ecossistema.python;

import com.koda.v1.analyzer.ecossistema.ConvencaoDeNomes;
import com.koda.v1.analyzer.ecossistema.NomesEmPascal;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public final class ConvencaoPython implements ConvencaoDeNomes {

    public static final ConvencaoPython INSTANCIA = new ConvencaoPython();

    private static final Set<String> PASTAS_IGNORADAS = Set.of(
            "venv", ".venv", "env", "site-packages", "__pycache__", "migrations", "node_modules", "build", "dist",
            ".git", ".tox");
    private static final Set<String> PASTAS_DE_TESTE = Set.of("tests", "test", "__tests__");
    private static final Set<String> ARQUIVOS_DE_INFRA = Set.of(
            "__init__.py", "conftest.py", "setup.py", "manage.py", "wsgi.py", "asgi.py", "__main__.py");

    private ConvencaoPython() {
    }

    public static boolean ehTeste(String caminho) {
        String arquivo = arquivoDe(caminho);
        return arquivo.startsWith("test_") || arquivo.endsWith("_test.py") || estaEmPasta(caminho, PASTAS_DE_TESTE);
    }

    /** Aceita também a classe de dentro de um arquivo ("arquivo.py#Classe"). */
    public static boolean ehCodigo(String caminho) {
        String arquivo = semClasse(caminho);
        return arquivo.endsWith(".py")
                && !ARQUIVOS_DE_INFRA.contains(arquivoDe(arquivo))
                && !estaEmPasta(arquivo, PASTAS_IGNORADAS);
    }

    @Override
    public boolean ehDto(String caminho) {
        return caminho.contains("#") && PapelNoPython.de(semClasse(caminho)) == PapelNoPython.SCHEMA;
    }

    @Override
    public boolean ehExcecao(String caminho) {
        return caminho.contains("#") && PapelNoPython.de(semClasse(caminho)) == PapelNoPython.EXCECAO;
    }

    public static String semClasse(String caminho) {
        int marca = caminho.indexOf('#');
        return marca < 0 ? caminho : caminho.substring(0, marca);
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

    /** Uma classe dentro de um arquivo é escrita como "arquivo.py#Classe"; o nome é a classe. */
    @Override
    public String nome(String caminho) {
        int marca = caminho.indexOf('#');
        if (marca >= 0) {
            return caminho.substring(marca + 1);
        }
        String arquivo = arquivoDe(caminho);
        String semExtensao = arquivo.endsWith(".py") ? arquivo.substring(0, arquivo.length() - 3) : arquivo;
        boolean teste = false;
        if (semExtensao.startsWith("test_")) {
            semExtensao = semExtensao.substring("test_".length());
            teste = true;
        } else if (semExtensao.endsWith("_test")) {
            semExtensao = semExtensao.substring(0, semExtensao.length() - "_test".length());
            teste = true;
        }
        return NomesEmPascal.de(semExtensao) + (teste ? "Test" : "");
    }

    private static String arquivoDe(String caminho) {
        return caminho.substring(caminho.lastIndexOf('/') + 1);
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
