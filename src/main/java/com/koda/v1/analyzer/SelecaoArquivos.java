package com.koda.v1.analyzer;

import com.koda.v1.analyzer.detector.LimitesAnalise;
import com.koda.v1.analyzer.estrutura.AnalisadorEstrutura;
import com.koda.v1.analyzer.estrutura.ResultadoEstrutura;
import com.koda.v1.github.dto.ItemArvoreResposta;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class SelecaoArquivos {

    static final int MAXIMO_CONTROLLERS = 30;
    static final int MAXIMO_CANDIDATAS_ENTIDADE = 30;

    private static final String TIPO_ARQUIVO = "blob";
    private static final List<String> NOMES_POM = List.of("pom.xml");
    private static final List<String> NOMES_COMPOSE = List.of(
            "docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml");

    private final AnalisadorEstrutura analisadorEstrutura;

    public SelecaoArquivos(AnalisadorEstrutura analisadorEstrutura) {
        this.analisadorEstrutura = analisadorEstrutura;
    }

    public ArquivosSelecionados selecionar(List<ItemArvoreResposta> itens) {
        Map<String, ItemArvoreResposta> arquivos = new LinkedHashMap<>();
        for (ItemArvoreResposta item : itens) {
            if (ehArquivoValido(item)) {
                arquivos.putIfAbsent(item.caminho(), item);
            }
        }

        ResultadoEstrutura estrutura = analisadorEstrutura.analisar(List.copyOf(arquivos.keySet()));

        Escolha pom = escolherNaRaiz(arquivos, NOMES_POM);
        Escolha compose = escolherNaRaiz(arquivos, NOMES_COMPOSE);
        Escolha controllers = escolherVarios(estrutura.controllers(), arquivos, MAXIMO_CONTROLLERS);
        Escolha entidades = escolherVarios(estrutura.entidades(), arquivos, MAXIMO_CANDIDATAS_ENTIDADE);

        boolean limitesAplicados = pom.limitou() || compose.limitou()
                || controllers.limitou() || entidades.limitou();

        return new ArquivosSelecionados(
                estrutura,
                primeiroOuNulo(pom),
                primeiroOuNulo(compose),
                controllers.arquivos(),
                entidades.arquivos(),
                limitesAplicados);
    }

    private boolean ehArquivoValido(ItemArvoreResposta item) {
        return item != null
                && TIPO_ARQUIVO.equals(item.tipo())
                && item.caminho() != null
                && item.sha() != null;
    }

    private boolean cabeNoLimite(ItemArvoreResposta item) {
        return item.tamanho() != null
                && item.tamanho() > 0
                && item.tamanho() <= LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO;
    }

    private Escolha escolherNaRaiz(Map<String, ItemArvoreResposta> arquivos, List<String> nomes) {
        boolean limitou = false;
        for (String nome : nomes) {
            ItemArvoreResposta item = arquivos.get(nome);
            if (item == null) {
                continue;
            }
            if (cabeNoLimite(item)) {
                return new Escolha(List.of(paraAbrir(item)), limitou);
            }
            limitou = true;
        }
        return new Escolha(List.of(), limitou);
    }

    private Escolha escolherVarios(List<String> caminhos,
                                   Map<String, ItemArvoreResposta> arquivos,
                                   int maximo) {
        List<ArquivoParaAbrir> aceitos = caminhos.stream()
                .sorted()
                .map(arquivos::get)
                .filter(this::cabeNoLimite)
                .map(this::paraAbrir)
                .toList();

        boolean limitou = aceitos.size() < caminhos.size() || aceitos.size() > maximo;
        List<ArquivoParaAbrir> escolhidos = aceitos.stream().limit(maximo).toList();
        return new Escolha(escolhidos, limitou);
    }

    private ArquivoParaAbrir paraAbrir(ItemArvoreResposta item) {
        return new ArquivoParaAbrir(item.caminho(), item.sha());
    }

    private ArquivoParaAbrir primeiroOuNulo(Escolha escolha) {
        return escolha.arquivos().isEmpty() ? null : escolha.arquivos().get(0);
    }

    private record Escolha(List<ArquivoParaAbrir> arquivos, boolean limitou) {
    }
}
