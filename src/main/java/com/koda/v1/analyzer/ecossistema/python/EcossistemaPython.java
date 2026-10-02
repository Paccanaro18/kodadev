package com.koda.v1.analyzer.ecossistema.python;

import com.koda.v1.analyzer.AnaliseRecusadaException;
import com.koda.v1.analyzer.ArquivoParaAbrir;
import com.koda.v1.analyzer.ResultadoAnalise;
import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.MontadorContexto;
import com.koda.v1.analyzer.detector.DetectorDockerCompose;
import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.detector.ResultadoCompose;
import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.analyzer.ecossistema.ArvoreDoRepositorio;
import com.koda.v1.analyzer.ecossistema.Ecossistema;
import com.koda.v1.analyzer.ecossistema.Linguagem;
import com.koda.v1.analyzer.ecossistema.LeitorDeArquivos;
import com.koda.v1.analyzer.ecossistema.ProdutoDaAnalise;
import com.koda.v1.github.dto.ArvoreResposta;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import java.util.regex.Pattern;

/** Servidores Python: FastAPI, Flask e Django. */
@Component
public class EcossistemaPython implements Ecossistema {

    static final int MAXIMO_ENDPOINTS = 500;
    static final int MAXIMO_ARQUIVOS_DE_ROTA = 80;
    static final int MAXIMO_ARQUIVOS_DE_CLASSES = 30;
    static final String MENSAGEM_SEM_MANIFESTO =
            "Não encontramos pyproject.toml, requirements.txt ou Pipfile legível na raiz do repositório.";
    static final String MENSAGEM_SEM_FRAMEWORK =
            "O repositório não parece um servidor Python (FastAPI, Flask ou Django).";

    private static final List<String> MANIFESTOS = List.of("pyproject.toml", "requirements.txt", "Pipfile");
    private static final Set<String> ARQUIVOS_DE_ENTRADA = Set.of("main.py", "app.py", "server.py");

    private static final Pattern BASE_DE_MODELO = Pattern.compile("(?i).*(Base|Model|SQLModel|Document|Entity|Table).*");
    private static final Pattern BASE_DE_SCHEMA =
            Pattern.compile("(?i).*(BaseModel|Schema|Serializer|SQLModel|TypedDict|Struct).*");
    private static final Pattern BASE_DE_EXCECAO = Pattern.compile(".*(Exception|Error).*");

    private final DetectorPython detector;
    private final DetectorDockerCompose detectorCompose;
    private final MontadorContexto montadorContexto;

    public EcossistemaPython(DetectorPython detector,
                             DetectorDockerCompose detectorCompose,
                             MontadorContexto montadorContexto) {
        this.detector = detector;
        this.detectorCompose = detectorCompose;
        this.montadorContexto = montadorContexto;
    }

    @Override
    public int peso(List<String> caminhosDeArquivos) {
        if (MANIFESTOS.stream().noneMatch(caminhosDeArquivos::contains)) {
            return 0;
        }
        return ConvencaoPython.INSTANCIA.arquivosDeFonte(caminhosDeArquivos).size();
    }

    @Override
    public ProdutoDaAnalise analisar(ArvoreResposta arvore, LeitorDeArquivos leitor) {
        ArvoreDoRepositorio arquivos = new ArvoreDoRepositorio(arvore.itens());

        Map<String, String> manifestos = new LinkedHashMap<>();
        for (String nome : MANIFESTOS) {
            arquivos.naRaiz(nome).ifPresent(arquivo -> manifestos.put(nome, leitor.ler(arquivo)));
        }
        if (manifestos.isEmpty()) {
            throw new AnaliseRecusadaException(MENSAGEM_SEM_MANIFESTO);
        }
        ResultadoPython projeto = detector.detectar(manifestos);
        if (!projeto.temFramework()) {
            throw new AnaliseRecusadaException(MENSAGEM_SEM_FRAMEWORK);
        }

        List<String> caminhos = arquivos.caminhos();
        List<String> fontes = ConvencaoPython.INSTANCIA.arquivosDeFonte(caminhos);

        List<String> controllers = new ArrayList<>();
        List<String> services = new ArrayList<>();
        List<String> repositories = new ArrayList<>();
        for (String fonte : fontes) {
            switch (PapelNoPython.de(fonte)) {
                case CONTROLLER -> controllers.add(fonte);
                case SERVICE -> services.add(fonte);
                case REPOSITORY -> repositories.add(fonte);
                default -> { }
            }
        }

        List<String> entidades = classesDosArquivos(arquivos, leitor, fontes, PapelNoPython.MODELO, BASE_DE_MODELO);
        List<String> dtos = classesDosArquivos(arquivos, leitor, fontes, PapelNoPython.SCHEMA, BASE_DE_SCHEMA);
        List<String> excecoes = classesDosArquivos(arquivos, leitor, fontes, PapelNoPython.EXCECAO, BASE_DE_EXCECAO);

        List<String> testes = caminhos.stream()
                .filter(caminho -> ConvencaoPython.ehCodigo(caminho) && ConvencaoPython.ehTeste(caminho))
                .toList();

        List<Endpoint> endpoints = detectarEndpoints(arquivos, leitor, controllers);
        boolean limitesAplicados = false;
        if (endpoints.size() > MAXIMO_ENDPOINTS) {
            endpoints = List.copyOf(endpoints.subList(0, MAXIMO_ENDPOINTS));
            limitesAplicados = true;
        }

        ResultadoCompose compose = arquivos.compose()
                .flatMap(arquivo -> leitor.lerEAnalisar(arquivo, detectorCompose::detectar))
                .orElse(null);
        Set<Tecnologia> tecnologias = EnumSet.noneOf(Tecnologia.class);
        tecnologias.addAll(projeto.tecnologias());
        if (compose != null) {
            tecnologias.addAll(compose.tecnologias());
        }

        boolean parcial = arvore.truncada() || arquivos.limitou() || leitor.parcial() || limitesAplicados;

        ResultadoAnalise resultado = new ResultadoAnalise(
                Linguagem.PYTHON,
                projeto.framework(),
                !fontes.isEmpty(),
                projeto.versaoLinguagem(),
                projeto.versaoFramework(),
                gerenciadorDePacotes(arquivos),
                projeto.dependencias(),
                List.copyOf(tecnologias),
                compose == null ? List.of() : compose.imagens(),
                controllers,
                services,
                repositories,
                entidades,
                testes,
                endpoints,
                parcial);

        List<String> caminhosComClasses = new ArrayList<>(caminhos);
        caminhosComClasses.addAll(dtos);
        caminhosComClasses.addAll(excecoes);
        ContextoProjeto contexto = montadorContexto.montar(resultado, caminhosComClasses);

        return new ProdutoDaAnalise(resultado, contexto);
    }

    private List<Endpoint> detectarEndpoints(ArvoreDoRepositorio arquivos, LeitorDeArquivos leitor,
                                             List<String> controllers) {
        Set<String> conhecidos = Set.copyOf(controllers);
        List<ArquivoParaAbrir> candidatos = arquivos.escolher(
                caminho -> conhecidos.contains(caminho) || ehArquivoDeEntrada(caminho), MAXIMO_ARQUIVOS_DE_ROTA);

        List<Endpoint> endpoints = new ArrayList<>();
        for (ArquivoParaAbrir candidato : candidatos) {
            String nome = ConvencaoPython.INSTANCIA.nome(candidato.caminho());
            leitor.lerEAnalisar(candidato, conteudo -> detector.detectarRotas(conteudo, candidato.caminho(), nome))
                    .ifPresent(endpoints::addAll);
            if (endpoints.size() > MAXIMO_ENDPOINTS) {
                break;
            }
        }
        return endpoints;
    }

    private boolean ehArquivoDeEntrada(String caminho) {
        if (!ConvencaoPython.ehCodigo(caminho) || ConvencaoPython.ehTeste(caminho)) {
            return false;
        }
        String[] partes = caminho.split("/");
        return partes.length <= 3 && ARQUIVOS_DE_ENTRADA.contains(partes[partes.length - 1]);
    }

    /** As classes (como "arquivo.py#Classe") dos arquivos com o papel pedido, lendo no máximo alguns arquivos. */
    private List<String> classesDosArquivos(ArvoreDoRepositorio arquivos, LeitorDeArquivos leitor,
                                            List<String> fontes, PapelNoPython papel, Pattern bases) {
        Set<String> doPapel = Set.copyOf(fontes.stream().filter(fonte -> PapelNoPython.de(fonte) == papel).toList());
        Predicate<String> aceita = declaradas -> bases.matcher(declaradas).matches();

        List<String> classes = new ArrayList<>();
        for (ArquivoParaAbrir arquivo : arquivos.escolher(doPapel::contains, MAXIMO_ARQUIVOS_DE_CLASSES)) {
            leitor.lerEAnalisar(arquivo, conteudo -> detector.classes(conteudo, aceita))
                    .ifPresent(nomes -> nomes.forEach(nome -> classes.add(arquivo.caminho() + "#" + nome)));
        }
        return classes;
    }

    private String gerenciadorDePacotes(ArvoreDoRepositorio arquivos) {
        if (arquivos.temNaRaiz("poetry.lock")) {
            return "poetry";
        }
        if (arquivos.temNaRaiz("uv.lock")) {
            return "uv";
        }
        if (arquivos.temNaRaiz("Pipfile") || arquivos.temNaRaiz("Pipfile.lock")) {
            return "pipenv";
        }
        return "pip";
    }
}
