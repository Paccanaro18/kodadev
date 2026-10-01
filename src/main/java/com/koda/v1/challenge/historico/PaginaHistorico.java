package com.koda.v1.challenge.historico;

import java.util.List;

public record PaginaHistorico(List<ItemHistorico> itens, int pagina, int tamanho, long total, int totalPaginas) {
}
