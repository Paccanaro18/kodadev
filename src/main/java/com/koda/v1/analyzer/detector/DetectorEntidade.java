package com.koda.v1.analyzer.detector;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class DetectorEntidade {

    private static final String NOME_ARQUIVO = "classe";

    private static final Pattern COMENTARIO_DE_BLOCO =
            Pattern.compile("(?ms)^\\s*/\\*.*?\\*/");
    private static final Pattern COMENTARIO_DE_LINHA =
            Pattern.compile("(?m)^\\s*//.*$");
    private static final Pattern ANOTACAO_ENTITY =
            Pattern.compile("(?m)^\\s*@(?:jakarta\\.persistence\\.|javax\\.persistence\\.)?Entity\\b");

    public boolean ehEntidade(String conteudo) {
        LimitesAnalise.validarTamanho(conteudo, NOME_ARQUIVO);

        String semBloco = COMENTARIO_DE_BLOCO.matcher(conteudo).replaceAll("");
        String codigo = COMENTARIO_DE_LINHA.matcher(semBloco).replaceAll("");

        return ANOTACAO_ENTITY.matcher(codigo).find();
    }
}
