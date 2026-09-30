package com.koda.v1.challenge.catalogo;

import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.EndpointContexto;
import com.koda.v1.analyzer.contexto.RecursoDoCaminho;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.ArrayList;

final class RegrasDeAlvo {

    private static final String QUALQUER = "QUALQUER";

    private RegrasDeAlvo() {
    }

    static RegraDeAlvo classes(Function<ContextoProjeto, List<String>> origem) {
        return contexto -> origem.apply(contexto).stream()
                .distinct()
                .sorted()
                .map(nome -> new AlvoDesafio(EscopoAlvo.CLASSE, nome, null))
                .toList();
    }

    static RegraDeAlvo endpoints(Predicate<EndpointContexto> filtro) {
        return contexto -> contexto.endpoints().stream()
                .filter(filtro)
                .map(endpoint -> new AlvoDesafio(
                        EscopoAlvo.ENDPOINT, endpoint.metodoHttp() + " " + endpoint.caminho(), endpoint.controller()))
                .distinct()
                .sorted(Comparator.comparing(AlvoDesafio::nome))
                .toList();
    }

    static RegraDeAlvo recursosSemOperacao(String verbo, boolean noItem) {
        return contexto -> recursos(contexto).entrySet().stream()
                .filter(recurso -> recurso.getValue().stream().noneMatch(ep -> cobre(ep, verbo, noItem)))
                .map(recurso -> alvoDeRecurso(recurso.getKey(), recurso.getValue()))
                .toList();
    }

    static RegraDeAlvo recursosComOperacao(String verbo, boolean noItem) {
        return contexto -> recursos(contexto).entrySet().stream()
                .filter(recurso -> recurso.getValue().stream().anyMatch(ep -> cobre(ep, verbo, noItem)))
                .map(recurso -> alvoDeRecurso(recurso.getKey(), recurso.getValue()))
                .toList();
    }

    static RegraDeAlvo projeto(String nome) {
        return contexto -> List.of(new AlvoDesafio(EscopoAlvo.PROJETO, nome, null));
    }

    static RegraDeAlvo seTem(Predicate<ContextoProjeto> condicao, RegraDeAlvo regra) {
        return contexto -> condicao.test(contexto) ? regra.alvos(contexto) : List.of();
    }

    static Predicate<EndpointContexto> metodo(String... metodos) {
        Set<String> aceitos = Set.of(metodos);
        return endpoint -> aceitos.contains(endpoint.metodoHttp());
    }

    static boolean colecao(EndpointContexto endpoint) {
        return !endpoint.caminho().contains("{");
    }

    static boolean item(EndpointContexto endpoint) {
        return endpoint.caminho().contains("{");
    }

    private static boolean cobre(EndpointContexto endpoint, String verbo, boolean noItem) {
        boolean mesmoMetodo = endpoint.metodoHttp().equals(verbo) || endpoint.metodoHttp().equals(QUALQUER);
        return mesmoMetodo && item(endpoint) == noItem;
    }

    private static Map<String, List<EndpointContexto>> recursos(ContextoProjeto contexto) {
        Map<String, List<EndpointContexto>> porRecurso = new TreeMap<>();
        for (EndpointContexto endpoint : contexto.endpoints()) {
            RecursoDoCaminho.de(endpoint.caminho())
                    .ifPresent(recurso -> porRecurso.computeIfAbsent(recurso, chave -> new ArrayList<>()).add(endpoint));
        }
        return porRecurso;
    }

    private static AlvoDesafio alvoDeRecurso(String recurso, List<EndpointContexto> endpoints) {
        return new AlvoDesafio(EscopoAlvo.RECURSO, recurso, endpoints.get(0).controller());
    }
}
