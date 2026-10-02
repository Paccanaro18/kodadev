package com.koda.v1.analyzer.ecossistema.node;

import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.detector.LimitesAnalise;
import com.koda.v1.analyzer.detector.RemovedorComentarios;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Procura rotas HTTP em NestJS (decoradores), Express, Fastify, Koa e Hono (chamadas como app.get) e Next.js
 * (arquivos route.ts). O que não for reconhecido com certeza é omitido, nunca inventado.
 */
@Component
public class DetectorRotasNode {

    private static final String NOME_ARQUIVO = "arquivo de rotas";
    private static final String METODO_NAO_INFORMADO = "QUALQUER";

    private static final Pattern CONTROLLER_NEST = Pattern.compile("@Controller\\s{0,10}\\(([^)]{0,300})\\)");
    private static final Pattern PRIMEIRA_STRING = Pattern.compile("['\"`]([^'\"`]{0,200})['\"`]");
    private static final Pattern CLASSE = Pattern.compile(
            "(?m)^[ \\t]*(?:export\\s+)?(?:default\\s+)?(?:abstract\\s+)?class\\s+(\\w+)");
    private static final Pattern METODO_NEST = Pattern.compile(
            "@(Get|Post|Put|Delete|Patch|All)\\s{0,10}\\(\\s{0,10}(?:['\"`]([^'\"`]{0,200})['\"`])?");
    private static final Pattern CHAMADA_DE_ROTA = Pattern.compile(
            "\\b(?:app|router|routes|route|server|fastify|api|instance|r)\\s{0,5}\\.\\s{0,5}"
                    + "(get|post|put|delete|patch|all)\\s{0,5}\\(\\s{0,10}['\"`](/[^'\"`]{0,200})['\"`]");
    private static final Pattern EXPORT_DE_METODO = Pattern.compile(
            "export\\s+(?:async\\s+)?(?:function|const)\\s+(GET|POST|PUT|PATCH|DELETE)\\b");
    private static final Pattern ROTA_NEXT_APP = Pattern.compile("(?:^|.*/)app/(.*)/?route\\.(?:ts|js|mts|mjs)");
    private static final Pattern ROTA_NEXT_PAGES = Pattern.compile("(?:^|.*/)pages/(api/.*)\\.(?:ts|js)");
    private static final Pattern SEGMENTO_DINAMICO = Pattern.compile("\\[+(?:\\.\\.\\.)?(\\w+)\\]+");

    public static boolean pareceArquivoDeRotaDoNext(String caminho) {
        return ROTA_NEXT_APP.matcher(caminho).matches() || ROTA_NEXT_PAGES.matcher(caminho).matches();
    }

    public List<Endpoint> detectar(String conteudo, String caminho, String nomeDoComponente) {
        LimitesAnalise.validarTamanho(conteudo, NOME_ARQUIVO);

        String codigo = RemovedorComentarios.remover(conteudo);
        List<Endpoint> endpoints = new ArrayList<>();

        if (codigo.contains("@Controller")) {
            endpoints.addAll(rotasDoNest(codigo));
        }
        Matcher chamada = CHAMADA_DE_ROTA.matcher(codigo);
        while (chamada.find()) {
            endpoints.add(new Endpoint(metodo(chamada.group(1)), normalizar(chamada.group(2)), nomeDoComponente));
        }
        endpoints.addAll(rotasDoNext(codigo, caminho, nomeDoComponente));
        return endpoints;
    }

    private List<Endpoint> rotasDoNest(String codigo) {
        List<Endpoint> endpoints = new ArrayList<>();
        Matcher controller = CONTROLLER_NEST.matcher(codigo);
        while (controller.find()) {
            String base = primeiraString(controller.group(1));
            Matcher classe = CLASSE.matcher(codigo);
            if (!classe.find(controller.end())) {
                continue;
            }
            String nome = classe.group(1);
            int fim = proximoController(codigo, classe.end());
            Matcher metodo = METODO_NEST.matcher(codigo).region(classe.end(), fim);
            while (metodo.find()) {
                String caminho = juntar(base, metodo.group(2) == null ? "" : metodo.group(2));
                endpoints.add(new Endpoint(metodo(metodo.group(1)), caminho, nome));
            }
        }
        return endpoints;
    }

    private int proximoController(String codigo, int inicio) {
        int proximo = codigo.indexOf("@Controller", inicio);
        return proximo < 0 ? codigo.length() : proximo;
    }

    private List<Endpoint> rotasDoNext(String codigo, String caminho, String nomeDoComponente) {
        Matcher app = ROTA_NEXT_APP.matcher(caminho);
        Matcher pages = ROTA_NEXT_PAGES.matcher(caminho);
        String rota;
        List<String> metodos = new ArrayList<>();

        if (app.matches()) {
            rota = rotaDoNext(app.group(1));
            Matcher exportado = EXPORT_DE_METODO.matcher(codigo);
            while (exportado.find()) {
                metodos.add(exportado.group(1));
            }
        } else if (pages.matches()) {
            rota = rotaDoNext(pages.group(1));
            metodos.add(METODO_NAO_INFORMADO);
        } else {
            return List.of();
        }
        List<Endpoint> endpoints = new ArrayList<>();
        for (String metodo : metodos) {
            endpoints.add(new Endpoint(metodo, rota, nomeDoComponente));
        }
        return endpoints;
    }

    private String rotaDoNext(String pasta) {
        List<String> segmentos = new ArrayList<>();
        for (String segmento : pasta.split("/")) {
            if (segmento.isEmpty() || (segmento.startsWith("(") && segmento.endsWith(")"))) {
                continue;
            }
            Matcher dinamico = SEGMENTO_DINAMICO.matcher(segmento);
            segmentos.add(dinamico.matches() ? "{" + dinamico.group(1) + "}" : segmento);
        }
        return "/" + String.join("/", segmentos);
    }

    private String primeiraString(String argumentos) {
        Matcher texto = PRIMEIRA_STRING.matcher(argumentos);
        return texto.find() ? texto.group(1) : "";
    }

    private String metodo(String verbo) {
        String maiusculo = verbo.toUpperCase(Locale.ROOT);
        return maiusculo.equals("ALL") ? METODO_NAO_INFORMADO : maiusculo;
    }

    private String juntar(String base, String complemento) {
        return normalizar(("/" + base + "/" + complemento).replaceAll("/{2,}", "/"));
    }

    /** ":id" vira "{id}" e a barra final cai, para o caminho ter a mesma forma nas três linguagens. */
    private String normalizar(String caminho) {
        StringBuilder normalizado = new StringBuilder();
        for (String segmento : caminho.split("/")) {
            if (segmento.isEmpty()) {
                continue;
            }
            normalizado.append('/');
            if (segmento.startsWith(":") && segmento.length() > 1) {
                normalizado.append('{').append(segmento.substring(1).replace("?", "")).append('}');
            } else {
                normalizado.append(segmento);
            }
        }
        return normalizado.length() == 0 ? "/" : normalizado.toString();
    }
}
