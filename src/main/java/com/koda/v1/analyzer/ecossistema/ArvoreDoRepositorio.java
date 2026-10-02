package com.koda.v1.analyzer.ecossistema;

import com.koda.v1.analyzer.ArquivoParaAbrir;
import com.koda.v1.analyzer.detector.LimitesAnalise;
import com.koda.v1.github.dto.ItemArvoreResposta;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;

/** Os arquivos da árvore do GitHub, com as escolhas que todo ecossistema precisa fazer. */
public class ArvoreDoRepositorio {

    private static final String TIPO_ARQUIVO = "blob";
    private static final List<String> NOMES_COMPOSE = List.of(
            "docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml");

    private final Map<String, ItemArvoreResposta> arquivos = new LinkedHashMap<>();
    private boolean limitou;

    public ArvoreDoRepositorio(List<ItemArvoreResposta> itens) {
        for (ItemArvoreResposta item : itens) {
            if (item != null && TIPO_ARQUIVO.equals(item.tipo()) && item.caminho() != null && item.sha() != null) {
                arquivos.putIfAbsent(item.caminho(), item);
            }
        }
    }

    public List<String> caminhos() {
        return List.copyOf(arquivos.keySet());
    }

    public boolean temNaRaiz(String nome) {
        return arquivos.containsKey(nome);
    }

    public Optional<ArquivoParaAbrir> naRaiz(String... nomes) {
        for (String nome : nomes) {
            ItemArvoreResposta item = arquivos.get(nome);
            if (item == null) {
                continue;
            }
            if (cabe(item)) {
                return Optional.of(paraAbrir(item));
            }
            limitou = true;
        }
        return Optional.empty();
    }

    public Optional<ArquivoParaAbrir> compose() {
        return naRaiz(NOMES_COMPOSE.toArray(String[]::new));
    }

    /** Os arquivos que cabem no limite de leitura, em ordem estável e até o máximo pedido. */
    public List<ArquivoParaAbrir> escolher(Predicate<String> filtro, int maximo) {
        List<ArquivoParaAbrir> aceitos = arquivos.values().stream()
                .filter(item -> filtro.test(item.caminho()))
                .sorted((a, b) -> a.caminho().compareTo(b.caminho()))
                .filter(this::cabe)
                .map(this::paraAbrir)
                .toList();
        long candidatos = arquivos.keySet().stream().filter(filtro).count();
        if (aceitos.size() < candidatos || aceitos.size() > maximo) {
            limitou = true;
        }
        return aceitos.stream().limit(maximo).toList();
    }

    public boolean limitou() {
        return limitou;
    }

    private boolean cabe(ItemArvoreResposta item) {
        return item.tamanho() != null && item.tamanho() > 0 && item.tamanho() <= LimitesAnalise.MAXIMO_CARACTERES_ARQUIVO;
    }

    private ArquivoParaAbrir paraAbrir(ItemArvoreResposta item) {
        return new ArquivoParaAbrir(item.caminho(), item.sha());
    }
}
