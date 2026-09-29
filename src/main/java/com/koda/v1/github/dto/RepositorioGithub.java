package com.koda.v1.github.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RepositorioGithub(
        Long id,
        @JsonProperty("name") String nome,
        @JsonProperty("full_name") String nomeCompleto,
        @JsonProperty("description") String descricao,
        @JsonProperty("language") String linguagem,
        @JsonProperty("html_url") String url,
        @JsonProperty("default_branch") String branchPadrao,
        @JsonProperty("private") boolean privado
) {
}
