package com.koda.v1.analyzer.persistence;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class RegistroAnalise {

    private static final List<StatusAnalise> STATUS_EM_ABERTO =
            List.of(StatusAnalise.PENDENTE, StatusAnalise.EM_ANDAMENTO);

    private final AnaliseProjetoRepository analiseRepository;
    private final RepositorioGithubRepository repositorioRepository;

    public RegistroAnalise(AnaliseProjetoRepository analiseRepository,
                           RepositorioGithubRepository repositorioRepository) {
        this.analiseRepository = analiseRepository;
        this.repositorioRepository = repositorioRepository;
    }

    @Transactional
    public UUID registrarNovaAnalise(UUID usuarioId, Long githubIdRepositorio,
                                     String dono, String nome, String branchPadrao) {
        RepositorioGithub repositorio = repositorioRepository
                .findByUsuarioIdAndGithubIdRepositorio(usuarioId, githubIdRepositorio)
                .map(existente -> {
                    existente.atualizarDados(dono, nome, branchPadrao);
                    return existente;
                })
                .orElseGet(() -> repositorioRepository.saveAndFlush(
                        new RepositorioGithub(usuarioId, githubIdRepositorio, dono, nome, branchPadrao)));

        if (analiseRepository.existsByRepositorioIdAndStatusIn(repositorio.getId(), STATUS_EM_ABERTO)) {
            throw new AnaliseEmAndamentoException();
        }

        return analiseRepository.saveAndFlush(new AnaliseProjeto(repositorio.getId())).getId();
    }

    @Transactional
    public DadosExecucao iniciar(UUID analiseId) {
        AnaliseProjeto analise = buscar(analiseId);
        RepositorioGithub repositorio = repositorioRepository.findById(analise.getRepositorioId())
                .orElseThrow(() -> new AnaliseNaoEncontradaException(analiseId));

        analise.iniciar();

        return new DadosExecucao(repositorio.getUsuarioId(), repositorio.getDono(), repositorio.getNome());
    }

    @Transactional
    public void concluir(UUID analiseId, String resultadoJson) {
        buscar(analiseId).concluir(resultadoJson);
    }

    @Transactional
    public void concluir(UUID analiseId, String resultadoJson, String contextoJson, int versaoEsquemaContexto) {
        buscar(analiseId).concluir(resultadoJson, contextoJson, versaoEsquemaContexto);
    }

    @Transactional
    public void falhar(UUID analiseId, String mensagemErro) {
        buscar(analiseId).falhar(mensagemErro);
    }

    @Transactional
    public int falharAnalisesEmAberto(String mensagemErro) {
        List<AnaliseProjeto> emAberto = analiseRepository.findAllByStatusIn(STATUS_EM_ABERTO);
        emAberto.forEach(analise -> analise.falhar(mensagemErro));
        return emAberto.size();
    }

    private AnaliseProjeto buscar(UUID analiseId) {
        return analiseRepository.findById(analiseId)
                .orElseThrow(() -> new AnaliseNaoEncontradaException(analiseId));
    }
}
