package com.koda.v1.challenge.api;

import java.util.List;

/**
 * Visão da home e das configurações: quantos tickets já foram gerados, a cota diária e os últimos tickets,
 * do mais novo para o mais antigo.
 */
public record DesafiosRecentesResposta(long totalGerados, long cotaUsada, int cotaLimite,
                                       List<DesafioRecenteResposta> recentes) {
}
