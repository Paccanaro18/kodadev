package com.koda.v1.challenge.persistence;

import com.koda.v1.challenge.TipoDesafio;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class RegistroProgressoTest {

    @Autowired
    private RegistroProgresso progresso;

    @Autowired
    private RegistroDesafio registro;

    @Autowired
    private EventoDesafioRepository eventos;

    @Autowired
    private DesafioRepository repository;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager entityManager;

    private UUID usuario;
    private UUID analise;
    private UUID desafio;

    @BeforeEach
    void preparar() {
        usuario = DadosDeTeste.usuario(jdbc);
        analise = DadosDeTeste.analise(jdbc, usuario);
        desafio = criarPronto(usuario, analise, "A");
        entityManager.flush();
    }

    @Test
    void deveRegistrarUmEventoParaCadaMudancaDeProgresso() {
        assertThat(progresso.mudar(usuario, desafio, StatusProgresso.EM_ANDAMENTO).status())
                .isEqualTo(StatusProgresso.EM_ANDAMENTO);
        ProgressoDesafio concluido = progresso.mudar(usuario, desafio, StatusProgresso.CONCLUIDO);
        assertThat(concluido.status()).isEqualTo(StatusProgresso.CONCLUIDO);
        assertThat(concluido.iniciadoEm()).isNotNull();
        assertThat(concluido.finalizadoEm()).isNotNull();
        ProgressoDesafio reaberto = progresso.mudar(usuario, desafio, StatusProgresso.EM_ANDAMENTO);
        assertThat(reaberto.finalizadoEm()).isNull();
        entityManager.flush();

        assertThat(tiposDoDesafio()).containsExactly(
                TipoEvento.DESAFIO_PRONTO, TipoEvento.PROGRESSO_INICIADO,
                TipoEvento.PROGRESSO_CONCLUIDO, TipoEvento.PROGRESSO_REABERTO);
    }

    @Test
    void deveSerIdempotenteQuandoOStatusPedidoJaEOAtualSemRepetirEvento() {
        progresso.mudar(usuario, desafio, StatusProgresso.EM_ANDAMENTO);
        progresso.mudar(usuario, desafio, StatusProgresso.EM_ANDAMENTO);
        entityManager.flush();

        assertThat(tiposDoDesafio()).containsExactly(TipoEvento.DESAFIO_PRONTO, TipoEvento.PROGRESSO_INICIADO);
    }

    @Test
    void deveRecusarPularEtapasOuVoltarParaNaoIniciadoSemGravarEvento() {
        assertThatThrownBy(() -> progresso.mudar(usuario, desafio, StatusProgresso.CONCLUIDO))
                .isInstanceOf(TransicaoProgressoInvalidaException.class);

        progresso.mudar(usuario, desafio, StatusProgresso.EM_ANDAMENTO);
        assertThatThrownBy(() -> progresso.mudar(usuario, desafio, StatusProgresso.NAO_INICIADO))
                .isInstanceOf(TransicaoProgressoInvalidaException.class);
        entityManager.flush();

        assertThat(tiposDoDesafio()).containsExactly(TipoEvento.DESAFIO_PRONTO, TipoEvento.PROGRESSO_INICIADO);
    }

    @Test
    void deveRecusarProgressoEmTicketQueNaoEstaPronto() {
        UUID outraAnalise = DadosDeTeste.analise(jdbc, usuario);
        UUID pendente = registro.registrarNovo(usuario, outraAnalise, TipoDesafio.BUG, "BUG_A", "CLASSE:A", "p");
        entityManager.flush();

        assertThatThrownBy(() -> progresso.mudar(usuario, pendente, StatusProgresso.EM_ANDAMENTO))
                .isInstanceOf(TransicaoProgressoInvalidaException.class);
    }

    @Test
    void deveTratarTicketDeOutroUsuarioComoInexistenteESemTocarNele() {
        UUID intruso = DadosDeTeste.usuario(jdbc);

        assertThatThrownBy(() -> progresso.mudar(intruso, desafio, StatusProgresso.EM_ANDAMENTO))
                .isInstanceOf(DesafioNaoEncontradoException.class);
        assertThatThrownBy(() -> progresso.mudar(usuario, UUID.randomUUID(), StatusProgresso.EM_ANDAMENTO))
                .isInstanceOf(DesafioNaoEncontradoException.class);
        entityManager.clear();

        assertThat(repository.findById(desafio).orElseThrow().getStatusProgresso())
                .isEqualTo(StatusProgresso.NAO_INICIADO);
    }

    @Test
    void deveRegistrarEventoQuandoAGeracaoFalhaEQuandoFicaEmAbertoAoSubir() {
        UUID falhou = registro.registrarNovo(usuario, analise, TipoDesafio.BUG, "BUG_B", "CLASSE:B", "p");
        registro.falhar(falhou, "erro");
        UUID emAberto = registro.registrarNovo(usuario, analise, TipoDesafio.BUG, "BUG_C", "CLASSE:C", "p");
        registro.iniciar(emAberto);
        registro.falharGeracoesEmAberto("reinício");
        entityManager.flush();

        assertThat(eventos.findByDesafioIdOrderByCriadoEmAsc(falhou))
                .extracting(EventoDesafio::getTipo).containsExactly(TipoEvento.DESAFIO_FALHOU);
        assertThat(eventos.findByDesafioIdOrderByCriadoEmAsc(emAberto))
                .extracting(EventoDesafio::getTipo).containsExactly(TipoEvento.DESAFIO_FALHOU);
    }

    private List<TipoEvento> tiposDoDesafio() {
        return eventos.findByDesafioIdOrderByCriadoEmAsc(desafio).stream().map(EventoDesafio::getTipo).toList();
    }

    private UUID criarPronto(UUID dono, UUID daAnalise, String sufixo) {
        UUID id = registro.registrarNovo(dono, daAnalise, TipoDesafio.FEATURE, "FEATURE_" + sufixo, "CLASSE:" + sufixo, "p");
        registro.iniciar(id);
        registro.concluir(id, "Título " + sufixo, "{\"a\":1}", 1, "m");
        return id;
    }
}
