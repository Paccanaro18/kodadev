package com.koda.v1.challenge.persistence;

import com.koda.v1.challenge.NivelDesafio;
import com.koda.v1.challenge.TipoDesafio;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class RegistroDesafioTest {

    @Autowired
    private RegistroDesafio registro;

    @Autowired
    private DesafioRepository repository;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager entityManager;

    @Test
    void deveRegistrarUmDesafioPendenteComNumeroUmENivelJunior() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);

        UUID id = registro.registrarNovo(usuario, analise, TipoDesafio.FEATURE,
                "FEATURE_PAGINACAO", "ENDPOINT:GET /pedidos", "a equipe financeira");
        entityManager.clear();

        Desafio lido = repository.findById(id).orElseThrow();
        assertThat(lido.getStatusGeracao()).isEqualTo(StatusGeracao.PENDENTE);
        assertThat(lido.getNumero()).isEqualTo(1);
        assertThat(lido.getNivel()).isEqualTo(NivelDesafio.JUNIOR);
        assertThat(lido.getTipo()).isEqualTo(TipoDesafio.FEATURE);
        assertThat(lido.getAnguloId()).isEqualTo("FEATURE_PAGINACAO");
        assertThat(lido.getAlvoChave()).isEqualTo("ENDPOINT:GET /pedidos");
        assertThat(lido.getPerspectiva()).isEqualTo("a equipe financeira");
        assertThat(lido.getTentativas()).isZero();
    }

    @Test
    void deveNumerarEmSequenciaPorUsuarioSemMisturarUsuarios() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID outro = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);
        UUID analiseDoOutro = DadosDeTeste.analise(jdbc, outro);

        UUID primeiro = registro.registrarNovo(usuario, analise, TipoDesafio.BUG, "BUG_A", "CLASSE:A", "p");
        registro.falhar(primeiro, "erro");
        UUID segundo = registro.registrarNovo(usuario, analise, TipoDesafio.BUG, "BUG_B", "CLASSE:B", "p");
        registro.falhar(segundo, "erro");
        UUID terceiro = registro.registrarNovo(usuario, analise, TipoDesafio.BUG, "BUG_C", "CLASSE:C", "p");
        UUID doOutro = registro.registrarNovo(outro, analiseDoOutro, TipoDesafio.BUG, "BUG_A", "CLASSE:A", "p");

        assertThat(numeroDe(primeiro)).isEqualTo(1);
        assertThat(numeroDe(segundo)).isEqualTo(2);
        assertThat(numeroDe(terceiro)).isEqualTo(3);
        assertThat(numeroDe(doOutro)).isEqualTo(1);
    }

    @Test
    void naoDeveRegistrarOutroEnquantoHouverUmaGeracaoEmAbertoDoMesmoUsuario() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID outro = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);
        UUID outraAnalise = DadosDeTeste.analise(jdbc, usuario);
        UUID analiseDoOutro = DadosDeTeste.analise(jdbc, outro);
        registro.registrarNovo(usuario, analise, TipoDesafio.TESTING, "TESTING_A", "CLASSE:A", "p");

        assertThatThrownBy(() -> registro.registrarNovo(
                usuario, outraAnalise, TipoDesafio.FEATURE, "FEATURE_A", "CLASSE:B", "p"))
                .isInstanceOf(GeracaoEmAndamentoException.class);
        assertThat(registro.registrarNovo(outro, analiseDoOutro, TipoDesafio.TESTING, "TESTING_A", "CLASSE:A", "p"))
                .isNotNull();
    }

    @Test
    void devePermitirUmNovoDepoisDeConcluirOuDeFalhar() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);
        UUID primeiro = registro.registrarNovo(usuario, analise, TipoDesafio.BUG, "BUG_A", "CLASSE:A", "p");
        registro.iniciar(primeiro);
        registro.concluir(primeiro, "Título", "{}", 1, "m");

        UUID segundo = registro.registrarNovo(usuario, analise, TipoDesafio.BUG, "BUG_B", "CLASSE:B", "p");
        registro.falhar(segundo, "erro");

        assertThat(registro.registrarNovo(usuario, analise, TipoDesafio.BUG, "BUG_C", "CLASSE:C", "p")).isNotNull();
    }

    @Test
    void deveBarrarNoBancoDuasGeracoesEmAbertoDoMesmoUsuario() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);
        inserir(usuario, analise, 1, "BUG", "PENDENTE", "NULL", "NULL");

        assertThatThrownBy(() -> inserir(usuario, analise, 2, "BUG", "EM_ANDAMENTO", "NULL", "NULL"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deveIniciarDevolvendoOsDadosParaGerarEMarcandoEmAndamento() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);
        UUID id = registro.registrarNovo(usuario, analise, TipoDesafio.TESTING, "TESTING_A", "CLASSE:A", "perspectiva");

        DadosGeracao dados = registro.iniciar(id);

        assertThat(dados).isEqualTo(new DadosGeracao(
                id, usuario, analise, TipoDesafio.TESTING, "TESTING_A", "CLASSE:A", "perspectiva"));
        assertThat(statusDe(id)).isEqualTo(StatusGeracao.EM_ANDAMENTO);
        assertThatThrownBy(() -> registro.iniciar(id)).isInstanceOf(TransicaoDesafioInvalidaException.class);
    }

    @Test
    void deveReselecionarGravandoOsNovosValoresNoBanco() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID id = registro.registrarNovo(usuario, DadosDeTeste.analise(jdbc, usuario),
                TipoDesafio.FEATURE, "FEATURE_A", "CLASSE:A", "perspectiva antiga");
        registro.iniciar(id);

        registro.reselecionar(id, "FEATURE_B", "CLASSE:B", "perspectiva nova");
        entityManager.flush();
        entityManager.clear();

        Desafio lido = repository.findById(id).orElseThrow();
        assertThat(lido.getAnguloId()).isEqualTo("FEATURE_B");
        assertThat(lido.getAlvoChave()).isEqualTo("CLASSE:B");
        assertThat(lido.getPerspectiva()).isEqualTo("perspectiva nova");
        assertThatThrownBy(() -> registro.reselecionar(UUID.randomUUID(), "A", "B", "C"))
                .isInstanceOf(DesafioNaoEncontradoException.class);
    }

    @Test
    void deveContarTentativasSoEmAndamento() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID id = registro.registrarNovo(usuario, DadosDeTeste.analise(jdbc, usuario),
                TipoDesafio.BUG, "BUG_A", "CLASSE:A", "p");

        assertThatThrownBy(() -> registro.registrarTentativa(id)).isInstanceOf(TransicaoDesafioInvalidaException.class);
        registro.iniciar(id);
        registro.registrarTentativa(id);
        registro.registrarTentativa(id);
        entityManager.flush();
        entityManager.clear();

        assertThat(repository.findById(id).orElseThrow().getTentativas()).isEqualTo(2);
    }

    @Test
    void deveConcluirGravandoOConteudoComoJsonDeVerdade() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID id = registro.registrarNovo(usuario, DadosDeTeste.analise(jdbc, usuario),
                TipoDesafio.FEATURE, "FEATURE_A", "CLASSE:A", "p");
        registro.iniciar(id);

        registro.concluir(id, "Adicionar filtro", "{\"titulo\":\"Adicionar filtro\"}", 1, "groq/llama-3");
        entityManager.flush();
        entityManager.clear();

        Desafio lido = repository.findById(id).orElseThrow();
        assertThat(lido.getStatusGeracao()).isEqualTo(StatusGeracao.PRONTO);
        assertThat(lido.getTitulo()).isEqualTo("Adicionar filtro");
        assertThat(lido.getModelo()).isEqualTo("groq/llama-3");
        assertThat(lido.getVersaoEsquemaConteudo()).isEqualTo(1);
        assertThat(lido.getConcluidoEm()).isNotNull();
        assertThat(jdbc.queryForObject("SELECT jsonb_typeof(conteudo) FROM desafios WHERE id = ?", String.class, id))
                .isEqualTo("object");
        assertThat(jdbc.queryForObject("SELECT conteudo ->> 'titulo' FROM desafios WHERE id = ?", String.class, id))
                .isEqualTo("Adicionar filtro");
    }

    @Test
    void deveFalharGravandoAMensagemEnaoDeixarConcluirDepois() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID id = registro.registrarNovo(usuario, DadosDeTeste.analise(jdbc, usuario),
                TipoDesafio.BUG, "BUG_A", "CLASSE:A", "p");

        registro.falhar(id, "O provedor de IA não respondeu.");
        entityManager.flush();
        entityManager.clear();

        Desafio lido = repository.findById(id).orElseThrow();
        assertThat(lido.getStatusGeracao()).isEqualTo(StatusGeracao.FALHOU);
        assertThat(lido.getMensagemErro()).isEqualTo("O provedor de IA não respondeu.");
        assertThatThrownBy(() -> registro.concluir(id, "T", "{}", 1, null))
                .isInstanceOf(TransicaoDesafioInvalidaException.class);
    }

    @Test
    void deveRecusarDesafioInexistente() {
        UUID inexistente = UUID.randomUUID();

        assertThatThrownBy(() -> registro.iniciar(inexistente)).isInstanceOf(DesafioNaoEncontradoException.class);
        assertThatThrownBy(() -> registro.registrarTentativa(inexistente)).isInstanceOf(DesafioNaoEncontradoException.class);
        assertThatThrownBy(() -> registro.concluir(inexistente, "T", "{}", 1, null))
                .isInstanceOf(DesafioNaoEncontradoException.class);
        assertThatThrownBy(() -> registro.falhar(inexistente, "x")).isInstanceOf(DesafioNaoEncontradoException.class);
    }

    @Test
    void deveFalharSoAsGeracoesEmAberto() {
        UUID usuarioA = DadosDeTeste.usuario(jdbc);
        UUID usuarioB = DadosDeTeste.usuario(jdbc);
        UUID usuarioC = DadosDeTeste.usuario(jdbc);
        UUID pendente = registro.registrarNovo(usuarioA, DadosDeTeste.analise(jdbc, usuarioA),
                TipoDesafio.BUG, "BUG_A", "CLASSE:A", "p");
        UUID emAndamento = registro.registrarNovo(usuarioB, DadosDeTeste.analise(jdbc, usuarioB),
                TipoDesafio.BUG, "BUG_A", "CLASSE:A", "p");
        registro.iniciar(emAndamento);
        UUID pronto = registro.registrarNovo(usuarioC, DadosDeTeste.analise(jdbc, usuarioC),
                TipoDesafio.BUG, "BUG_A", "CLASSE:A", "p");
        registro.iniciar(pronto);
        registro.concluir(pronto, "T", "{}", 1, null);

        int total = registro.falharGeracoesEmAberto("interrompida");

        assertThat(total).isGreaterThanOrEqualTo(2);
        assertThat(statusDe(pendente)).isEqualTo(StatusGeracao.FALHOU);
        assertThat(statusDe(emAndamento)).isEqualTo(StatusGeracao.FALHOU);
        assertThat(statusDe(pronto)).isEqualTo(StatusGeracao.PRONTO);
    }

    @Test
    void deveBarrarNoBancoValoresForaDoPermitido() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);

        assertThatThrownBy(() -> inserir(usuario, analise, 0, "BUG", "FALHOU", "NULL", "NULL"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deveBarrarNoBancoTipoInvalido() {
        UUID usuario = DadosDeTeste.usuario(jdbc);

        assertThatThrownBy(() -> inserir(usuario, DadosDeTeste.analise(jdbc, usuario), 1, "REFACTOR", "FALHOU", "NULL", "NULL"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deveBarrarNoBancoStatusInvalido() {
        UUID usuario = DadosDeTeste.usuario(jdbc);

        assertThatThrownBy(() -> inserir(usuario, DadosDeTeste.analise(jdbc, usuario), 1, "BUG", "CONCLUIDO", "NULL", "NULL"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deveBarrarNoBancoConteudoSemVersao() {
        UUID usuario = DadosDeTeste.usuario(jdbc);

        assertThatThrownBy(() -> inserir(usuario, DadosDeTeste.analise(jdbc, usuario), 1, "BUG", "FALHOU", "'{}'::jsonb", "NULL"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deveBarrarNoBancoVersaoSemConteudo() {
        UUID usuario = DadosDeTeste.usuario(jdbc);

        assertThatThrownBy(() -> inserir(usuario, DadosDeTeste.analise(jdbc, usuario), 1, "BUG", "FALHOU", "NULL", "1"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deveBarrarNoBancoProntoSemConteudo() {
        UUID usuario = DadosDeTeste.usuario(jdbc);

        assertThatThrownBy(() -> inserir(usuario, DadosDeTeste.analise(jdbc, usuario), 1, "BUG", "PRONTO", "NULL", "NULL"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deveBarrarNoBancoNumeroRepetidoParaOMesmoUsuario() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);
        inserir(usuario, analise, 1, "BUG", "FALHOU", "NULL", "NULL");

        assertThatThrownBy(() -> inserir(usuario, analise, 1, "BUG", "FALHOU", "NULL", "NULL"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private int numeroDe(UUID id) {
        entityManager.flush();
        entityManager.clear();
        return repository.findById(id).orElseThrow().getNumero();
    }

    private StatusGeracao statusDe(UUID id) {
        entityManager.flush();
        entityManager.clear();
        return repository.findById(id).orElseThrow().getStatusGeracao();
    }

    private void inserir(UUID usuario, UUID analise, int numero, String tipo, String status,
                         String conteudoSql, String versaoSql) {
        jdbc.update("INSERT INTO desafios (usuario_id, analise_id, numero, tipo, status_geracao, angulo_id, "
                        + "alvo_chave, perspectiva, conteudo, versao_esquema_conteudo) "
                        + "VALUES (?, ?, ?, ?, ?, 'ANGULO', 'CLASSE:A', 'p', " + conteudoSql + ", " + versaoSql + ")",
                usuario, analise, numero, tipo, status);
    }
}
