package com.koda.v1.analyzer.persistence;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ConsultaAnalise {

    private final AnaliseProjetoRepository analiseRepository;
    private final RepositorioGithubRepository repositorioRepository;

    public ConsultaAnalise(AnaliseProjetoRepository analiseRepository,
                           RepositorioGithubRepository repositorioRepository) {
        this.analiseRepository = analiseRepository;
        this.repositorioRepository = repositorioRepository;
    }

    @Transactional(readOnly = true)
    public AnaliseDetalhe buscarDoUsuario(UUID usuarioId, UUID analiseId) {
        AnaliseProjeto analise = analiseRepository.findById(analiseId)
                .orElseThrow(() -> new AnaliseNaoEncontradaException(analiseId));
        RepositorioGithub repositorio = repositorioRepository.findById(analise.getRepositorioId())
                .filter(encontrado -> encontrado.getUsuarioId().equals(usuarioId))
                .orElseThrow(() -> new AnaliseNaoEncontradaException(analiseId));

        return new AnaliseDetalhe(
                analise.getId(),
                analise.getStatus(),
                repositorio.getDono(),
                repositorio.getNome(),
                analise.getResultado(),
                analise.getMensagemErro(),
                analise.getCriadoEm(),
                analise.getConcluidaEm());
    }
}
