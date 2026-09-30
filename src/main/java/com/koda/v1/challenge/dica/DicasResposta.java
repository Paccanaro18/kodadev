package com.koda.v1.challenge.dica;

import java.util.List;

public record DicasResposta(List<DicaResposta> dicas, int maximoPorDesafio, long usadasHoje, int limiteDiario) {
}
