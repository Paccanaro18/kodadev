package com.koda.v1.challenge.catalogo;

import com.koda.v1.analyzer.contexto.ContextoProjeto;

import java.util.List;

@FunctionalInterface
public interface RegraDeAlvo {

    List<AlvoDesafio> alvos(ContextoProjeto contexto);
}
