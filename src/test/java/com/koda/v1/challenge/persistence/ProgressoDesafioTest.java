package com.koda.v1.challenge.persistence;

import com.koda.v1.challenge.TipoDesafio;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.function.Consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ProgressoDesafioTest {

    @Autowired
    private RegistroDesafio registro;

    @Autowired
    private DesafioRepository repository;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager entityManager;

    @Test
    void deveNascerNaoIniciadoSemDatas() {
        Desafio desafio = novo();

        assertThat(desafio.getStatusProgresso()).isEqualTo(StatusProgresso.NAO_INICIADO);
        assertThat(desafio.getIniciadoEm()).isNull();
        assertThat(desafio.getFinalizadoEm()).isNull();
    }

    @Test
    void deveSeguirOCaminhoNaoIniciadoEmAndamentoConcluidoEReabrir() {
        Desafio desafio = pronto();

        desafio.comecar();
        assertThat(desafio.getStatusProgresso()).isEqualTo(StatusProgresso.EM_ANDAMENTO);
        assertThat(desafio.getIniciadoEm()).isNotNull();
        assertThat(desafio.getFinalizadoEm()).isNull();

        desafio.finalizar();
        assertThat(desafio.getStatusProgresso()).isEqualTo(StatusProgresso.CONCLUIDO);
        assertThat(desafio.getFinalizadoEm()).isNotNull();

        var iniciadoEm = desafio.getIniciadoEm();
        desafio.reabrir();
        assertThat(desafio.getStatusProgresso()).isEqualTo(StatusProgresso.EM_ANDAMENTO);
        assertThat(desafio.getFinalizadoEm()).isNull();
        assertThat(desafio.getIniciadoEm()).isEqualTo(iniciadoEm);
    }

    @Test
    void deveRecusarCadaTransicaoForaDoCaminhoPermitido() {
        List<Consumer<Desafio>> acoes = List.of(Desafio::comecar, Desafio::finalizar, Desafio::reabrir);

        // Só uma ação é válida em cada estado de progresso de um ticket pronto.
        for (StatusProgresso estado : StatusProgresso.values()) {
            for (int i = 0; i < acoes.size(); i++) {
                Desafio desafio = levarPara(estado);
                boolean valida = (estado == StatusProgresso.NAO_INICIADO && i == 0)
                        || (estado == StatusProgresso.EM_ANDAMENTO && i == 1)
                        || (estado == StatusProgresso.CONCLUIDO && i == 2);
                Consumer<Desafio> acao = acoes.get(i);

                if (valida) {
                    acao.accept(desafio);
                } else {
                    assertThatThrownBy(() -> acao.accept(desafio))
                            .as("ação %d em %s", i, estado)
                            .isInstanceOf(TransicaoProgressoInvalidaException.class);
                    assertThat(desafio.getStatusProgresso()).isEqualTo(estado);
                }
            }
        }
    }

    @Test
    void deveRecusarProgressoEmTicketQueAindaNaoEstaPronto() {
        Desafio pendente = novo();
        Desafio emAndamento = novo();
        emAndamento.iniciar();
        Desafio falhou = novo();
        falhou.falhar("erro");

        for (Desafio desafio : List.of(pendente, emAndamento, falhou)) {
            assertThatThrownBy(desafio::comecar).isInstanceOf(TransicaoProgressoInvalidaException.class);
            assertThat(desafio.getStatusProgresso()).isEqualTo(StatusProgresso.NAO_INICIADO);
        }
    }

    @Test
    void devePersistirOProgressoEOReabrirLimpaAFinalizacao() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);
        UUID id = registro.registrarNovo(usuario, analise, TipoDesafio.FEATURE, "FEATURE_PAGINACAO", "x", "p");
        registro.iniciar(id);
        registro.concluir(id, "Título", "{\"a\":1}", 1, "m");
        entityManager.flush();

        Desafio desafio = repository.findById(id).orElseThrow();
        desafio.comecar();
        desafio.finalizar();
        entityManager.flush();
        entityManager.clear();

        Desafio lido = repository.findById(id).orElseThrow();
        assertThat(lido.getStatusProgresso()).isEqualTo(StatusProgresso.CONCLUIDO);
        assertThat(lido.getIniciadoEm()).isNotNull();
        assertThat(lido.getFinalizadoEm()).isNotNull();

        lido.reabrir();
        entityManager.flush();
        entityManager.clear();
        assertThat(repository.findById(id).orElseThrow().getFinalizadoEm()).isNull();
    }

    @Test
    void deveBarrarNoBancoUmStatusDeProgressoInventado() {
        UUID pronto = criarProntoNoBanco();

        assertBarrado("UPDATE desafios SET status_progresso = 'INVENTADO' WHERE id = ?", pronto);
    }

    @Test
    void deveBarrarNoBancoEmAndamentoSemDataDeInicio() {
        UUID pronto = criarProntoNoBanco();

        assertBarrado("UPDATE desafios SET status_progresso = 'EM_ANDAMENTO' WHERE id = ?", pronto);
    }

    @Test
    void deveBarrarNoBancoConcluidoSemDataDeFinalizacao() {
        UUID pronto = criarProntoNoBanco();

        assertBarrado("UPDATE desafios SET status_progresso = 'CONCLUIDO', iniciado_em = now() WHERE id = ?", pronto);
    }

    @Test
    void deveBarrarNoBancoNaoIniciadoComDataDeInicio() {
        UUID pronto = criarProntoNoBanco();

        assertBarrado("UPDATE desafios SET iniciado_em = now() WHERE id = ?", pronto);
    }

    @Test
    void deveBarrarNoBancoProgressoEmTicketQueNaoEstaPronto() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);
        UUID pendente = registro.registrarNovo(usuario, analise, TipoDesafio.BUG, "BUG_A", "CLASSE:A", "p");
        entityManager.flush();

        assertBarrado("UPDATE desafios SET status_progresso = 'EM_ANDAMENTO', iniciado_em = now() WHERE id = ?", pendente);
    }

    private void assertBarrado(String sql, UUID id) {
        assertThatThrownBy(() -> jdbc.update(sql, id)).isInstanceOf(DataIntegrityViolationException.class);
    }

    private UUID criarProntoNoBanco() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);
        UUID id = criarPronto(usuario, analise);
        entityManager.flush();
        return id;
    }

    private Desafio novo() {
        return new Desafio(UUID.randomUUID(), UUID.randomUUID(), 1, TipoDesafio.FEATURE,
                "FEATURE_PAGINACAO", "ENDPOINT:GET /pedidos", "a equipe financeira");
    }

    private Desafio pronto() {
        Desafio desafio = novo();
        desafio.iniciar();
        desafio.concluir("Título", "{}", 1, "modelo");
        return desafio;
    }

    private Desafio levarPara(StatusProgresso estado) {
        Desafio desafio = pronto();
        if (estado != StatusProgresso.NAO_INICIADO) {
            desafio.comecar();
        }
        if (estado == StatusProgresso.CONCLUIDO) {
            desafio.finalizar();
        }
        return desafio;
    }

    private UUID criarPronto(UUID usuario, UUID analise) {
        UUID id = registro.registrarNovo(usuario, analise, TipoDesafio.FEATURE, "FEATURE_PAGINACAO", "x", "p");
        registro.iniciar(id);
        registro.concluir(id, "Título", "{\"a\":1}", 1, "m");
        return id;
    }
}
