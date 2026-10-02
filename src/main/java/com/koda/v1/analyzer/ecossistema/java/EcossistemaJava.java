package com.koda.v1.analyzer.ecossistema.java;

import com.koda.v1.analyzer.AnaliseRecusadaException;
import com.koda.v1.analyzer.ArquivoParaAbrir;
import com.koda.v1.analyzer.ArquivosSelecionados;
import com.koda.v1.analyzer.MontadorResultado;
import com.koda.v1.analyzer.ResultadoAnalise;
import com.koda.v1.analyzer.SelecaoArquivos;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.MontadorContexto;
import com.koda.v1.analyzer.detector.DetectorDockerCompose;
import com.koda.v1.analyzer.detector.DetectorEndpoints;
import com.koda.v1.analyzer.detector.DetectorEntidade;
import com.koda.v1.analyzer.detector.DetectorPom;
import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.detector.ResultadoCompose;
import com.koda.v1.analyzer.detector.ResultadoPom;
import com.koda.v1.analyzer.ecossistema.Ecossistema;
import com.koda.v1.analyzer.ecossistema.LeitorDeArquivos;
import com.koda.v1.analyzer.ecossistema.ProdutoDaAnalise;
import com.koda.v1.analyzer.estrutura.ResultadoEstrutura;
import com.koda.v1.github.dto.ArvoreResposta;
import com.koda.v1.github.dto.ItemArvoreResposta;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/** Projetos Java com Spring Boot e Maven. */
@Component
public class EcossistemaJava implements Ecossistema {

    public static final int MAXIMO_ENDPOINTS = 500;
    private static final String PREFIXO_MAIN = "src/main/java/";
    private static final String TIPO_ARQUIVO = "blob";

    private final SelecaoArquivos selecao;
    private final DetectorPom detectorPom;
    private final DetectorDockerCompose detectorCompose;
    private final DetectorEndpoints detectorEndpoints;
    private final DetectorEntidade detectorEntidade;
    private final MontadorResultado montador;
    private final MontadorContexto montadorContexto;

    public EcossistemaJava(SelecaoArquivos selecao,
                           DetectorPom detectorPom,
                           DetectorDockerCompose detectorCompose,
                           DetectorEndpoints detectorEndpoints,
                           DetectorEntidade detectorEntidade,
                           MontadorResultado montador,
                           MontadorContexto montadorContexto) {
        this.selecao = selecao;
        this.detectorPom = detectorPom;
        this.detectorCompose = detectorCompose;
        this.detectorEndpoints = detectorEndpoints;
        this.detectorEntidade = detectorEntidade;
        this.montador = montador;
        this.montadorContexto = montadorContexto;
    }

    @Override
    public int peso(List<String> caminhosDeArquivos) {
        return (int) caminhosDeArquivos.stream()
                .filter(caminho -> caminho.contains(PREFIXO_MAIN) && caminho.endsWith(".java"))
                .count();
    }

    @Override
    public ProdutoDaAnalise analisar(ArvoreResposta arvore, LeitorDeArquivos leitor) {
        ArquivosSelecionados selecionados = selecao.selecionar(arvore.itens());
        ResultadoEstrutura estrutura = selecionados.estrutura();

        if (!estrutura.temCodigoJava()) {
            throw new AnaliseRecusadaException("O repositório não tem código Java em src/main/java.");
        }
        if (selecionados.pom() == null) {
            throw new AnaliseRecusadaException("Não encontramos um pom.xml legível na raiz do repositório.");
        }

        ResultadoPom pom = detectorPom.detectar(leitor.ler(selecionados.pom()));
        if (!pom.ehSpringBoot()) {
            throw new AnaliseRecusadaException("O repositório não é um projeto Spring Boot.");
        }

        ResultadoCompose compose = selecionados.compose() == null ? null
                : leitor.lerEAnalisar(selecionados.compose(), detectorCompose::detectar).orElse(null);

        List<Endpoint> endpoints = detectarEndpoints(leitor, selecionados.controllers());
        List<String> entidades = confirmarEntidades(leitor, selecionados.candidatasEntidade());

        ResultadoEstrutura estruturaFinal = new ResultadoEstrutura(
                estrutura.temCodigoJava(),
                estrutura.controllers(),
                estrutura.services(),
                estrutura.repositories(),
                entidades,
                estrutura.testes());

        boolean parcial = arvore.truncada() || selecionados.limitesAplicados() || leitor.parcial();

        ResultadoAnalise resultado = montador.montar(pom, compose, estruturaFinal, endpoints, parcial);
        ContextoProjeto contexto = montadorContexto.montar(resultado, caminhosDosArquivos(arvore));

        return new ProdutoDaAnalise(resultado, contexto);
    }

    private List<String> caminhosDosArquivos(ArvoreResposta arvore) {
        return arvore.itens().stream()
                .filter(item -> TIPO_ARQUIVO.equals(item.tipo()) && item.caminho() != null)
                .map(ItemArvoreResposta::caminho)
                .toList();
    }

    private List<Endpoint> detectarEndpoints(LeitorDeArquivos leitor, List<ArquivoParaAbrir> controllers) {
        List<Endpoint> endpoints = new ArrayList<>();
        for (ArquivoParaAbrir controller : controllers) {
            leitor.lerEAnalisar(controller, detectorEndpoints::detectar).ifPresent(endpoints::addAll);
            if (endpoints.size() > MAXIMO_ENDPOINTS) {
                leitor.marcarParcial();
                return List.copyOf(endpoints.subList(0, MAXIMO_ENDPOINTS));
            }
        }
        return endpoints;
    }

    private List<String> confirmarEntidades(LeitorDeArquivos leitor, List<ArquivoParaAbrir> candidatas) {
        List<String> entidades = new ArrayList<>();
        for (ArquivoParaAbrir candidata : candidatas) {
            boolean ehEntidade = leitor.lerEAnalisar(candidata, detectorEntidade::ehEntidade).orElse(false);
            if (ehEntidade) {
                entidades.add(candidata.caminho());
            }
        }
        return entidades;
    }
}
