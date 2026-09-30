package com.koda.v1.challenge.similaridade;

import com.koda.v1.challenge.ConteudoDesafio;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class DetectorSimilaridade {

    static final double PESO_TITULO = 0.25;
    static final double PESO_OBJETIVO = 0.30;
    static final double PESO_CENARIO = 0.20;
    static final double PESO_CRITERIOS = 0.25;

    private static final int TAMANHO_MINIMO_DO_TERMO = 3;
    private static final Pattern ACENTOS = Pattern.compile("\\p{M}+");
    private static final Pattern SEPARADORES = Pattern.compile("[^a-z0-9]+");
    private static final Set<String> TERMOS_SEM_VALOR = Set.of(
            "uma", "uns", "umas", "dos", "das", "nos", "nas", "aos", "com", "sem", "que", "por", "para", "como",
            "mais", "mas", "seu", "sua", "seus", "suas", "ser", "ter", "deve", "devem", "pode", "podem", "este",
            "esta", "essa", "esse", "isso", "isto", "nao", "sobre", "entre", "quando", "onde", "cada", "tambem",
            "todo", "toda", "todos", "todas", "apenas", "sao", "foi", "estao", "tem", "ate", "ainda", "mesmo",
            "seja", "sera", "entao", "depois", "antes", "hoje");

    private final double limite;

    public DetectorSimilaridade(@Value("${koda.desafio.similaridade-maxima:0.70}") double limite) {
        if (Double.isNaN(limite) || limite <= 0 || limite > 1) {
            throw new IllegalArgumentException("O limite de similaridade deve estar entre 0 (exclusivo) e 1");
        }
        this.limite = limite;
    }

    public double pontuacao(ConteudoDesafio a, ConteudoDesafio b) {
        return PESO_TITULO * jaccard(termos(a.titulo()), termos(b.titulo()))
                + PESO_OBJETIVO * jaccard(termos(a.objetivo()), termos(b.objetivo()))
                + PESO_CENARIO * jaccard(termos(a.cenarioAtual()), termos(b.cenarioAtual()))
                + PESO_CRITERIOS * jaccard(termos(a.criteriosDeAceite()), termos(b.criteriosDeAceite()));
    }

    public Optional<Parecido> buscarParecido(ConteudoDesafio novo, List<ConteudoDesafio> anteriores) {
        Parecido maisParecido = null;
        for (int i = 0; i < anteriores.size(); i++) {
            double pontuacao = pontuacao(novo, anteriores.get(i));
            if (pontuacao >= limite && (maisParecido == null || pontuacao > maisParecido.pontuacao())) {
                maisParecido = new Parecido(i, pontuacao);
            }
        }
        return Optional.ofNullable(maisParecido);
    }

    public double limite() {
        return limite;
    }

    private Set<String> termos(List<String> textos) {
        Set<String> termos = new HashSet<>();
        textos.forEach(texto -> termos.addAll(termos(texto)));
        return termos;
    }

    private Set<String> termos(String texto) {
        String semAcentos = ACENTOS.matcher(Normalizer.normalize(texto, Normalizer.Form.NFD)).replaceAll("");
        Set<String> termos = new HashSet<>();
        for (String bruto : SEPARADORES.split(semAcentos.toLowerCase(Locale.ROOT))) {
            String termo = singularizar(bruto);
            if (termo.length() >= TAMANHO_MINIMO_DO_TERMO && !TERMOS_SEM_VALOR.contains(termo)) {
                termos.add(termo);
            }
        }
        return termos;
    }

    private String singularizar(String termo) {
        if (termo.endsWith("coes")) {
            return termo.substring(0, termo.length() - 4) + "cao";
        }
        if (termo.length() > 3 && termo.endsWith("s")) {
            return termo.substring(0, termo.length() - 1);
        }
        return termo;
    }

    private double jaccard(Set<String> a, Set<String> b) {
        if (a.isEmpty() && b.isEmpty()) {
            return 0;
        }
        Set<String> intersecao = new HashSet<>(a);
        intersecao.retainAll(b);
        int uniao = a.size() + b.size() - intersecao.size();
        return (double) intersecao.size() / uniao;
    }
}
