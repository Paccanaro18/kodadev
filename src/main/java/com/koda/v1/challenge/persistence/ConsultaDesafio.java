package com.koda.v1.challenge.persistence;

import com.koda.v1.challenge.ConteudoDesafio;
import com.koda.v1.challenge.SerializadorConteudo;
import com.koda.v1.challenge.selecao.UsoAnterior;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ConsultaDesafio {

    private static final List<StatusGeracao> STATUS_QUE_GASTAM_COTA =
            List.of(StatusGeracao.PENDENTE, StatusGeracao.EM_ANDAMENTO, StatusGeracao.PRONTO);

    private final DesafioRepository repository;
    private final SerializadorConteudo serializador;

    public ConsultaDesafio(DesafioRepository repository, SerializadorConteudo serializador) {
        this.repository = repository;
        this.serializador = serializador;
    }

    @Transactional(readOnly = true)
    public List<UsoAnterior> historicoDeUso(UUID usuarioId, UUID analiseId) {
        List<Desafio> recentes = repository
                .findTop50ByUsuarioIdAndStatusGeracaoOrderByCriadoEmDesc(usuarioId, StatusGeracao.PRONTO);
        Set<UUID> jaListados = new HashSet<>();
        List<UsoAnterior> historico = new ArrayList<>();

        for (Desafio desafio : recentes) {
            jaListados.add(desafio.getId());
            historico.add(paraUso(desafio, analiseId));
        }
        for (Desafio desafio : repository.findByUsuarioIdAndAnaliseIdAndStatusGeracaoOrderByCriadoEmDesc(
                usuarioId, analiseId, StatusGeracao.PRONTO)) {
            if (!jaListados.contains(desafio.getId())) {
                historico.add(paraUso(desafio, analiseId));
            }
        }
        return historico;
    }

    @Transactional(readOnly = true)
    public long contarQueGastaramCotaDesde(UUID usuarioId, Instant desde) {
        return repository.countByUsuarioIdAndStatusGeracaoInAndCriadoEmAfter(
                usuarioId, STATUS_QUE_GASTAM_COTA, desde);
    }

    @Transactional(readOnly = true)
    public List<String> titulosRecentes(UUID usuarioId, int limite) {
        return prontosRecentes(usuarioId, limite).stream().map(Desafio::getTitulo).toList();
    }

    @Transactional(readOnly = true)
    public List<String> perspectivasRecentes(UUID usuarioId, int limite) {
        return prontosRecentes(usuarioId, limite).stream().map(Desafio::getPerspectiva).toList();
    }

    @Transactional(readOnly = true)
    public List<ConteudoDesafio> conteudosRecentes(UUID usuarioId, int limite) {
        return prontosRecentes(usuarioId, limite).stream()
                .map(desafio -> serializador.deJson(desafio.getConteudo()))
                .toList();
    }

    @Transactional(readOnly = true)
    public DesafioDetalhe buscarDoUsuario(UUID usuarioId, UUID desafioId) {
        Desafio desafio = repository.findById(desafioId)
                .filter(encontrado -> encontrado.getUsuarioId().equals(usuarioId))
                .orElseThrow(() -> new DesafioNaoEncontradoException(desafioId));

        return new DesafioDetalhe(
                desafio.getId(), desafio.getAnaliseId(), desafio.getNumero(), desafio.getTipo(), desafio.getNivel(),
                desafio.getStatusGeracao(), desafio.getTitulo(), desafio.getConteudo(), desafio.getModelo(),
                desafio.getMensagemErro(), desafio.getCriadoEm(), desafio.getConcluidoEm(),
                desafio.getStatusProgresso(), desafio.getIniciadoEm(), desafio.getFinalizadoEm());
    }

    @Transactional(readOnly = true)
    public List<DesafioResumo> listarDaAnalise(UUID usuarioId, UUID analiseId) {
        return repository.findByUsuarioIdAndAnaliseIdOrderByNumeroDesc(usuarioId, analiseId).stream()
                .map(desafio -> new DesafioResumo(
                        desafio.getId(), desafio.getNumero(), desafio.getTipo(), desafio.getStatusGeracao(),
                        desafio.getStatusProgresso(), desafio.getTitulo(), desafio.getMensagemErro(),
                        desafio.getCriadoEm()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DesafioRecente> recentesDoUsuario(UUID usuarioId) {
        return repository.findTop10ByUsuarioIdOrderByCriadoEmDesc(usuarioId).stream()
                .map(desafio -> new DesafioRecente(
                        desafio.getId(), desafio.getAnaliseId(), desafio.getNumero(), desafio.getTipo(),
                        desafio.getStatusGeracao(), desafio.getStatusProgresso(), desafio.getTitulo(),
                        desafio.getConteudo(), desafio.getCriadoEm()))
                .toList();
    }

    @Transactional(readOnly = true)
    public long contarGerados(UUID usuarioId) {
        return repository.countByUsuarioIdAndStatusGeracao(usuarioId, StatusGeracao.PRONTO);
    }

    private List<Desafio> prontosRecentes(UUID usuarioId, int limite) {
        return repository.findTop50ByUsuarioIdAndStatusGeracaoOrderByCriadoEmDesc(usuarioId, StatusGeracao.PRONTO)
                .stream()
                .limit(limite)
                .toList();
    }

    private UsoAnterior paraUso(Desafio desafio, UUID analiseId) {
        return new UsoAnterior(desafio.getAnguloId(), desafio.getAlvoChave(), desafio.getAnaliseId().equals(analiseId));
    }
}
