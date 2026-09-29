package com.koda.v1.analyzer.detector;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class DetectorEndpoints {

    private static final String NOME_ARQUIVO = "controller";
    private static final String METODO_NAO_INFORMADO = "QUALQUER";

    private static final Pattern COMENTARIO_DE_BLOCO =
            Pattern.compile("(?ms)^\\s*/\\*.*?\\*/");
    private static final Pattern COMENTARIO_DE_LINHA =
            Pattern.compile("(?m)^\\s*//.*$");
    private static final Pattern DECLARACAO_CLASSE =
            Pattern.compile("(?m)^\\s*(?:(?:public|abstract|final)\\s+)*class\\s+(\\w+)");
    private static final Pattern MAPEAMENTO_DE_CLASSE =
            Pattern.compile("@RequestMapping\\s*\\(([^)]*)\\)");
    private static final Pattern MAPEAMENTO_DE_METODO =
            Pattern.compile("@(Get|Post|Put|Delete|Patch|Request)Mapping\\b(?:\\s*\\(([^)]*)\\))?");
    private static final Pattern CAMINHO_NOMEADO =
            Pattern.compile("\\b(?:value|path)\\s*=\\s*\\{?\\s*\"([^\"]*)\"");
    private static final Pattern PRIMEIRA_STRING =
            Pattern.compile("^\\s*\\{?\\s*\"([^\"]*)\"");
    private static final Pattern METODO_HTTP =
            Pattern.compile("RequestMethod\\.(GET|POST|PUT|DELETE|PATCH)");

    public List<Endpoint> detectar(String conteudo) {
        LimitesAnalise.validarTamanho(conteudo, NOME_ARQUIVO);

        String codigo = removerComentarios(conteudo);
        if (!codigo.contains("@RestController") && !codigo.contains("@Controller")) {
            return List.of();
        }

        Matcher classe = DECLARACAO_CLASSE.matcher(codigo);
        if (!classe.find()) {
            return List.of();
        }

        String nomeController = classe.group(1);
        String cabecalho = codigo.substring(0, classe.start());
        String corpo = codigo.substring(classe.end());
        String caminhoBase = extrairCaminhoDaClasse(cabecalho);

        List<Endpoint> endpoints = new ArrayList<>();
        Matcher mapeamento = MAPEAMENTO_DE_METODO.matcher(corpo);
        while (mapeamento.find()) {
            String tipo = mapeamento.group(1);
            String argumentos = mapeamento.group(2);

            String metodoHttp = "Request".equals(tipo)
                    ? extrairMetodoHttp(argumentos)
                    : tipo.toUpperCase();
            String caminho = juntar(caminhoBase, extrairCaminho(argumentos));

            endpoints.add(new Endpoint(metodoHttp, caminho, nomeController));
        }
        return endpoints;
    }

    private String removerComentarios(String conteudo) {
        String semBloco = COMENTARIO_DE_BLOCO.matcher(conteudo).replaceAll("");
        return COMENTARIO_DE_LINHA.matcher(semBloco).replaceAll("");
    }

    private String extrairCaminhoDaClasse(String cabecalho) {
        Matcher mapeamento = MAPEAMENTO_DE_CLASSE.matcher(cabecalho);
        return mapeamento.find() ? extrairCaminho(mapeamento.group(1)) : "";
    }

    private String extrairCaminho(String argumentos) {
        if (argumentos == null) {
            return "";
        }
        Matcher nomeado = CAMINHO_NOMEADO.matcher(argumentos);
        if (nomeado.find()) {
            return nomeado.group(1);
        }
        Matcher direto = PRIMEIRA_STRING.matcher(argumentos);
        if (direto.find()) {
            return direto.group(1);
        }
        return "";
    }

    private String extrairMetodoHttp(String argumentos) {
        if (argumentos == null) {
            return METODO_NAO_INFORMADO;
        }
        Matcher metodo = METODO_HTTP.matcher(argumentos);
        return metodo.find() ? metodo.group(1) : METODO_NAO_INFORMADO;
    }

    private String juntar(String base, String complemento) {
        String completo = ("/" + base + "/" + complemento).replaceAll("/{2,}", "/");
        if (completo.length() > 1 && completo.endsWith("/")) {
            completo = completo.substring(0, completo.length() - 1);
        }
        return completo;
    }
}
