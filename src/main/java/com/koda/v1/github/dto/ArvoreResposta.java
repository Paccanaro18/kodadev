package com.koda.v1.github.dto;

import java.util.List;

public record ArvoreResposta(String branch, boolean truncada, List<ItemArvoreResposta> itens) {
}
