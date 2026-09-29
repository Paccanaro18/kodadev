package com.koda.v1.analyzer.estrutura;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class AnalisadorEstrutura {

    private static final String PREFIXO_MAIN = "src/main/java/";
    private static final String PREFIXO_TESTE = "src/test/java/";
    private static final Set<String> PASTAS_DE_ENTIDADE =
            Set.of("entity", "entities", "model", "models", "domain");
    private static final List<String> SUFIXOS_QUE_NAO_SAO_ENTIDADE =
            List.of("Dto", "Request", "Response", "Exception", "Mapper", "Config");

    public ResultadoEstrutura analisar(List<String> caminhos) {
        List<String> controllers = new ArrayList<>();
        List<String> services = new ArrayList<>();
        List<String> repositories = new ArrayList<>();
        List<String> entidades = new ArrayList<>();
        List<String> testes = new ArrayList<>();
        boolean temCodigoJava = false;

        for (String caminho : caminhos) {
            if (!caminho.endsWith(".java")) {
                continue;
            }

            int posicaoTeste = caminho.indexOf(PREFIXO_TESTE);
            if (posicaoTeste >= 0) {
                if (ehClasseDeTeste(nomeDaClasse(caminho))) {
                    testes.add(caminho);
                }
                continue;
            }

            int posicaoMain = caminho.indexOf(PREFIXO_MAIN);
            if (posicaoMain < 0) {
                continue;
            }
            temCodigoJava = true;

            String nome = nomeDaClasse(caminho);
            String relativo = caminho.substring(posicaoMain + PREFIXO_MAIN.length());

            if (nome.endsWith("Controller")) {
                controllers.add(caminho);
            } else if (nome.endsWith("Service") || nome.endsWith("ServiceImpl")) {
                services.add(caminho);
            } else if (nome.endsWith("Repository")) {
                repositories.add(caminho);
            } else if (estaEmPastaDeEntidade(relativo) && !terminaComAlgumSufixo(nome)) {
                entidades.add(caminho);
            }
        }

        return new ResultadoEstrutura(temCodigoJava, controllers, services, repositories, entidades, testes);
    }

    private String nomeDaClasse(String caminho) {
        String arquivo = caminho.substring(caminho.lastIndexOf('/') + 1);
        return arquivo.substring(0, arquivo.length() - ".java".length());
    }

    private boolean ehClasseDeTeste(String nome) {
        return nome.endsWith("Test") || nome.endsWith("Tests") || nome.endsWith("IT");
    }

    private boolean estaEmPastaDeEntidade(String caminhoRelativo) {
        String[] partes = caminhoRelativo.split("/");
        for (int i = 0; i < partes.length - 1; i++) {
            if (PASTAS_DE_ENTIDADE.contains(partes[i].toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    private boolean terminaComAlgumSufixo(String nome) {
        return SUFIXOS_QUE_NAO_SAO_ENTIDADE.stream().anyMatch(nome::endsWith);
    }
}