package com.koda.v1.challenge.geracao;

import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.challenge.ConteudoDesafio;
import com.koda.v1.challenge.ConteudoInvalidoException;
import com.koda.v1.challenge.DesafiosEsgotadosException;
import com.koda.v1.challenge.SemAnguloAplicavelException;
import com.koda.v1.challenge.SerializadorConteudo;
import com.koda.v1.challenge.VerificadorConteudo;
import com.koda.v1.challenge.catalogo.AlvoDesafio;
import com.koda.v1.challenge.catalogo.AnguloDesafio;
import com.koda.v1.challenge.catalogo.CatalogoAngulos;
import com.koda.v1.challenge.ia.MotivoFalhaIa;
import com.koda.v1.challenge.ia.ProvedorIa;
import com.koda.v1.challenge.ia.ProvedorIaException;
import com.koda.v1.challenge.ia.RespostaIa;
import com.koda.v1.challenge.persistence.ConsultaDesafio;
import com.koda.v1.challenge.persistence.DadosGeracao;
import com.koda.v1.challenge.persistence.RegistroDesafio;
import com.koda.v1.challenge.prompt.MontadorPrompt;
import com.koda.v1.challenge.prompt.Perspectivas;
import com.koda.v1.challenge.prompt.PromptDesafio;
import com.koda.v1.challenge.selecao.SelecaoDeDesafio;
import com.koda.v1.challenge.selecao.SeletorDeDesafio;
import com.koda.v1.challenge.selecao.UsoAnterior;
import com.koda.v1.challenge.similaridade.DetectorSimilaridade;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class GeradorDesafio {

    private static final Logger LOG = LoggerFactory.getLogger(GeradorDesafio.class);

    static final int MAXIMO_DE_CHAMADAS = 2;
    static final int MAXIMO_DE_CONTEUDOS_COMPARADOS = 20;
    static final int MAXIMO_DE_RECENTES = 10;

    static final String MENSAGEM_FORA_DO_FORMATO =
            "A IA devolveu um desafio fora do formato esperado. Tente novamente.";
    static final String MENSAGEM_REPETIDO =
            "Não conseguimos gerar um desafio diferente dos anteriores. Tente novamente.";
    static final String MENSAGEM_PRAZO = "A geração do desafio demorou mais que o permitido.";
    static final String MENSAGEM_NAO_PREPARADO = "Não foi possível preparar o desafio a partir da análise.";
    static final String MENSAGEM_ERRO_INESPERADO = "Não foi possível gerar o desafio.";

    private final RegistroDesafio registro;
    private final ConsultaDesafio consulta;
    private final CarregadorContexto carregador;
    private final CatalogoAngulos catalogo;
    private final SeletorDeDesafio seletor;
    private final Perspectivas perspectivas;
    private final MontadorPrompt montador;
    private final ProvedorIa provedor;
    private final VerificadorConteudo verificador;
    private final DetectorSimilaridade detector;
    private final SerializadorConteudo serializador;
    private final Duration prazoMaximo;

    public GeradorDesafio(RegistroDesafio registro,
                          ConsultaDesafio consulta,
                          CarregadorContexto carregador,
                          CatalogoAngulos catalogo,
                          SeletorDeDesafio seletor,
                          Perspectivas perspectivas,
                          MontadorPrompt montador,
                          ProvedorIa provedor,
                          VerificadorConteudo verificador,
                          DetectorSimilaridade detector,
                          SerializadorConteudo serializador,
                          @Value("${koda.desafio.prazo-maximo:PT3M}") Duration prazoMaximo) {
        this.registro = registro;
        this.consulta = consulta;
        this.carregador = carregador;
        this.catalogo = catalogo;
        this.seletor = seletor;
        this.perspectivas = perspectivas;
        this.montador = montador;
        this.provedor = provedor;
        this.verificador = verificador;
        this.detector = detector;
        this.serializador = serializador;
        this.prazoMaximo = prazoMaximo;
    }

    public void gerar(UUID desafioId) {
        DadosGeracao dados = registro.iniciar(desafioId);

        try {
            Pronto pronto = produzir(dados);
            registro.concluir(
                    desafioId,
                    pronto.conteudo().titulo(),
                    serializador.paraJson(pronto.conteudo()),
                    ConteudoDesafio.VERSAO_ESQUEMA,
                    pronto.modelo());
        } catch (GeracaoRecusadaException | ContextoIndisponivelException
                 | DesafiosEsgotadosException | SemAnguloAplicavelException e) {
            registro.falhar(desafioId, e.getMessage());
        } catch (RuntimeException e) {
            registro.falhar(desafioId, MENSAGEM_ERRO_INESPERADO);
        }
    }

    private Pronto produzir(DadosGeracao dados) {
        Instant prazo = Instant.now().plus(prazoMaximo);

        ContextoProjeto contexto = carregador.carregar(dados.usuarioId(), dados.analiseId());
        SelecaoDeDesafio selecao = reconstruirSelecao(dados, contexto);
        List<ConteudoDesafio> anteriores =
                consulta.conteudosRecentes(dados.usuarioId(), MAXIMO_DE_CONTEUDOS_COMPARADOS);
        List<String> titulos = consulta.titulosRecentes(dados.usuarioId(), MAXIMO_DE_RECENTES);
        List<UsoAnterior> historico = new ArrayList<>(consulta.historicoDeUso(dados.usuarioId(), dados.analiseId()));
        String perspectiva = dados.perspectiva();
        Falha ultimaFalha = null;

        for (int chamada = 1; chamada <= MAXIMO_DE_CHAMADAS; chamada++) {
            if (Instant.now().isAfter(prazo)) {
                throw new GeracaoRecusadaException(MENSAGEM_PRAZO);
            }

            if (ultimaFalha == Falha.MUITO_PARECIDO) {
                historico.add(0, new UsoAnterior(selecao.angulo().id(), selecao.alvo().chave(), true));
                selecao = seletor.selecionar(contexto, dados.tipo(), historico);
                perspectiva = perspectivas.escolher(perspectivasParaEvitar(dados, perspectiva));
                registro.reselecionar(dados.desafioId(), selecao.angulo().id(), selecao.alvo().chave(), perspectiva);
            }

            registro.registrarTentativa(dados.desafioId());
            Resultado resultado = tentar(montador.montar(selecao, contexto, perspectiva, titulos), anteriores);
            if (resultado.conteudo() != null) {
                return new Pronto(resultado.conteudo(), resultado.modelo());
            }
            ultimaFalha = resultado.falha();
        }

        throw new GeracaoRecusadaException(switch (ultimaFalha) {
            case MUITO_PARECIDO -> MENSAGEM_REPETIDO;
            case PROVEDOR_INDISPONIVEL -> MotivoFalhaIa.INDISPONIVEL.mensagem();
            case CONTEUDO_INVALIDO -> MENSAGEM_FORA_DO_FORMATO;
        });
    }

    private Resultado tentar(PromptDesafio prompt, List<ConteudoDesafio> anteriores) {
        RespostaIa resposta;
        try {
            resposta = provedor.gerar(prompt);
        } catch (ProvedorIaException e) {
            if (e.getMotivo() == MotivoFalhaIa.INDISPONIVEL) {
                LOG.info("Desafio: tentativa descartada, motivo={}", e.getMotivo());
                return Resultado.falha(Falha.PROVEDOR_INDISPONIVEL);
            }
            if (e.getMotivo() == MotivoFalhaIa.RESPOSTA_INVALIDA
                    || e.getMotivo() == MotivoFalhaIa.RESPOSTA_GRANDE_DEMAIS) {
                LOG.info("Desafio: tentativa descartada, motivo={}", e.getMotivo());
                return Resultado.falha(Falha.CONTEUDO_INVALIDO);
            }
            throw new GeracaoRecusadaException(e.getMessage());
        }

        ConteudoDesafio conteudo;
        try {
            conteudo = verificador.verificar(resposta.texto());
        } catch (ConteudoInvalidoException e) {
            LOG.info("Desafio: tentativa descartada, conteudo invalido: {}", e.getMessage());
            return Resultado.falha(Falha.CONTEUDO_INVALIDO);
        }

        var parecido = detector.buscarParecido(conteudo, anteriores);
        if (parecido.isPresent()) {
            LOG.info("Desafio: tentativa descartada, parecido com um anterior, pontuacao={}",
                    String.format("%.2f", parecido.get().pontuacao()));
            return Resultado.falha(Falha.MUITO_PARECIDO);
        }
        return new Resultado(conteudo, resposta.modelo(), null);
    }

    private SelecaoDeDesafio reconstruirSelecao(DadosGeracao dados, ContextoProjeto contexto) {
        AnguloDesafio angulo = catalogo.porId(dados.anguloId())
                .filter(encontrado -> encontrado.tipo() == dados.tipo())
                .orElseThrow(() -> new GeracaoRecusadaException(MENSAGEM_NAO_PREPARADO));
        AlvoDesafio alvo = angulo.alvosEm(contexto).stream()
                .filter(candidato -> candidato.chave().equals(dados.alvoChave()))
                .findFirst()
                .orElseThrow(() -> new GeracaoRecusadaException(MENSAGEM_NAO_PREPARADO));
        return new SelecaoDeDesafio(angulo, alvo);
    }

    private List<String> perspectivasParaEvitar(DadosGeracao dados, String atual) {
        List<String> evitar = new ArrayList<>();
        evitar.add(atual);
        evitar.addAll(consulta.perspectivasRecentes(dados.usuarioId(), MAXIMO_DE_RECENTES));
        return evitar;
    }

    private enum Falha {
        CONTEUDO_INVALIDO,
        MUITO_PARECIDO,
        PROVEDOR_INDISPONIVEL
    }

    private record Resultado(ConteudoDesafio conteudo, String modelo, Falha falha) {

        static Resultado falha(Falha falha) {
            return new Resultado(null, null, falha);
        }
    }

    private record Pronto(ConteudoDesafio conteudo, String modelo) {
    }
}
