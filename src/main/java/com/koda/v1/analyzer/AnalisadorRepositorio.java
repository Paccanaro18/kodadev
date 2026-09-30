package com.koda.v1.analyzer;

import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.MontadorContexto;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.analyzer.detector.ArquivoNaoAnalisavelException;
import com.koda.v1.analyzer.detector.DetectorDockerCompose;
import com.koda.v1.analyzer.detector.DetectorEndpoints;
import com.koda.v1.analyzer.detector.DetectorEntidade;
import com.koda.v1.analyzer.detector.DetectorPom;
import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.detector.ResultadoCompose;
import com.koda.v1.analyzer.detector.ResultadoPom;
import com.koda.v1.analyzer.estrutura.ResultadoEstrutura;
import com.koda.v1.analyzer.persistence.DadosExecucao;
import com.koda.v1.analyzer.persistence.RegistroAnalise;
import com.koda.v1.github.ArquivoGrandeDemaisException;
import com.koda.v1.github.GithubApiException;
import com.koda.v1.github.GithubService;
import com.koda.v1.github.dto.ArvoreResposta;
import com.koda.v1.github.dto.ItemArvoreResposta;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;

@Component
public class AnalisadorRepositorio {

    static final int MAXIMO_ENDPOINTS = 500;
    private static final String TIPO_ARQUIVO = "blob";
    static final String MENSAGEM_ERRO_INESPERADO = "Não foi possível concluir a análise do repositório.";

    private final RegistroAnalise registro;
    private final GithubService githubService;
    private final SelecaoArquivos selecao;
    private final DetectorPom detectorPom;
    private final DetectorDockerCompose detectorCompose;
    private final DetectorEndpoints detectorEndpoints;
    private final DetectorEntidade detectorEntidade;
    private final MontadorResultado montador;
    private final SerializadorResultado serializador;
    private final MontadorContexto montadorContexto;
    private final SerializadorContexto serializadorContexto;
    private final Duration prazoMaximo;

    public AnalisadorRepositorio(RegistroAnalise registro,
                                 GithubService githubService,
                                 SelecaoArquivos selecao,
                                 DetectorPom detectorPom,
                                 DetectorDockerCompose detectorCompose,
                                 DetectorEndpoints detectorEndpoints,
                                 DetectorEntidade detectorEntidade,
                                 MontadorResultado montador,
                                 SerializadorResultado serializador,
                                 MontadorContexto montadorContexto,
                                 SerializadorContexto serializadorContexto,
                                 @Value("${koda.analise.prazo-maximo:PT2M}") Duration prazoMaximo) {
        this.registro = registro;
        this.githubService = githubService;
        this.selecao = selecao;
        this.detectorPom = detectorPom;
        this.detectorCompose = detectorCompose;
        this.detectorEndpoints = detectorEndpoints;
        this.detectorEntidade = detectorEntidade;
        this.montador = montador;
        this.serializador = serializador;
        this.montadorContexto = montadorContexto;
        this.serializadorContexto = serializadorContexto;
        this.prazoMaximo = prazoMaximo;
    }

    public void analisar(UUID analiseId) {
        DadosExecucao dados = registro.iniciar(analiseId);

        try {
            Produto produto = analisarRepositorio(dados);
            registro.concluir(
                    analiseId,
                    serializador.paraJson(produto.resultado()),
                    serializadorContexto.paraJson(produto.contexto()),
                    ContextoProjeto.VERSAO_ESQUEMA);
        } catch (AnaliseRecusadaException | GithubApiException | ArquivoNaoAnalisavelException e) {
            registro.falhar(analiseId, e.getMessage());
        } catch (RuntimeException e) {
            registro.falhar(analiseId, MENSAGEM_ERRO_INESPERADO);
        }
    }

    private Produto analisarRepositorio(DadosExecucao dados) {
        Rodada rodada = new Rodada(dados, Instant.now().plus(prazoMaximo));

        ArvoreResposta arvore = githubService.buscarArvore(dados.usuarioId(), dados.dono(), dados.nome());
        ArquivosSelecionados selecionados = selecao.selecionar(arvore.itens());
        ResultadoEstrutura estrutura = selecionados.estrutura();

        if (!estrutura.temCodigoJava()) {
            throw new AnaliseRecusadaException("O repositório não tem código Java em src/main/java.");
        }
        if (selecionados.pom() == null) {
            throw new AnaliseRecusadaException("Não encontramos um pom.xml legível na raiz do repositório.");
        }

        ResultadoPom pom = detectorPom.detectar(rodada.ler(selecionados.pom()));
        if (!pom.ehSpringBoot()) {
            throw new AnaliseRecusadaException("O repositório não é um projeto Spring Boot.");
        }

        ResultadoCompose compose = selecionados.compose() == null ? null
                : rodada.lerEAnalisar(selecionados.compose(), detectorCompose::detectar).orElse(null);

        List<Endpoint> endpoints = detectarEndpoints(rodada, selecionados.controllers());
        List<String> entidades = confirmarEntidades(rodada, selecionados.candidatasEntidade());

        ResultadoEstrutura estruturaFinal = new ResultadoEstrutura(
                estrutura.temCodigoJava(),
                estrutura.controllers(),
                estrutura.services(),
                estrutura.repositories(),
                entidades,
                estrutura.testes());

        boolean parcial = arvore.truncada() || selecionados.limitesAplicados() || rodada.parcial;

        ResultadoAnalise resultado = montador.montar(pom, compose, estruturaFinal, endpoints, parcial);
        ContextoProjeto contexto = montadorContexto.montar(resultado, caminhosDosArquivos(arvore));

        return new Produto(resultado, contexto);
    }

    private List<String> caminhosDosArquivos(ArvoreResposta arvore) {
        return arvore.itens().stream()
                .filter(item -> TIPO_ARQUIVO.equals(item.tipo()) && item.caminho() != null)
                .map(ItemArvoreResposta::caminho)
                .toList();
    }

    private List<Endpoint> detectarEndpoints(Rodada rodada, List<ArquivoParaAbrir> controllers) {
        List<Endpoint> endpoints = new ArrayList<>();
        for (ArquivoParaAbrir controller : controllers) {
            rodada.lerEAnalisar(controller, detectorEndpoints::detectar).ifPresent(endpoints::addAll);
            if (endpoints.size() > MAXIMO_ENDPOINTS) {
                rodada.parcial = true;
                return List.copyOf(endpoints.subList(0, MAXIMO_ENDPOINTS));
            }
        }
        return endpoints;
    }

    private List<String> confirmarEntidades(Rodada rodada, List<ArquivoParaAbrir> candidatas) {
        List<String> entidades = new ArrayList<>();
        for (ArquivoParaAbrir candidata : candidatas) {
            boolean ehEntidade = rodada.lerEAnalisar(candidata, detectorEntidade::ehEntidade).orElse(false);
            if (ehEntidade) {
                entidades.add(candidata.caminho());
            }
        }
        return entidades;
    }

    private record Produto(ResultadoAnalise resultado, ContextoProjeto contexto) {
    }

    private class Rodada {

        private final DadosExecucao dados;
        private final Instant prazo;
        private boolean parcial;

        private Rodada(DadosExecucao dados, Instant prazo) {
            this.dados = dados;
            this.prazo = prazo;
        }

        private String ler(ArquivoParaAbrir arquivo) {
            if (Instant.now().isAfter(prazo)) {
                throw new AnaliseRecusadaException("A análise demorou mais que o permitido.");
            }
            return githubService
                    .lerArquivo(dados.usuarioId(), dados.dono(), dados.nome(), arquivo.sha())
                    .conteudo();
        }

        private <T> Optional<T> lerEAnalisar(ArquivoParaAbrir arquivo, Function<String, T> detector) {
            try {
                return Optional.of(detector.apply(ler(arquivo)));
            } catch (ArquivoGrandeDemaisException | ArquivoNaoAnalisavelException e) {
                parcial = true;
                return Optional.empty();
            }
        }
    }
}
