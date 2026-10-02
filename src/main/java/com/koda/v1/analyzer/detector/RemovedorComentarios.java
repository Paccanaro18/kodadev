package com.koda.v1.analyzer.detector;

public final class RemovedorComentarios {

    private RemovedorComentarios() {
    }

    public static String remover(String codigo) {
        StringBuilder resultado = new StringBuilder(codigo.length());
        int tamanho = codigo.length();
        int i = 0;

        while (i < tamanho) {
            char atual = codigo.charAt(i);
            char proximo = i + 1 < tamanho ? codigo.charAt(i + 1) : '\0';

            if (atual == '/' && proximo == '/') {
                i = fimDaLinha(codigo, i);
            } else if (atual == '/' && proximo == '*') {
                int fim = codigo.indexOf("*/", i + 2);
                i = fim < 0 ? tamanho : fim + 2;
            } else if (atual == '"' || atual == '\'') {
                int fim = fimDoLiteral(codigo, i, atual);
                resultado.append(codigo, i, fim);
                i = fim;
            } else {
                resultado.append(atual);
                i++;
            }
        }
        return resultado.toString();
    }

    private static int fimDaLinha(String codigo, int inicio) {
        int quebra = codigo.indexOf('\n', inicio);
        return quebra < 0 ? codigo.length() : quebra;
    }

    private static int fimDoLiteral(String codigo, int inicio, char delimitador) {
        int i = inicio + 1;
        while (i < codigo.length()) {
            char atual = codigo.charAt(i);
            if (atual == '\\') {
                i += 2;
            } else if (atual == delimitador) {
                return i + 1;
            } else if (atual == '\n') {
                return i;
            } else {
                i++;
            }
        }
        return codigo.length();
    }
}
