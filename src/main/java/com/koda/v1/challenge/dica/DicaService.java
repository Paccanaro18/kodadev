package com.koda.v1.challenge.dica;

import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.challenge.ConteudoDesafio;
import com.koda.v1.challenge.ConteudoInvalidoException;
import com.koda.v1.challenge.SerializadorConteudo;
import com.koda.v1.challenge.VerificadorConteudo;
import com.koda.v1.challenge.geracao.CarregadorContexto;
import com.koda.v1.challenge.geracao.ContextoIndisponivelException;
import com.koda.v1.challenge.ia.MotivoFalhaIa;
import com.koda.v1.challenge.ia.ProvedorIa;
import com.koda.v1.challenge.ia.ProvedorIaException;
import com.koda.v1.challenge.ia.RespostaIa;
import com.koda.v1.challenge.persistence.ConsultaDesafio;
import com.koda.v1.challenge.persistence.DesafioDetalhe;
import com.koda.v1.challenge.persistence.StatusGeracao;
import com.koda.v1.challenge.persistence.StatusProgresso;
import com.koda.v1.challenge.prompt.PromptDesafio;
import com.koda.v1.challenge.validacao.MotivoReprovacao;
import com.koda.v1.challenge.validacao.ValidadorDesafio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Gera dicas de um ticket sob demanda. A dica só existe (e só gasta cota) depois de passar pelo verificador e pelo
 * validador anti-solução; se a IA falhar, nada é gravado e nada é cobrado.
 */
@Service
public class DicaService {

    static final Duration JANELA_DA_COTA = Duration.ofHours(24);
    static final int MAXIMO_DE_CHAMADAS = 2;
    static final int TAMANHO_MAXIMO_DA_DICA = 500;

    static final String MENSAGEM_NAO_GERADA = "Não conseguimos gerar uma dica agora. Tente novamente em instantes.";
    static final String MENSAGEM_SO_EM_ANDAMENTO = "As dicas ficam disponíveis enquanto você está resolvendo o desafio.";
    static final String MENSAGEM_JA_GERANDO = "Já estamos gerando uma dica para este desafio.";
    static final String MENSAGEM_CONFLITO = "Esta dica já foi gerada. Atualize a página.";

    private static final Logger LOG = LoggerFactory.getLogger(DicaService.class);

    private final ConsultaDesafio consulta;
    private final CarregadorContexto carregador;
    private final SerializadorConteudo serializador;
    private final MontadorPromptDica montador;
    private final ProvedorIa provedor;
    private final VerificadorConteudo verificador;
    private final ValidadorDesafio validador;
    private final DicaRepository dicas;
    private final RegistroDica registro;
    private final int limiteDiario;
    private final Clock relogio;
    private final Set<UUID> gerando = ConcurrentHashMap.newKeySet();

    @Autowired
    public DicaService(ConsultaDesafio consulta, CarregadorContexto carregador, SerializadorConteudo serializador,
                       MontadorPromptDica montador, ProvedorIa provedor, VerificadorConteudo verificador,
                       ValidadorDesafio validador, DicaRepository dicas, RegistroDica registro,
                       @Value("${koda.dica.limite-diario:10}") int limiteDiario) {
        this(consulta, carregador, serializador, montador, provedor, verificador, validador, dicas, registro,
                limiteDiario, Clock.systemUTC());
    }

    DicaService(ConsultaDesafio consulta, CarregadorContexto carregador, SerializadorConteudo serializador,
                MontadorPromptDica montador, ProvedorIa provedor, VerificadorConteudo verificador,
                ValidadorDesafio validador, DicaRepository dicas, RegistroDica registro, int limiteDiario,
                Clock relogio) {
        if (limiteDiario <= 0) {
            throw new IllegalArgumentException("O limite diário de dicas deve ser positivo.");
        }
        this.consulta = consulta;
        this.carregador = carregador;
        this.serializador = serializador;
        this.montador = montador;
        this.provedor = provedor;
        this.verificador = verificador;
        this.validador = validador;
        this.dicas = dicas;
        this.registro = registro;
        this.limiteDiario = limiteDiario;
        this.relogio = relogio;
    }

    public DicasResposta listar(UUID usuarioId, UUID desafioId) {
        consulta.buscarDoUsuario(usuarioId, desafioId);

        return new DicasResposta(doDesafio(desafioId), Dica.NIVEL_MAXIMO, usadasHoje(usuarioId), limiteDiario);
    }

    public DicaResposta pedir(UUID usuarioId, UUID desafioId) {
        DesafioDetalhe desafio = consulta.buscarDoUsuario(usuarioId, desafioId);
        if (desafio.statusGeracao() != StatusGeracao.PRONTO || desafio.statusProgresso() != StatusProgresso.EM_ANDAMENTO) {
            throw new DicaIndisponivelException(MENSAGEM_SO_EM_ANDAMENTO);
        }
        List<DicaResposta> anteriores = doDesafio(desafioId);
        if (anteriores.size() >= Dica.NIVEL_MAXIMO) {
            throw new LimiteDeDicasDoDesafioException();
        }
        if (usadasHoje(usuarioId) >= limiteDiario) {
            throw new LimiteDiarioDeDicasExcedidoException(limiteDiario);
        }
        if (!gerando.add(desafioId)) {
            throw new DicaIndisponivelException(MENSAGEM_JA_GERANDO);
        }

        try {
            return gerarEGravar(usuarioId, desafio, anteriores);
        } finally {
            gerando.remove(desafioId);
        }
    }

    private DicaResposta gerarEGravar(UUID usuarioId, DesafioDetalhe desafio, List<DicaResposta> anteriores) {
        ContextoProjeto contexto;
        try {
            contexto = carregador.carregar(usuarioId, desafio.analiseId());
        } catch (ContextoIndisponivelException e) {
            throw new DicaNaoGeradaException(MENSAGEM_NAO_GERADA);
        }
        ConteudoDesafio ticket = serializador.deJson(desafio.conteudoJson());
        int nivel = anteriores.size() + 1;
        List<String> textosAnteriores = anteriores.stream().map(DicaResposta::texto).toList();

        Aprovada aprovada = gerar(ticket, contexto, nivel, textosAnteriores);
        try {
            Dica gravada = registro.registrar(usuarioId, desafio.id(), nivel, aprovada.texto(), aprovada.modelo());
            return new DicaResposta(gravada.getNivel(), gravada.getTexto(), gravada.getCriadoEm());
        } catch (DataIntegrityViolationException e) {
            throw new DicaIndisponivelException(MENSAGEM_CONFLITO);
        }
    }

    private Aprovada gerar(ConteudoDesafio ticket, ContextoProjeto contexto, int nivel, List<String> anteriores) {
        List<MotivoReprovacao> correcoes = List.of();

        for (int chamada = 1; chamada <= MAXIMO_DE_CHAMADAS; chamada++) {
            PromptDesafio prompt = montador.montar(ticket, contexto, nivel, anteriores, correcoes);
            RespostaIa resposta;
            try {
                resposta = provedor.gerar(prompt);
            } catch (ProvedorIaException e) {
                if (e.getMotivo() == MotivoFalhaIa.INDISPONIVEL
                        || e.getMotivo() == MotivoFalhaIa.RESPOSTA_INVALIDA
                        || e.getMotivo() == MotivoFalhaIa.RESPOSTA_GRANDE_DEMAIS) {
                    LOG.info("Dica: tentativa descartada, motivo={}", e.getMotivo());
                    continue;
                }
                throw new DicaNaoGeradaException(e.getMessage());
            }

            String texto;
            try {
                texto = verificador.verificarTexto(resposta.texto(), "dica", TAMANHO_MAXIMO_DA_DICA);
            } catch (ConteudoInvalidoException e) {
                LOG.info("Dica: tentativa descartada, conteudo invalido: {}", e.getMessage());
                continue;
            }

            correcoes = validador.validarDica(texto, contexto);
            if (correcoes.isEmpty()) {
                return new Aprovada(texto, resposta.modelo());
            }
            LOG.info("Dica: tentativa descartada, reprovada na validacao: {}", correcoes);
        }
        throw new DicaNaoGeradaException(MENSAGEM_NAO_GERADA);
    }

    private List<DicaResposta> doDesafio(UUID desafioId) {
        return dicas.findByDesafioIdOrderByNivelAsc(desafioId).stream()
                .map(dica -> new DicaResposta(dica.getNivel(), dica.getTexto(), dica.getCriadoEm()))
                .toList();
    }

    private long usadasHoje(UUID usuarioId) {
        Instant desde = relogio.instant().minus(JANELA_DA_COTA);
        return dicas.countByUsuarioIdAndCriadoEmAfter(usuarioId, desde);
    }

    private record Aprovada(String texto, String modelo) {
    }
}
