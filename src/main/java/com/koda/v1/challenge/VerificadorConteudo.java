package com.koda.v1.challenge;

import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.core.json.JsonReadFeature;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.List;

@Component
public class VerificadorConteudo {

    static final int TAMANHO_MAXIMO_RESPOSTA = 30_000;
    static final int TAMANHO_MAXIMO_TITULO = 120;
    static final int TAMANHO_MAXIMO_TEXTO = 1_200;
    static final int TAMANHO_MAXIMO_ITEM = 300;
    static final int TAMANHO_MAXIMO_HABILIDADE = 40;

    private static final String BLOCO_DE_CODIGO = "```";
    private static final String RETICENCIAS = "…";
    private static final JsonMapper MAPEADOR = JsonMapper.builder()
            .enable(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS, JsonReadFeature.ALLOW_TRAILING_COMMA)
            .build();

    public ConteudoDesafio verificar(String respostaBruta) {
        if (respostaBruta == null || respostaBruta.isBlank()) {
            throw new ConteudoInvalidoException("A resposta da IA veio vazia.");
        }
        if (respostaBruta.length() > TAMANHO_MAXIMO_RESPOSTA) {
            throw new ConteudoInvalidoException("A resposta da IA passou do tamanho permitido.");
        }

        JsonNode raiz = lerObjeto(respostaBruta);

        return new ConteudoDesafio(
                texto(raiz, "titulo", TAMANHO_MAXIMO_TITULO),
                texto(raiz, "contexto", TAMANHO_MAXIMO_TEXTO),
                texto(raiz, "cenarioAtual", TAMANHO_MAXIMO_TEXTO),
                texto(raiz, "objetivo", TAMANHO_MAXIMO_TEXTO),
                lista(raiz, "regrasDeNegocio", 2, 8, TAMANHO_MAXIMO_ITEM),
                lista(raiz, "requisitosTecnicos", 2, 8, TAMANHO_MAXIMO_ITEM),
                lista(raiz, "criteriosDeAceite", 2, 8, TAMANHO_MAXIMO_ITEM),
                lista(raiz, "testesEsperados", 1, 6, TAMANHO_MAXIMO_ITEM),
                lista(raiz, "restricoes", 1, 6, TAMANHO_MAXIMO_ITEM),
                lista(raiz, "habilidades", 1, 6, TAMANHO_MAXIMO_HABILIDADE));
    }

    private JsonNode lerObjeto(String respostaBruta) {
        int inicio = respostaBruta.indexOf('{');
        int fim = respostaBruta.lastIndexOf('}');
        if (inicio < 0 || fim < inicio) {
            throw new ConteudoInvalidoException("A resposta da IA não contém um objeto JSON.");
        }
        try {
            JsonNode raiz = MAPEADOR.readTree(respostaBruta.substring(inicio, fim + 1));
            if (raiz == null || !raiz.isObject()) {
                throw new ConteudoInvalidoException("A resposta da IA não é um objeto JSON.");
            }
            return raiz;
        } catch (JacksonException e) {
            throw new ConteudoInvalidoException("A resposta da IA não é um JSON válido.");
        }
    }

    private String texto(JsonNode raiz, String campo, int tamanhoMaximo) {
        JsonNode no = raiz.get(campo);
        if (no == null || !no.isString()) {
            throw new ConteudoInvalidoException("O campo '" + campo + "' é obrigatório e deve ser texto.");
        }
        String limpo = limpar(no.asString(), tamanhoMaximo);
        if (limpo.isEmpty()) {
            throw new ConteudoInvalidoException("O campo '" + campo + "' está vazio.");
        }
        return limpo;
    }

    private List<String> lista(JsonNode raiz, String campo, int minimo, int maximo, int tamanhoMaximoItem) {
        JsonNode no = raiz.get(campo);
        if (no == null || !no.isArray()) {
            throw new ConteudoInvalidoException("O campo '" + campo + "' é obrigatório e deve ser uma lista.");
        }

        List<String> itens = new ArrayList<>();
        for (int i = 0; i < no.size() && itens.size() < maximo; i++) {
            JsonNode elemento = no.get(i);
            if (!elemento.isString()) {
                throw new ConteudoInvalidoException("A lista '" + campo + "' deve conter só textos.");
            }
            String limpo = limpar(elemento.asString(), tamanhoMaximoItem);
            if (!limpo.isEmpty()) {
                itens.add(limpo);
            }
        }
        if (itens.size() < minimo) {
            throw new ConteudoInvalidoException("A lista '" + campo + "' tem itens de menos.");
        }
        return itens;
    }

    private String limpar(String bruto, int tamanhoMaximo) {
        if (bruto.contains(BLOCO_DE_CODIGO)) {
            throw new ConteudoInvalidoException("A resposta da IA contém bloco de código.");
        }

        StringBuilder limpo = new StringBuilder(Math.min(bruto.length(), tamanhoMaximo + 16));
        boolean espacoPendente = false;
        for (int i = 0; i < bruto.length(); ) {
            int codigo = bruto.codePointAt(i);
            i += Character.charCount(codigo);

            if (Character.isWhitespace(codigo) || Character.isSpaceChar(codigo)) {
                espacoPendente = limpo.length() > 0;
            } else if (!ehInvisivel(codigo)) {
                if (espacoPendente) {
                    limpo.append(' ');
                    espacoPendente = false;
                }
                limpo.appendCodePoint(codigo);
            }
        }
        return cortar(limpo.toString(), tamanhoMaximo);
    }

    private boolean ehInvisivel(int codigo) {
        int tipo = Character.getType(codigo);
        return tipo == Character.CONTROL || tipo == Character.FORMAT
                || tipo == Character.PRIVATE_USE || tipo == Character.SURROGATE
                || tipo == Character.UNASSIGNED;
    }

    private String cortar(String texto, int tamanhoMaximo) {
        if (texto.length() <= tamanhoMaximo) {
            return texto;
        }
        int limite = tamanhoMaximo - RETICENCIAS.length();
        int espaco = texto.lastIndexOf(' ', limite);
        int corte = espaco > limite / 2 ? espaco : limite;
        if (corte > 0 && Character.isHighSurrogate(texto.charAt(corte - 1))) {
            corte--;
        }
        return texto.substring(0, corte) + RETICENCIAS;
    }
}
