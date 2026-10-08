package com.koda.v1.analyzer.persistence;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class ConsultaAnalise {

    static final int MAXIMO_REPOSITORIOS_LISTADOS = 20;

    private final AnaliseProjetoRepository analiseRepository;
    private final RepositorioGithubRepository repositorioRepository;

    public ConsultaAnalise(AnaliseProjetoRepository analiseRepository,
                           RepositorioGithubRepository repositorioRepository) {
        this.analiseRepository = analiseRepository;
        this.repositorioRepository = repositorioRepository;
    }

    @Transactional(readOnly = true)
    public List<AnaliseDetalhe> listarUltimasDoUsuario(UUID usuarioId) {
        return repositorioRepository.findAllByUsuarioIdOrderByCriadoEmDesc(usuarioId).stream()
                .flatMap(repositorio -> analiseRepository
                        .findFirstByRepositorioIdOrderByCriadoEmDesc(repositorio.getId())
                        .map(analise -> paraDetalhe(analise, repositorio))
                        .stream())
                .sorted(Comparator.comparing(AnaliseDetalhe::criadoEm).reversed())
                .limit(MAXIMO_REPOSITORIOS_LISTADOS)
                .toList();
    }

    @Transactional(readOnly = true)
    public long contarRepositorios(UUID usuarioId) {
        return repositorioRepository.countByUsuarioId(usuarioId);
    }

    @Transactional(readOnly = true)
    public boolean repositorioRegistrado(UUID usuarioId, Long githubIdRepositorio) {
        return repositorioRepository.existsByUsuarioIdAndGithubIdRepositorio(usuarioId, githubIdRepositorio);
    }

    @Transactional(readOnly = true)
    public AnaliseDetalhe buscarDoUsuario(UUID usuarioId, UUID analiseId) {
        AnaliseProjeto analise = analiseRepository.findById(analiseId)
                .orElseThrow(() -> new AnaliseNaoEncontradaException(analiseId));
        RepositorioGithub repositorio = repositorioRepository.findById(analise.getRepositorioId())
                .filter(encontrado -> encontrado.getUsuarioId().equals(usuarioId))
                .orElseThrow(() -> new AnaliseNaoEncontradaException(analiseId));

        return paraDetalhe(analise, repositorio);
    }

    private AnaliseDetalhe paraDetalhe(AnaliseProjeto analise, RepositorioGithub repositorio) {
        return new AnaliseDetalhe(
                analise.getId(),
                analise.getStatus(),
                repositorio.getDono(),
                repositorio.getNome(),
                analise.getResultado(),
                analise.getContexto(),
                analise.getMensagemErro(),
                analise.getCriadoEm(),
                analise.getConcluidaEm());
    }
}
