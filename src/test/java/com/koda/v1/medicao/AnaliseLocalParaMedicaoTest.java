package com.koda.v1.medicao;

import com.koda.v1.analyzer.AnalisadorRepositorio;
import com.koda.v1.analyzer.MontadorResultado;
import com.koda.v1.analyzer.ResultadoAnalise;
import com.koda.v1.analyzer.SelecaoArquivos;
import com.koda.v1.analyzer.SerializadorResultado;
import com.koda.v1.analyzer.contexto.MontadorContexto;
import com.koda.v1.analyzer.contexto.SanitizadorIdentificador;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.analyzer.detector.DetectorDockerCompose;
import com.koda.v1.analyzer.detector.DetectorEndpoints;
import com.koda.v1.analyzer.detector.DetectorEntidade;
import com.koda.v1.analyzer.detector.DetectorPom;
import com.koda.v1.analyzer.ecossistema.java.EcossistemaJava;
import com.koda.v1.analyzer.ecossistema.node.DetectorPackageJson;
import com.koda.v1.analyzer.ecossistema.node.DetectorRotasNode;
import com.koda.v1.analyzer.ecossistema.node.EcossistemaNode;
import com.koda.v1.analyzer.ecossistema.python.DetectorPython;
import com.koda.v1.analyzer.ecossistema.python.EcossistemaPython;
import com.koda.v1.analyzer.estrutura.AnalisadorEstrutura;
import com.koda.v1.analyzer.persistence.DadosExecucao;
import com.koda.v1.analyzer.persistence.RegistroAnalise;
import com.koda.v1.github.GithubService;
import com.koda.v1.github.dto.ArquivoResposta;
import com.koda.v1.github.dto.ArvoreResposta;
import com.koda.v1.github.dto.ItemArvoreResposta;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assumptions.assumeThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Analisa uma pasta local (um repositório clonado) com os mesmos ecossistemas do produto e grava o contexto em
 * {@code target/medicao/contexto-<pasta>.json}, para a bateria de medição usar com {@code -Dmedicao.contexto=<arquivo>}.
 * NÃO roda no {@code verify}. Só lê texto; nada da pasta é executado.
 *
 * <pre>
 *   ./mvnw -Pmedicao test -Dtest=AnaliseLocalParaMedicaoTest -Dmedicao.repo=C:/caminho/do/clone
 * </pre>
 */
@Tag("medicao")
class AnaliseLocalParaMedicaoTest {

    private static final long TAMANHO_MAXIMO = 256 * 1024;
    private static final List<String> PASTAS_IGNORADAS = List.of(".git", "node_modules", ".venv", "venv", "__pycache__");

    @Test
    void deveAnalisarORepositorioLocalEGravarOContexto() throws IOException {
        String caminho = System.getProperty("medicao.repo", "");
        assumeThat(caminho).as("-Dmedicao.repo=<pasta do clone>").isNotBlank();

        Path raiz = Path.of(caminho);
        List<ItemArvoreResposta> itens = new ArrayList<>();
        try (Stream<Path> arquivos = Files.walk(raiz)) {
            for (Path arquivo : arquivos.filter(Files::isRegularFile).toList()) {
                String relativo = raiz.relativize(arquivo).toString().replace('\\', '/');
                if (PASTAS_IGNORADAS.stream().noneMatch(pasta -> ("/" + relativo).contains("/" + pasta + "/"))) {
                    itens.add(new ItemArvoreResposta(relativo, "blob", "sha:" + relativo, Files.size(arquivo)));
                }
            }
        }

        UUID analiseId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        RegistroAnalise registro = mock(RegistroAnalise.class);
        GithubService github = mock(GithubService.class);
        when(registro.iniciar(analiseId)).thenReturn(new DadosExecucao(usuarioId, "local", "repo"));
        when(github.buscarArvore(usuarioId, "local", "repo")).thenReturn(new ArvoreResposta("main", false, itens));
        when(github.lerArquivo(any(), any(), any(), anyString())).thenAnswer(chamada -> {
            String relativo = chamada.getArgument(3, String.class).substring("sha:".length());
            Path arquivo = raiz.resolve(relativo);
            if (Files.size(arquivo) > TAMANHO_MAXIMO) {
                throw new com.koda.v1.github.ArquivoGrandeDemaisException();
            }
            String texto = Files.readString(arquivo, StandardCharsets.UTF_8);
            return new ArquivoResposta(relativo, texto.length(), texto);
        });

        MontadorContexto montador = new MontadorContexto(new SanitizadorIdentificador());
        DetectorDockerCompose compose = new DetectorDockerCompose();
        var analisador = new AnalisadorRepositorio(registro, github, List.of(
                new EcossistemaJava(new SelecaoArquivos(new AnalisadorEstrutura()), new DetectorPom(), compose,
                        new DetectorEndpoints(), new DetectorEntidade(), new MontadorResultado(), montador),
                new EcossistemaNode(new DetectorPackageJson(), new DetectorRotasNode(), compose, montador),
                new EcossistemaPython(new DetectorPython(), compose, montador)),
                new SerializadorResultado(), new SerializadorContexto(), Duration.ofMinutes(2));

        analisador.analisar(analiseId);

        ArgumentCaptor<String> resultadoJson = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> contextoJson = ArgumentCaptor.forClass(String.class);
        try {
            verify(registro).concluir(any(), resultadoJson.capture(), contextoJson.capture(), anyInt());
        } catch (AssertionError e) {
            ArgumentCaptor<String> motivo = ArgumentCaptor.forClass(String.class);
            verify(registro).falhar(any(), motivo.capture());
            System.out.println("ANALISE RECUSADA em " + raiz.getFileName() + ": " + motivo.getValue());
            return;
        }

        ResultadoAnalise resultado = new SerializadorResultado().deJson(resultadoJson.getValue());
        var contexto = new SerializadorContexto().deJson(contextoJson.getValue());
        System.out.printf("%n== %s ==%n%s %s %s | build %s | arquitetura %s%n", raiz.getFileName(),
                resultado.linguagem(), resultado.framework(), resultado.versaoFramework(),
                resultado.ferramentaDeBuild(), contexto.arquitetura());
        System.out.printf("endpoints %d | controllers %d | services %d | repositories %d | entidades %d | dtos %d"
                        + " | excecoes %d | testes %d | tratador %s | parcial %s%n",
                resultado.endpoints().size(), contexto.componentes().controllers().size(),
                contexto.componentes().services().size(), contexto.componentes().repositories().size(),
                contexto.componentes().entidades().size(), contexto.componentes().dtos().size(),
                contexto.componentes().excecoes().size(), resultado.testes().size(),
                contexto.componentes().temTratadorDeErros(), resultado.parcial());
        System.out.println("tecnologias " + contexto.tecnologias() + " | features " + contexto.features());
        System.out.println("controllers " + contexto.componentes().controllers());
        System.out.println("entidades " + contexto.componentes().entidades());
        resultado.endpoints().stream().limit(12).forEach(e -> System.out.println("  " + e.metodoHttp() + " " + e.caminho() + " (" + e.controller() + ")"));

        Path destino = Path.of("target", "medicao", "contexto-" + raiz.getFileName() + ".json");
        Files.createDirectories(destino.getParent());
        Files.writeString(destino, JsonMapper.builder().build().writerWithDefaultPrettyPrinter()
                .writeValueAsString(contexto), StandardCharsets.UTF_8);
        System.out.println("Contexto salvo em " + destino.toAbsolutePath());
    }
}
