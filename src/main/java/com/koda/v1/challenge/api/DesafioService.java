package com.koda.v1.challenge.api;

import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.analyzer.persistence.AnaliseDetalhe;
import com.koda.v1.analyzer.persistence.ConsultaAnalise;
import com.koda.v1.analyzer.persistence.RepositorioArquivadoException;
import com.koda.v1.analyzer.persistence.StatusAnalise;
import com.koda.v1.challenge.SerializadorConteudo;
import com.koda.v1.challenge.geracao.ContextoIndisponivelException;
import com.koda.v1.challenge.geracao.FilaDeDesafiosCheiaException;
import com.koda.v1.challenge.geracao.IniciadorDesafio;
import com.koda.v1.challenge.persistence.ConsultaDesafio;
import com.koda.v1.challenge.persistence.DesafioDetalhe;
import com.koda.v1.challenge.persistence.GeracaoEmAndamentoException;
import com.koda.v1.challenge.persistence.RegistroDesafio;
import com.koda.v1.challenge.persistence.StatusGeracao;
import com.koda.v1.challenge.prompt.Perspectivas;
import com.koda.v1.challenge.selecao.SelecaoDeDesafio;
import com.koda.v1.challenge.selecao.SeletorDeDesafio;
import com.koda.v1.plano.CicloMensal;
import com.koda.v1.plano.PlanoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class DesafioService {

    static final Duration JANELA_DA_COTA = Duration.ofHours(24);
    static final int MAXIMO_DE_PERSPECTIVAS_RECENTES = 10;

    private final ConsultaAnalise consultaAnalise;
    private final SerializadorContexto serializadorContexto;
    private final ConsultaDesafio consulta;
    private final RegistroDesafio registro;
    private final SeletorDeDesafio seletor;
    private final Perspectivas perspectivas;
    private final IniciadorDesafio iniciador;
    private final SerializadorConteudo serializadorConteudo;
    private final PlanoService planos;
    private final int limiteDiario;
    private final Clock relogio;

    @Autowired
    public DesafioService(ConsultaAnalise consultaAnalise,
                          SerializadorContexto serializadorContexto,
                          ConsultaDesafio consulta,
                          RegistroDesafio registro,
                          SeletorDeDesafio seletor,
                          Perspectivas perspectivas,
                          IniciadorDesafio iniciador,
                          SerializadorConteudo serializadorConteudo,
                          PlanoService planos,
                          @Value("${koda.desafio.limite-diario:5}") int limiteDiario) {
        this(consultaAnalise, serializadorContexto, consulta, registro, seletor, perspectivas, iniciador,
                serializadorConteudo, planos, limiteDiario, Clock.systemUTC());
    }

    DesafioService(ConsultaAnalise consultaAnalise,
                   SerializadorContexto serializadorContexto,
                   ConsultaDesafio consulta,
                   RegistroDesafio registro,
                   SeletorDeDesafio seletor,
                   Perspectivas perspectivas,
                   IniciadorDesafio iniciador,
                   SerializadorConteudo serializadorConteudo,
                   PlanoService planos,
                   int limiteDiario,
                   Clock relogio) {
        if (limiteDiario <= 0) {
            throw new IllegalArgumentException("O limite diário de desafios deve ser positivo.");
        }
        this.consultaAnalise = consultaAnalise;
        this.serializadorContexto = serializadorContexto;
        this.consulta = consulta;
        this.registro = registro;
        this.seletor = seletor;
        this.perspectivas = perspectivas;
        this.iniciador = iniciador;
        this.serializadorConteudo = serializadorConteudo;
        this.planos = planos;
        this.limiteDiario = limiteDiario;
        this.relogio = relogio;
    }

    public DesafioResposta iniciar(UUID usuarioId, UUID analiseId, TipoPedido pedido) {
        ContextoProjeto contexto = carregarContextoPronto(usuarioId, analiseId);
        exigirRepositorioAtivo(usuarioId, analiseId);
        exigirCota(usuarioId);
        exigirCotaMensal(usuarioId);

        SelecaoDeDesafio selecao = seletor.selecionar(
                contexto, pedido.tipo(), consulta.historicoDeUso(usuarioId, analiseId));
        String perspectiva = perspectivas.escolher(
                consulta.perspectivasRecentes(usuarioId, MAXIMO_DE_PERSPECTIVAS_RECENTES));

        UUID desafioId = registrar(usuarioId, analiseId, selecao, perspectiva);

        try {
            iniciador.disparar(desafioId);
        } catch (FilaDeDesafiosCheiaException e) {
            registro.falhar(desafioId, e.getMessage());
            throw e;
        }
        return new DesafioResposta(desafioId, StatusGeracao.PENDENTE);
    }

    public DesafioDetalheResposta consultar(UUID usuarioId, UUID desafioId) {
        DesafioDetalhe detalhe = consulta.buscarDoUsuario(usuarioId, desafioId);

        return new DesafioDetalheResposta(
                detalhe.id(),
                detalhe.analiseId(),
                detalhe.numero(),
                codigoDe(detalhe.numero()),
                detalhe.tipo(),
                detalhe.nivel(),
                detalhe.statusGeracao(),
                detalhe.titulo(),
                detalhe.conteudoJson() == null ? null : serializadorConteudo.deJson(detalhe.conteudoJson()),
                detalhe.mensagemErro(),
                detalhe.criadoEm(),
                detalhe.concluidoEm(),
                detalhe.statusProgresso(),
                detalhe.iniciadoEm(),
                detalhe.finalizadoEm());
    }

    public List<DesafioResumoResposta> listar(UUID usuarioId, UUID analiseId) {
        consultaAnalise.buscarDoUsuario(usuarioId, analiseId);

        return consulta.listarDaAnalise(usuarioId, analiseId).stream()
                .map(resumo -> new DesafioResumoResposta(
                        resumo.id(), resumo.numero(), codigoDe(resumo.numero()), resumo.tipo(),
                        resumo.statusGeracao(), resumo.statusProgresso(), resumo.titulo(), resumo.mensagemErro(),
                        resumo.criadoEm()))
                .toList();
    }

    public DesafiosRecentesResposta recentes(UUID usuarioId) {
        List<DesafioRecenteResposta> recentes = consulta.recentesDoUsuario(usuarioId).stream()
                .map(recente -> new DesafioRecenteResposta(
                        recente.id(), recente.analiseId(), recente.numero(), codigoDe(recente.numero()),
                        recente.tipo(), recente.statusGeracao(), recente.statusProgresso(), recente.titulo(),
                        habilidadesDe(recente.conteudoJson()), recente.criadoEm()))
                .toList();

        long cotaUsada = consulta.contarQueGastaramCotaDesde(usuarioId, relogio.instant().minus(JANELA_DA_COTA));

        return new DesafiosRecentesResposta(consulta.contarGerados(usuarioId), cotaUsada, limiteDiario, recentes);
    }

    private List<String> habilidadesDe(String conteudoJson) {
        return conteudoJson == null ? List.of() : serializadorConteudo.deJson(conteudoJson).habilidades();
    }

    private ContextoProjeto carregarContextoPronto(UUID usuarioId, UUID analiseId) {
        AnaliseDetalhe analise = consultaAnalise.buscarDoUsuario(usuarioId, analiseId);
        if (analise.status() != StatusAnalise.CONCLUIDA || analise.contextoJson() == null) {
            throw new ContextoIndisponivelException();
        }
        return serializadorContexto.deJson(analise.contextoJson());
    }

    private void exigirCota(UUID usuarioId) {
        Instant desde = relogio.instant().minus(JANELA_DA_COTA);
        if (consulta.contarQueGastaramCotaDesde(usuarioId, desde) >= limiteDiario) {
            throw new LimiteDiarioExcedidoException(limiteDiario);
        }
    }

    private void exigirRepositorioAtivo(UUID usuarioId, UUID analiseId) {
        if (consultaAnalise.repositorioArquivado(usuarioId, analiseId)) {
            throw new RepositorioArquivadoException();
        }
    }

    private void exigirCotaMensal(UUID usuarioId) {
        CicloMensal ciclo = CicloMensal.contendo(relogio.instant());
        planos.exigirTicket(usuarioId, consulta.contarQueGastaramCotaDesde(usuarioId, ciclo.inicio()), ciclo);
    }

    private UUID registrar(UUID usuarioId, UUID analiseId, SelecaoDeDesafio selecao, String perspectiva) {
        try {
            return registro.registrarNovo(usuarioId, analiseId, selecao.tipo(),
                    selecao.angulo().id(), selecao.alvo().chave(), perspectiva);
        } catch (DataIntegrityViolationException e) {
            throw new GeracaoEmAndamentoException();
        }
    }

    private String codigoDe(int numero) {
        return String.format("DEV-%03d", numero);
    }
}
