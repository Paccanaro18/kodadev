package com.koda.v1.github.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ArvoreGithub(
        @JsonProperty("sha") String sha,
        @JsonProperty("tree") List<ItemArvoreGithub> itens,
        @JsonProperty("truncated") boolean truncada
) {
}