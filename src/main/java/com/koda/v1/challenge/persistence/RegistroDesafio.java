package com.koda.v1.challenge.persistence;

import com.koda.v1.challenge.TipoDesafio;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class RegistroDesafio {

    private static final List<StatusGeracao> STATUS_EM_ABERTO =
            List.of(StatusGeracao.PENDENTE, StatusGeracao.EM_ANDAMENTO);

    private final DesafioRepository repository;

    public RegistroDesafio(DesafioRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public UUID registrarNovo(UUID usuarioId, UUID analiseId, TipoDesafio tipo,
                              String anguloId, String alvoChave, String perspectiva) {
        if (repository.existsByUsuarioIdAndStatusGeracaoIn(usuarioId, STATUS_EM_ABERTO)) {
            throw new GeracaoEmAndamentoException();
        }
        int numero = repository.maiorNumeroDoUsuario(usuarioId) + 1;

        return repository.saveAndFlush(
                new Desafio(usuarioId, analiseId, numero, tipo, anguloId, alvoChave, perspectiva)).getId();
    }

    @Transactional
    public DadosGeracao iniciar(UUID desafioId) {
        Desafio desafio = buscar(desafioId);
        desafio.iniciar();

        return new DadosGeracao(
                desafio.getId(), desafio.getUsuarioId(), desafio.getAnaliseId(), desafio.getTipo(),
                desafio.getAnguloId(), desafio.getAlvoChave(), desafio.getPerspectiva());
    }

    @Transactional
    public void reselecionar(UUID desafioId, String anguloId, String alvoChave, String perspectiva) {
        buscar(desafioId).reselecionar(anguloId, alvoChave, perspectiva);
    }

    @Transactional
    public void registrarTentativa(UUID desafioId) {
        buscar(desafioId).registrarTentativa();
    }

    @Transactional
    public void concluir(UUID desafioId, String titulo, String conteudoJson, int versaoEsquemaConteudo, String modelo) {
        buscar(desafioId).concluir(titulo, conteudoJson, versaoEsquemaConteudo, modelo);
    }

    @Transactional
    public void falhar(UUID desafioId, String mensagemErro) {
        buscar(desafioId).falhar(mensagemErro);
    }

    @Transactional
    public int falharGeracoesEmAberto(String mensagemErro) {
        List<Desafio> emAberto = repository.findAllByStatusGeracaoIn(STATUS_EM_ABERTO);
        emAberto.forEach(desafio -> desafio.falhar(mensagemErro));
        return emAberto.size();
    }

    private Desafio buscar(UUID desafioId) {
        return repository.findById(desafioId).orElseThrow(() -> new DesafioNaoEncontradoException(desafioId));
    }
}
