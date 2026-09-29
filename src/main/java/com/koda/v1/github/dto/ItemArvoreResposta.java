package com.koda.v1.github.dto;

public record ItemArvoreResposta(String caminho, String tipo, String sha, Long tamanho) {

    public static ItemArvoreResposta de(ItemArvoreGithub item) {
        return new ItemArvoreResposta(item.caminho(), item.tipo(), item.sha(), item.tamanho());
    }
}
