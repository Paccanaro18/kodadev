package com.koda.v1.challenge.historico;

import java.util.List;

/** Contagens do usuário por progresso, dicas usadas e as habilidades mais praticadas nos tickets concluídos. */
public record ResumoProgresso(
        long naoIniciados,
        long emAndamento,
        long concluidos,
        long dicasUsadas,
        List<HabilidadePraticada> habilidades
) {
}
