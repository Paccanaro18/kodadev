package com.koda.v1.challenge.validacao;

import com.koda.v1.analyzer.contexto.ComponentesContexto;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.RecursoDoCaminho;
import com.koda.v1.challenge.ConteudoDesafio;
import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.catalogo.AlvoDesafio;
import com.koda.v1.challenge.selecao.SelecaoDeDesafio;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Confere, só com regras de código, se um ticket já aceito pelo {@code VerificadorConteudo} presta para ser mostrado.
 * O texto vem da IA e é tratado como não confiável: nada dele é executado nem registrado em log.
 */
@Component
public class ValidadorDesafio {

    static final int MAXIMO_DE_CLASSES_CITADAS = 6;
    static final int MINIMO_DE_PALAVRAS_POR_CRITERIO = 4;

    private static final Pattern CHAMADA_DE_METODO = Pattern.compile("\\b(?:[a-z]+[A-Z]\\w*|\\w+)\\(\\)|\\b[a-z]+[A-Z]\\w*\\(");
    private static final Pattern SETA_OU_PONTO_E_VIRGULA = Pattern.compile("=>|->|;\\s*(?:\\n|$)");
    private static final List<String> FRASES_DE_SOLUCAO = List.of(
            "a solucao", "basta ", "na linha ", "troque o ", "troque a ", "substitua o ", "substitua a ",
            "altere o metodo", "altere a linha", "adicione o metodo", "crie o metodo");

    private static final Pattern CLASSE_DO_PROJETO = Pattern.compile(
            "\\b[A-Z][A-Za-z0-9]*(?:Controller|Service|Repository|DTO|Dto|Mapper|Entity|Request|Response|Handler|Validator|Exception)\\b");
    private static final Pattern ENDPOINT = Pattern.compile("\\b(GET|POST|PUT|PATCH|DELETE) (/[\\w/{}\\-]*)");
    private static final Set<String> CLASSES_DE_FRAMEWORK = Set.of(
            "Exception", "RuntimeException", "NullPointerException", "IllegalArgumentException",
            "IllegalStateException", "NoSuchElementException", "ResponseEntity", "ResponseStatusException",
            "MethodArgumentNotValidException", "DataIntegrityViolationException", "ConstraintViolationException",
            "HttpMessageNotReadableException", "EntityNotFoundException", "DataAccessException",
            "OptimisticLockException", "TransactionSystemException");
    private static final List<String> VERBOS_DE_CRIACAO = List.of(
            "criar", "criad", "crie", "cria ", "nova ", "novo ", "adicion", "implement", "expor", "expon", "suporte",
            "incluir", "inclua", "desenvolv", "deve existir", "passar a", "disponibiliz", "entreg", "ofere", "permit");

    private static final List<String> TERMOS_VAGOS = List.of(
            "melhorar", "melhore", "otimizar", "otimize", "eficiente", "boa qualidade", "de forma adequada",
            "de forma apropriada", "da melhor forma", "da melhor maneira");
    private static final List<String> SINAIS_DE_DEFEITO = List.of(
            "erro", "falha", "incorret", "inconsist", "quebr", "duplic", "indevid", "inesperad", "bug", "problema",
            "nao valida", "nao trata", "nao retorna", "errad", "excecao");

    public List<MotivoReprovacao> validar(ConteudoDesafio conteudo, SelecaoDeDesafio selecao, ContextoProjeto contexto) {
        Set<MotivoReprovacao> motivos = EnumSet.noneOf(MotivoReprovacao.class);
        List<String> textos = textosDoTicket(conteudo);

        if (entregaASolucao(textos)) {
            motivos.add(MotivoReprovacao.SOLUCAO_ENTREGUE);
        }
        if (citaAlgoInexistente(textos, contexto)) {
            motivos.add(MotivoReprovacao.REFERENCIA_INEXISTENTE);
        }
        if (temCriterioVago(conteudo.criteriosDeAceite())) {
            motivos.add(MotivoReprovacao.CRITERIO_VAGO);
        }
        if (!combinaComOTipo(conteudo, selecao.tipo())) {
            motivos.add(MotivoReprovacao.TIPO_INCOERENTE);
        }
        if (!citaOAlvo(textos, selecao.alvo())) {
            motivos.add(MotivoReprovacao.FORA_DO_ALVO);
        }
        if (classesDoProjetoCitadas(textos, contexto).size() > MAXIMO_DE_CLASSES_CITADAS) {
            motivos.add(MotivoReprovacao.ESCOPO_GRANDE);
        }
        return List.copyOf(motivos);
    }

    /** Uma dica não pode entregar a solução nem citar classe ou endpoint que não existe. */
    public List<MotivoReprovacao> validarDica(String dica, ContextoProjeto contexto) {
        Set<MotivoReprovacao> motivos = EnumSet.noneOf(MotivoReprovacao.class);
        List<String> textos = List.of(dica);

        if (entregaASolucao(textos)) {
            motivos.add(MotivoReprovacao.SOLUCAO_ENTREGUE);
        }
        if (citaAlgoInexistente(textos, contexto)) {
            motivos.add(MotivoReprovacao.REFERENCIA_INEXISTENTE);
        }
        return List.copyOf(motivos);
    }

    private List<String> textosDoTicket(ConteudoDesafio c) {
        List<String> textos = new ArrayList<>();
        textos.add(c.titulo());
        textos.add(c.contexto());
        textos.add(c.cenarioAtual());
        textos.add(c.objetivo());
        textos.addAll(c.regrasDeNegocio());
        textos.addAll(c.requisitosTecnicos());
        textos.addAll(c.criteriosDeAceite());
        textos.addAll(c.testesEsperados());
        textos.addAll(c.restricoes());
        return textos;
    }

    private boolean entregaASolucao(List<String> textos) {
        for (String texto : textos) {
            if (CHAMADA_DE_METODO.matcher(texto).find() || SETA_OU_PONTO_E_VIRGULA.matcher(texto).find()) {
                return true;
            }
            String normalizado = normalizar(texto);
            if (FRASES_DE_SOLUCAO.stream().anyMatch(normalizado::contains)) {
                return true;
            }
        }
        return false;
    }

    private boolean citaAlgoInexistente(List<String> textos, ContextoProjeto contexto) {
        Set<String> conhecidas = classesConhecidas(contexto);
        Set<String> endpoints = new HashSet<>();
        contexto.endpoints().forEach(e -> endpoints.add(e.metodoHttp().toUpperCase(Locale.ROOT) + " " + e.caminho()));

        Set<String> desconhecidos = new HashSet<>();
        Set<String> declaradosComoNovos = new HashSet<>();
        for (String texto : textos) {
            for (String frase : frases(texto)) {
                boolean criaAlgo = frasePodeCriarAlgo(frase);
                Matcher classe = CLASSE_DO_PROJETO.matcher(frase);
                while (classe.find()) {
                    if (!conhecidas.contains(classe.group()) && !CLASSES_DE_FRAMEWORK.contains(classe.group())) {
                        desconhecidos.add(classe.group());
                        if (criaAlgo) {
                            declaradosComoNovos.add(classe.group());
                        }
                    }
                }
                Matcher endpoint = ENDPOINT.matcher(frase);
                while (endpoint.find()) {
                    String chave = endpoint.group(1) + " " + endpoint.group(2);
                    if (!endpoints.contains(chave)) {
                        desconhecidos.add(chave);
                        if (criaAlgo) {
                            declaradosComoNovos.add(chave);
                        }
                    }
                }
            }
        }
        desconhecidos.removeAll(declaradosComoNovos);
        return !desconhecidos.isEmpty();
    }

    private boolean frasePodeCriarAlgo(String frase) {
        String normalizada = normalizar(frase);
        return VERBOS_DE_CRIACAO.stream().anyMatch(normalizada::contains);
    }

    private List<String> frases(String texto) {
        return List.of(texto.split("(?<=[.!?;])\\s+|\\n"));
    }

    private boolean temCriterioVago(List<String> criterios) {
        for (String criterio : criterios) {
            String normalizado = normalizar(criterio);
            if (TERMOS_VAGOS.stream().anyMatch(normalizado::contains)
                    || normalizado.trim().split("\\s+").length < MINIMO_DE_PALAVRAS_POR_CRITERIO) {
                return true;
            }
        }
        return false;
    }

    private boolean combinaComOTipo(ConteudoDesafio c, TipoDesafio tipo) {
        return switch (tipo) {
            case TESTING -> normalizar(String.join(" ", c.titulo(), c.objetivo(),
                    String.join(" ", c.requisitosTecnicos()))).contains("test");
            case BUG -> {
                String descricao = normalizar(c.contexto() + " " + c.cenarioAtual());
                yield SINAIS_DE_DEFEITO.stream().anyMatch(descricao::contains);
            }
            case FEATURE -> true;
        };
    }

    private boolean citaOAlvo(List<String> textos, AlvoDesafio alvo) {
        String nome = switch (alvo.escopo()) {
            case CLASSE, RECURSO -> alvo.nome();
            case ENDPOINT -> RecursoDoCaminho.de(alvo.nome().substring(alvo.nome().indexOf(' ') + 1)).orElse(null);
            case PROJETO -> null;
        };
        if (nome == null) {
            return true;
        }
        String procurado = semPlural(normalizar(nome));
        return normalizar(String.join(" ", textos)).contains(procurado);
    }

    private Set<String> classesDoProjetoCitadas(List<String> textos, ContextoProjeto contexto) {
        Set<String> conhecidas = classesConhecidas(contexto);
        Set<String> citadas = new HashSet<>();
        Matcher matcher = Pattern.compile("\\b[A-Z][A-Za-z0-9]+\\b").matcher(String.join(" ", textos));
        while (matcher.find()) {
            if (conhecidas.contains(matcher.group())) {
                citadas.add(matcher.group());
            }
        }
        return citadas;
    }

    private Set<String> classesConhecidas(ContextoProjeto contexto) {
        ComponentesContexto c = contexto.componentes();
        Set<String> conhecidas = new HashSet<>();
        conhecidas.addAll(c.controllers());
        conhecidas.addAll(c.services());
        conhecidas.addAll(c.repositories());
        conhecidas.addAll(c.entidades());
        conhecidas.addAll(c.dtos());
        conhecidas.addAll(c.excecoes());
        return conhecidas;
    }

    private String semPlural(String termo) {
        return termo.length() > 3 && termo.endsWith("s") ? termo.substring(0, termo.length() - 1) : termo;
    }

    private String normalizar(String texto) {
        return Normalizer.normalize(texto, Normalizer.Form.NFD).replaceAll("\\p{M}+", "").toLowerCase(Locale.ROOT);
    }
}
