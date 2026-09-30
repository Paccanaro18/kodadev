package com.koda.v1.challenge.persistence;

import com.koda.v1.challenge.ConteudoDesafio;
import com.koda.v1.challenge.SerializadorConteudo;
import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.selecao.UsoAnterior;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ConsultaDesafioTest {

    @Autowired
    private ConsultaDesafio consulta;

    @Autowired
    private RegistroDesafio registro;

    @Autowired
    private SerializadorConteudo serializador;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager entityManager;

    @Test
    void deveMontarOHistoricoSoComDesafiosProntosDoMaisRecenteParaOMaisAntigo() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID analiseA = DadosDeTeste.analise(jdbc, usuario);
        UUID analiseB = DadosDeTeste.analise(jdbc, usuario);
        criarPronto(usuario, analiseA, "ANGULO_1", "CLASSE:A", "p1", "Título 1", 30);
        criarPronto(usuario, analiseB, "ANGULO_2", "CLASSE:B", "p2", "Título 2", 20);
        criarPronto(usuario, analiseA, "ANGULO_3", "CLASSE:C", "p3", "Título 3", 10);
        UUID falhado = registro.registrarNovo(usuario, analiseA, TipoDesafio.BUG, "ANGULO_FALHO", "CLASSE:X", "p");
        registro.falhar(falhado, "erro");
        registro.registrarNovo(usuario, analiseA, TipoDesafio.BUG, "ANGULO_ABERTO", "CLASSE:Y", "p");

        List<UsoAnterior> historico = consulta.historicoDeUso(usuario, analiseA);

        assertThat(historico).containsExactly(
                new UsoAnterior("ANGULO_3", "CLASSE:C", true),
                new UsoAnterior("ANGULO_2", "CLASSE:B", false),
                new UsoAnterior("ANGULO_1", "CLASSE:A", true));
    }

    @Test
    void deveIncluirNoHistoricoAsCombinacoesAntigasDaMesmaAnaliseAlemDosCinquentaMaisRecentes() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID analiseAntiga = DadosDeTeste.analise(jdbc, usuario);
        UUID analiseNova = DadosDeTeste.analise(jdbc, usuario);
        criarPronto(usuario, analiseAntiga, "ANGULO_MUITO_ANTIGO", "CLASSE:ANTIGA", "p", "Muito antigo", 10_000);
        for (int i = 0; i < 52; i++) {
            criarPronto(usuario, analiseNova, "ANGULO_" + i, "CLASSE:" + i, "p", "Título " + i, 5_000 - i);
        }

        List<UsoAnterior> daAnaliseAntiga = consulta.historicoDeUso(usuario, analiseAntiga);

        assertThat(daAnaliseAntiga).hasSize(51);
        assertThat(daAnaliseAntiga).contains(new UsoAnterior("ANGULO_MUITO_ANTIGO", "CLASSE:ANTIGA", true));
        assertThat(daAnaliseAntiga.get(daAnaliseAntiga.size() - 1).anguloId()).isEqualTo("ANGULO_MUITO_ANTIGO");
    }

    @Test
    void deveDevolverTitulosEPerspectivasRecentesLimitadosESoDoProprioUsuario() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID outro = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);
        UUID analiseDoOutro = DadosDeTeste.analise(jdbc, outro);
        criarPronto(usuario, analise, "A1", "CLASSE:A", "perspectiva 1", "Título 1", 30);
        criarPronto(usuario, analise, "A2", "CLASSE:B", "perspectiva 2", "Título 2", 20);
        criarPronto(usuario, analise, "A3", "CLASSE:C", "perspectiva 3", "Título 3", 10);
        criarPronto(outro, analiseDoOutro, "A1", "CLASSE:A", "perspectiva do outro", "Título do outro", 5);

        assertThat(consulta.titulosRecentes(usuario, 10)).containsExactly("Título 3", "Título 2", "Título 1");
        assertThat(consulta.titulosRecentes(usuario, 2)).containsExactly("Título 3", "Título 2");
        assertThat(consulta.perspectivasRecentes(usuario, 2)).containsExactly("perspectiva 3", "perspectiva 2");
        assertThat(consulta.titulosRecentes(outro, 10)).containsExactly("Título do outro");
    }

    @Test
    void deveDevolverOsConteudosRecentesJaInterpretados() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);
        criarPronto(usuario, analise, "A1", "CLASSE:A", "p", "Primeiro", 20);
        criarPronto(usuario, analise, "A2", "CLASSE:B", "p", "Segundo", 10);

        List<ConteudoDesafio> conteudos = consulta.conteudosRecentes(usuario, 5);

        assertThat(conteudos).extracting(ConteudoDesafio::titulo).containsExactly("Segundo", "Primeiro");
        assertThat(conteudos.get(0).regrasDeNegocio()).containsExactly("Regra 1", "Regra 2");
        assertThat(consulta.conteudosRecentes(usuario, 1)).hasSize(1);
    }

    @Test
    void deveDevolverODesafioSoParaODonoComoSeOutroNaoExistisse() {
        UUID dono = DadosDeTeste.usuario(jdbc);
        UUID intruso = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, dono);
        UUID id = criarPronto(dono, analise, "A1", "CLASSE:A", "p", "Título", 5);

        DesafioDetalhe detalhe = consulta.buscarDoUsuario(dono, id);

        assertThat(detalhe.id()).isEqualTo(id);
        assertThat(detalhe.analiseId()).isEqualTo(analise);
        assertThat(detalhe.numero()).isEqualTo(1);
        assertThat(detalhe.statusGeracao()).isEqualTo(StatusGeracao.PRONTO);
        assertThat(detalhe.titulo()).isEqualTo("Título");
        assertThat(detalhe.conteudoJson()).contains("Título");
        assertThat(detalhe.modelo()).isEqualTo("modelo-teste");
        assertThatThrownBy(() -> consulta.buscarDoUsuario(intruso, id)).isInstanceOf(DesafioNaoEncontradoException.class);
        assertThatThrownBy(() -> consulta.buscarDoUsuario(dono, UUID.randomUUID()))
                .isInstanceOf(DesafioNaoEncontradoException.class);
    }

    @Test
    void deveListarOsDesafiosDaAnaliseDoMaisNovoParaOMaisAntigoComQualquerStatus() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID outro = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);
        UUID outraAnalise = DadosDeTeste.analise(jdbc, usuario);
        UUID analiseDoOutro = DadosDeTeste.analise(jdbc, outro);
        criarPronto(usuario, analise, "A1", "CLASSE:A", "p", "Primeiro", 30);
        UUID falhado = registro.registrarNovo(usuario, analise, TipoDesafio.BUG, "A2", "CLASSE:B", "p");
        registro.falhar(falhado, "erro de geração");
        criarPronto(usuario, outraAnalise, "A3", "CLASSE:C", "p", "De outra análise", 10);
        criarPronto(outro, analiseDoOutro, "A1", "CLASSE:A", "p", "De outro usuário", 5);
        UUID pendente = registro.registrarNovo(usuario, analise, TipoDesafio.FEATURE, "A4", "CLASSE:D", "p");

        List<DesafioResumo> lista = consulta.listarDaAnalise(usuario, analise);

        assertThat(lista).extracting(DesafioResumo::numero).containsExactly(4, 2, 1);
        assertThat(lista.get(0).id()).isEqualTo(pendente);
        assertThat(lista.get(0).statusGeracao()).isEqualTo(StatusGeracao.PENDENTE);
        assertThat(lista.get(1).statusGeracao()).isEqualTo(StatusGeracao.FALHOU);
        assertThat(lista.get(1).mensagemErro()).isEqualTo("erro de geração");
        assertThat(lista.get(2).titulo()).isEqualTo("Primeiro");
    }

    @Test
    void deveContarParaACotaSoOsQueGastaramRecursoDentroDaJanela() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID outro = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);
        UUID analiseDoOutro = DadosDeTeste.analise(jdbc, outro);
        criarPronto(usuario, analise, "A1", "CLASSE:A", "p", "Recente 1", 60);
        criarPronto(usuario, analise, "A2", "CLASSE:B", "p", "Recente 2", 600);
        criarPronto(usuario, analise, "A3", "CLASSE:C", "p", "Fora da janela", 60 * 30);
        UUID falhado = registro.registrarNovo(usuario, analise, TipoDesafio.BUG, "A4", "CLASSE:D", "p");
        registro.falhar(falhado, "erro");
        registro.registrarNovo(usuario, analise, TipoDesafio.BUG, "A5", "CLASSE:E", "p");
        criarPronto(outro, analiseDoOutro, "A1", "CLASSE:A", "p", "Do outro", 10);

        Instant desde = Instant.now().minusSeconds(24 * 3600);

        assertThat(consulta.contarQueGastaramCotaDesde(usuario, desde)).isEqualTo(3);
        assertThat(consulta.contarQueGastaramCotaDesde(outro, desde)).isEqualTo(1);
        assertThat(consulta.contarQueGastaramCotaDesde(usuario, Instant.now().plusSeconds(60))).isZero();
    }

    @Test
    void deveDevolverListasVaziasQuandoNaoHaNada() {
        UUID usuario = DadosDeTeste.usuario(jdbc);
        UUID analise = DadosDeTeste.analise(jdbc, usuario);

        assertThat(consulta.historicoDeUso(usuario, analise)).isEmpty();
        assertThat(consulta.titulosRecentes(usuario, 10)).isEmpty();
        assertThat(consulta.perspectivasRecentes(usuario, 10)).isEmpty();
        assertThat(consulta.conteudosRecentes(usuario, 10)).isEmpty();
        assertThat(consulta.listarDaAnalise(usuario, analise)).isEmpty();
    }

    private UUID criarPronto(UUID usuario, UUID analise, String angulo, String alvo, String perspectiva,
                             String titulo, int minutosAtras) {
        UUID id = registro.registrarNovo(usuario, analise, TipoDesafio.FEATURE, angulo, alvo, perspectiva);
        registro.iniciar(id);
        registro.concluir(id, titulo, serializador.paraJson(DadosDeTeste.conteudo(titulo)), 1, "modelo-teste");
        entityManager.flush();
        jdbc.update("UPDATE desafios SET criado_em = now() - make_interval(mins => ?) WHERE id = ?", minutosAtras, id);
        entityManager.clear();
        return id;
    }
}
