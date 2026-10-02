package com.koda.v1.analyzer;

import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.analyzer.detector.ArquivoNaoAnalisavelException;
import com.koda.v1.analyzer.ecossistema.Ecossistema;
import com.koda.v1.analyzer.ecossistema.LeitorDeArquivos;
import com.koda.v1.analyzer.ecossistema.ProdutoDaAnalise;
import com.koda.v1.analyzer.persistence.DadosExecucao;
import com.koda.v1.analyzer.persistence.RegistroAnalise;
import com.koda.v1.github.GithubApiException;
import com.koda.v1.github.GithubService;
import com.koda.v1.github.dto.ArvoreResposta;
import com.koda.v1.github.dto.ItemArvoreResposta;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Component
public class AnalisadorRepositorio {

    private static final String TIPO_ARQUIVO = "blob";
    static final String MENSAGEM_ERRO_INESPERADO = "Não foi possível concluir a análise do repositório.";
    static final String MENSAGEM_LINGUAGEM_NAO_SUPORTADA =
            "Não reconhecemos a linguagem deste repositório. Hoje a Koda analisa projetos Java com Spring Boot, "
                    + "TypeScript ou JavaScript (Node) e Python.";

    private final RegistroAnalise registro;
    private final GithubService githubService;
    private final List<Ecossistema> ecossistemas;
    private final SerializadorResultado serializador;
    private final SerializadorContexto serializadorContexto;
    private final Duration prazoMaximo;

    public AnalisadorRepositorio(RegistroAnalise registro,
                                 GithubService githubService,
                                 List<Ecossistema> ecossistemas,
                                 SerializadorResultado serializador,
                                 SerializadorContexto serializadorContexto,
                                 @Value("${koda.analise.prazo-maximo:PT2M}") Duration prazoMaximo) {
        this.registro = registro;
        this.githubService = githubService;
        this.ecossistemas = List.copyOf(ecossistemas);
        this.serializador = serializador;
        this.serializadorContexto = serializadorContexto;
        this.prazoMaximo = prazoMaximo;
    }

    public void analisar(UUID analiseId) {
        DadosExecucao dados = registro.iniciar(analiseId);

        try {
            ProdutoDaAnalise produto = analisarRepositorio(dados);
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

    private ProdutoDaAnalise analisarRepositorio(DadosExecucao dados) {
        LeitorDeArquivos leitor = new LeitorDeArquivos(
                githubService, dados.usuarioId(), dados.dono(), dados.nome(), Instant.now().plus(prazoMaximo));

        ArvoreResposta arvore = githubService.buscarArvore(dados.usuarioId(), dados.dono(), dados.nome());
        Ecossistema ecossistema = escolher(caminhosDosArquivos(arvore));

        return ecossistema.analisar(arvore, leitor);
    }

    /** Escolhe o ecossistema com mais arquivos no repositório; em empate, o primeiro da lista. */
    private Ecossistema escolher(List<String> caminhos) {
        Ecossistema escolhido = null;
        int maiorPeso = 0;
        for (Ecossistema ecossistema : ecossistemas) {
            int peso = ecossistema.peso(caminhos);
            if (peso > maiorPeso) {
                maiorPeso = peso;
                escolhido = ecossistema;
            }
        }
        if (escolhido == null) {
            throw new AnaliseRecusadaException(MENSAGEM_LINGUAGEM_NAO_SUPORTADA);
        }
        return escolhido;
    }

    private List<String> caminhosDosArquivos(ArvoreResposta arvore) {
        return arvore.itens().stream()
                .filter(item -> TIPO_ARQUIVO.equals(item.tipo()) && item.caminho() != null)
                .map(ItemArvoreResposta::caminho)
                .toList();
    }
}
