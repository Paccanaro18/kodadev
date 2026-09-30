package com.koda.v1.challenge.api;

import java.util.List;

/** Visão da home: quantos tickets já foram gerados e os últimos, do mais novo para o mais antigo. */
public record DesafiosRecentesResposta(long totalGerados, List<DesafioRecenteResposta> recentes) {
}
