package com.koda.v1.analyzer.ecossistema.python;

import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.detector.LimitesAnalise;
import com.koda.v1.analyzer.detector.Tecnologia;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Lê manifestos (pyproject.toml, requirements.txt, Pipfile) e o código de rotas de FastAPI, Flask e Django.
 * É leitura de texto com expressões regulares de tamanho limitado: nenhum código do repositório é executado.
 */
@Component
public class DetectorPython {

    static final int MAXIMO_DEPENDENCIAS = 300;
    static final int MAXIMO_CLASSES_POR_ARQUIVO = 50;
    private static final String NOME_ARQUIVO = "arquivo Python";
    private static final String METODO_NAO_INFORMADO = "QUALQUER";

    private static final Pattern NOME_DE_PACOTE = Pattern.compile("[a-z0-9][a-z0-9._-]{0,80}");
    private static final Pattern VERSAO = Pattern.compile("(\\d{1,4}(?:\\.\\d{1,4}){0,2})");
    private static final Pattern REQUISITO = Pattern.compile("^([A-Za-z0-9][A-Za-z0-9._-]{0,80})\\s{0,5}(?:\\[[^\\]]{0,80}\\])?\\s{0,5}(.{0,80})$");
    private static final Pattern SECAO = Pattern.compile("^\\s{0,5}\\[([^\\]]{1,100})\\]\\s{0,5}$");
    private static final Pattern CHAVE_E_VALOR = Pattern.compile("^\\s{0,5}([A-Za-z0-9._\"-]{1,80})\\s{0,5}=\\s{0,5}(.{0,200})$");
    private static final Pattern TEXTO_ENTRE_ASPAS = Pattern.compile("[\"']([^\"']{1,200})[\"']");

    private static final Map<String, String> FRAMEWORKS = new LinkedHashMap<>();

    static {
        FRAMEWORKS.put("fastapi", "FastAPI");
        FRAMEWORKS.put("flask", "Flask");
        FRAMEWORKS.put("django", "Django");
    }

    private static final Map<String, Tecnologia> TECNOLOGIAS = Map.ofEntries(
            Map.entry("psycopg2", Tecnologia.POSTGRESQL),
            Map.entry("psycopg2-binary", Tecnologia.POSTGRESQL),
            Map.entry("psycopg", Tecnologia.POSTGRESQL),
            Map.entry("asyncpg", Tecnologia.POSTGRESQL),
            Map.entry("pg8000", Tecnologia.POSTGRESQL),
            Map.entry("redis", Tecnologia.REDIS),
            Map.entry("aioredis", Tecnologia.REDIS),
            Map.entry("pika", Tecnologia.RABBITMQ),
            Map.entry("aio-pika", Tecnologia.RABBITMQ));

    private static final Pattern DECORADOR_HTTP = Pattern.compile(
            "@(\\w{1,60})\\s{0,5}\\.\\s{0,5}(get|post|put|delete|patch)\\s{0,5}\\(\\s{0,10}[\"']([^\"']{0,200})[\"']");
    private static final Pattern DECORADOR_ROUTE = Pattern.compile(
            "@(\\w{1,60})\\s{0,5}\\.\\s{0,5}route\\s{0,5}\\(\\s{0,10}[\"']([^\"']{0,200})[\"']"
                    + "([^()]{0,200}(?:\\([^()]{0,100}\\)[^()]{0,100})?)\\)");
    private static final Pattern ROUTER_COM_PREFIXO = Pattern.compile(
            "(\\w{1,60})\\s{0,5}=\\s{0,5}(?:APIRouter|Blueprint)\\s{0,5}\\(([^)]{0,300})\\)");
    private static final Pattern PREFIXO = Pattern.compile("(?:prefix|url_prefix)\\s{0,5}=\\s{0,5}[\"']([^\"']{0,200})[\"']");
    private static final Pattern METODOS_DO_FLASK = Pattern.compile("methods\\s{0,5}=\\s{0,5}[\\[(]([^\\])]{0,100})[\\])]");
    private static final Pattern ROTA_DO_DJANGO = Pattern.compile("\\bpath\\s{0,5}\\(\\s{0,10}[\"']([^\"']{0,200})[\"']");
    private static final Pattern PARAMETRO_DO_FLASK = Pattern.compile("<(?:\\w+:)?(\\w+)>");
    private static final Pattern CLASSE = Pattern.compile("(?m)^class\\s+(\\w{1,80})\\s{0,5}(?:\\(([^)]{0,200})\\))?\\s{0,5}:");

    public ResultadoPython detectar(Map<String, String> manifestos) {
        Map<String, String> dependencias = new LinkedHashMap<>();
        String versaoPython = null;

        for (Map.Entry<String, String> manifesto : manifestos.entrySet()) {
            LimitesAnalise.validarTamanho(manifesto.getValue(), manifesto.getKey());
            Leitura leitura = switch (manifesto.getKey()) {
                case "pyproject.toml" -> lerPyproject(manifesto.getValue());
                case "Pipfile" -> lerPipfile(manifesto.getValue());
                default -> lerRequirements(manifesto.getValue());
            };
            leitura.dependencias.forEach(dependencias::putIfAbsent);
            if (versaoPython == null) {
                versaoPython = leitura.versaoPython;
            }
        }

        String framework = null;
        String versaoFramework = null;
        for (Map.Entry<String, String> candidato : FRAMEWORKS.entrySet()) {
            if (dependencias.containsKey(candidato.getKey())) {
                framework = candidato.getValue();
                versaoFramework = primeiraVersao(dependencias.get(candidato.getKey()));
                break;
            }
        }

        Set<Tecnologia> tecnologias = EnumSet.noneOf(Tecnologia.class);
        dependencias.keySet().forEach(nome -> {
            Tecnologia tecnologia = TECNOLOGIAS.get(nome);
            if (tecnologia != null) {
                tecnologias.add(tecnologia);
            }
        });

        List<String> nomes = dependencias.keySet().stream().limit(MAXIMO_DEPENDENCIAS).toList();
        return new ResultadoPython(versaoPython, framework, versaoFramework, nomes, tecnologias);
    }

    public List<Endpoint> detectarRotas(String conteudo, String caminho, String nomeDoComponente) {
        LimitesAnalise.validarTamanho(conteudo, NOME_ARQUIVO);

        String codigo = semComentarios(conteudo);
        Map<String, String> prefixos = prefixosDosRouters(codigo);
        List<Endpoint> endpoints = new ArrayList<>();

        Matcher http = DECORADOR_HTTP.matcher(codigo);
        while (http.find()) {
            String caminhoCompleto = normalizar(prefixos.getOrDefault(http.group(1), "") + "/" + http.group(3));
            endpoints.add(new Endpoint(http.group(2).toUpperCase(Locale.ROOT), caminhoCompleto, nomeDoComponente));
        }

        Matcher route = DECORADOR_ROUTE.matcher(codigo);
        while (route.find()) {
            String caminhoCompleto = normalizar(prefixos.getOrDefault(route.group(1), "") + "/" + route.group(2));
            for (String metodo : metodosDoFlask(route.group(3))) {
                endpoints.add(new Endpoint(metodo, caminhoCompleto, nomeDoComponente));
            }
        }

        if (caminho.endsWith("urls.py")) {
            Matcher django = ROTA_DO_DJANGO.matcher(codigo);
            while (django.find()) {
                endpoints.add(new Endpoint(METODO_NAO_INFORMADO, normalizar(django.group(1)), nomeDoComponente));
            }
        }
        return endpoints;
    }

    /** Os nomes das classes de um arquivo cujas bases passam no filtro. */
    public List<String> classes(String conteudo, Predicate<String> bases) {
        LimitesAnalise.validarTamanho(conteudo, NOME_ARQUIVO);

        List<String> nomes = new ArrayList<>();
        Matcher classe = CLASSE.matcher(semComentarios(conteudo));
        while (classe.find() && nomes.size() < MAXIMO_CLASSES_POR_ARQUIVO) {
            String declaradas = classe.group(2) == null ? "" : classe.group(2);
            if (bases.test(declaradas)) {
                nomes.add(classe.group(1));
            }
        }
        return nomes;
    }

    private Map<String, String> prefixosDosRouters(String codigo) {
        Map<String, String> prefixos = new HashMap<>();
        Matcher router = ROUTER_COM_PREFIXO.matcher(codigo);
        while (router.find()) {
            Matcher prefixo = PREFIXO.matcher(router.group(2));
            if (prefixo.find()) {
                prefixos.put(router.group(1), prefixo.group(1));
            }
        }
        return prefixos;
    }

    private List<String> metodosDoFlask(String argumentos) {
        Matcher metodos = METODOS_DO_FLASK.matcher(argumentos);
        if (!metodos.find()) {
            return List.of("GET");
        }
        List<String> lista = new ArrayList<>();
        Matcher texto = TEXTO_ENTRE_ASPAS.matcher(metodos.group(1));
        while (texto.find()) {
            lista.add(texto.group(1).toUpperCase(Locale.ROOT));
        }
        return lista.isEmpty() ? List.of("GET") : lista;
    }

    private String normalizar(String caminho) {
        String comParametros = PARAMETRO_DO_FLASK.matcher(caminho).replaceAll("{$1}");
        StringBuilder normalizado = new StringBuilder();
        for (String segmento : comParametros.split("/")) {
            if (!segmento.isEmpty()) {
                normalizado.append('/').append(segmento);
            }
        }
        return normalizado.length() == 0 ? "/" : normalizado.toString();
    }

    private Leitura lerRequirements(String texto) {
        Leitura leitura = new Leitura();
        for (String linha : texto.split("\\R")) {
            String limpa = semComentarioDeLinha(linha).trim();
            if (limpa.isEmpty() || limpa.startsWith("-") || limpa.contains("://")) {
                continue;
            }
            acrescentarRequisito(leitura, limpa);
        }
        return leitura;
    }

    private Leitura lerPyproject(String texto) {
        Leitura leitura = new Leitura();
        String secao = "";
        boolean dentroDoArray = false;

        for (String linhaBruta : texto.split("\\R")) {
            String linha = semComentarioDeLinha(linhaBruta);
            Matcher cabecalho = SECAO.matcher(linha);
            if (cabecalho.matches()) {
                secao = cabecalho.group(1).trim();
                dentroDoArray = false;
                continue;
            }
            if (dentroDoArray) {
                lerRequisitosEntreAspas(leitura, linha);
                dentroDoArray = !fechaOArray(linha);
                continue;
            }
            Matcher par = CHAVE_E_VALOR.matcher(linha);
            if (!par.matches()) {
                continue;
            }
            String chave = par.group(1).replace("\"", "");
            String valor = par.group(2);

            if (secao.equals("project") && chave.equals("requires-python")) {
                leitura.versaoPython = primeiraVersao(valor);
            } else if (secao.equals("project") && chave.equals("dependencies")) {
                lerRequisitosEntreAspas(leitura, valor);
                dentroDoArray = !fechaOArray(valor);
            } else if (ehSecaoDeDependenciasDoPoetry(secao)) {
                if (chave.equals("python")) {
                    leitura.versaoPython = primeiraVersao(valor);
                } else {
                    leitura.dependencias.putIfAbsent(normalizarNome(chave), valor);
                }
            }
        }
        return leitura;
    }

    private Leitura lerPipfile(String texto) {
        Leitura leitura = new Leitura();
        String secao = "";
        for (String linhaBruta : texto.split("\\R")) {
            String linha = semComentarioDeLinha(linhaBruta);
            Matcher cabecalho = SECAO.matcher(linha);
            if (cabecalho.matches()) {
                secao = cabecalho.group(1).trim();
                continue;
            }
            Matcher par = CHAVE_E_VALOR.matcher(linha);
            if (!par.matches()) {
                continue;
            }
            String chave = par.group(1).replace("\"", "");
            if (secao.equals("packages") || secao.equals("dev-packages")) {
                leitura.dependencias.putIfAbsent(normalizarNome(chave), par.group(2));
            } else if (secao.equals("requires") && chave.equals("python_version")) {
                leitura.versaoPython = primeiraVersao(par.group(2));
            }
        }
        return leitura;
    }

    /** O "]" que fecha a lista é o que está fora de aspas: "uvicorn[standard]" não a fecha. */
    private boolean fechaOArray(String linha) {
        return linha.replaceAll("\"[^\"]*\"|'[^']*'", "").contains("]");
    }

    private boolean ehSecaoDeDependenciasDoPoetry(String secao) {
        return secao.equals("tool.poetry.dependencies")
                || (secao.startsWith("tool.poetry.group.") && secao.endsWith(".dependencies"));
    }

    private void lerRequisitosEntreAspas(Leitura leitura, String trecho) {
        Matcher texto = TEXTO_ENTRE_ASPAS.matcher(trecho);
        while (texto.find()) {
            acrescentarRequisito(leitura, texto.group(1).trim());
        }
    }

    private void acrescentarRequisito(Leitura leitura, String requisito) {
        Matcher partes = REQUISITO.matcher(requisito);
        if (partes.matches()) {
            String nome = normalizarNome(partes.group(1));
            if (NOME_DE_PACOTE.matcher(nome).matches()) {
                leitura.dependencias.putIfAbsent(nome, partes.group(2));
            }
        }
    }

    private String normalizarNome(String nome) {
        return nome.toLowerCase(Locale.ROOT).replace('_', '-');
    }

    private String primeiraVersao(String texto) {
        if (texto == null) {
            return null;
        }
        Matcher versao = VERSAO.matcher(texto);
        return versao.find() ? versao.group(1) : null;
    }

    private String semComentarioDeLinha(String linha) {
        int marca = indiceDoComentario(linha);
        return marca < 0 ? linha : linha.substring(0, marca);
    }

    private String semComentarios(String codigo) {
        StringBuilder limpo = new StringBuilder(codigo.length());
        for (String linha : codigo.split("\\R", -1)) {
            limpo.append(semComentarioDeLinha(linha)).append('\n');
        }
        return limpo.toString();
    }

    /** O "#" que começa um comentário é o primeiro fora de aspas. */
    private int indiceDoComentario(String linha) {
        char aspas = 0;
        for (int i = 0; i < linha.length(); i++) {
            char atual = linha.charAt(i);
            if (aspas != 0) {
                if (atual == '\\') {
                    i++;
                } else if (atual == aspas) {
                    aspas = 0;
                }
            } else if (atual == '"' || atual == '\'') {
                aspas = atual;
            } else if (atual == '#') {
                return i;
            }
        }
        return -1;
    }

    private static final class Leitura {
        private final Map<String, String> dependencias = new LinkedHashMap<>();
        private String versaoPython;
    }
}
