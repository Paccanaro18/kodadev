package com.koda.v1.github.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BlobGithub(
        @JsonProperty("sha") String sha,
        @JsonProperty("size") long tamanho,
        @JsonProperty("content") String conteudo,
        @JsonProperty("encoding") String codificacao
) {
}
