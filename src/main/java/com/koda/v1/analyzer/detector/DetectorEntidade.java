package com.koda.v1.analyzer.detector;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class DetectorEntidade {

    private static final String NOME_ARQUIVO = "classe";

    private static final Pattern ANOTACAO_ENTITY =
            Pattern.compile("(?m)^[ \\t]*@(?:jakarta\\.persistence\\.|javax\\.persistence\\.)?Entity\\b");

    public boolean ehEntidade(String conteudo) {
        LimitesAnalise.validarTamanho(conteudo, NOME_ARQUIVO);

        String codigo = RemovedorComentarios.remover(conteudo);

        return ANOTACAO_ENTITY.matcher(codigo).find();
    }
}
