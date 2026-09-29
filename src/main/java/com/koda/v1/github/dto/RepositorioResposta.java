package com.koda.v1.github.dto;

public record RepositorioResposta(
        Long id,
        String nome,
        String nomeCompleto,
        String descricao,
        String linguagem,
        String url,
        String branchPadrao,
        String atualizadoEm
) {

    public static RepositorioResposta de(RepositorioGithub repositorio) {
        return new RepositorioResposta(
                repositorio.id(),
                repositorio.nome(),
                repositorio.nomeCompleto(),
                repositorio.descricao(),
                repositorio.linguagem(),
                repositorio.url(),
                repositorio.branchPadrao(),
                repositorio.atualizadoEm());
    }
}
