package com.koda.v1.github.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ItemArvoreGithub(
        @JsonProperty("path") String caminho,
        @JsonProperty("type") String tipo,
        @JsonProperty("sha") String sha,
        @JsonProperty("size") Long tamanho
) {
}
