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
import java.util.HashMap;
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
    static final int MAXIMO_ARQUIVOS_DE_ROTA = 150;
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

        List<String> services = new ArrayList<>();
        List<String> repositories = new ArrayList<>();
        for (String fonte : fontes) {
            switch (PapelNoPython.de(fonte)) {
                case SERVICE -> services.add(fonte);
                case REPOSITORY -> repositories.add(fonte);
                default -> { }
            }
        }

        List<String> entidades = classesDosArquivos(arquivos, leitor, fontes, PapelNoPython.MODELO, BASE_DE_MODELO)
                .stream().filter(classe -> !ehApoioDeModelo(classe)).toList();
        List<String> dtos = classesDosArquivos(arquivos, leitor, fontes, PapelNoPython.SCHEMA, BASE_DE_SCHEMA);
        List<String> excecoes = classesDosArquivos(arquivos, leitor, fontes, PapelNoPython.EXCECAO, BASE_DE_EXCECAO);

        List<String> testes = caminhos.stream()
                .filter(caminho -> ConvencaoPython.ehCodigo(caminho) && ConvencaoPython.ehTeste(caminho))
                .toList();

        Rotas rotas = detectarRotas(arquivos, leitor);
        List<String> controllers = rotas.arquivosComRotas();
        List<Endpoint> endpoints = rotas.endpoints();
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

    /**
     * Controllers são os arquivos onde as rotas foram de fato encontradas. Os prefixos de "include_router" de todos os
     * arquivos lidos são aplicados às rotas dos arquivos que eles incluem.
     */
    private Rotas detectarRotas(ArvoreDoRepositorio arquivos, LeitorDeArquivos leitor) {
        List<ArquivoParaAbrir> candidatos = arquivos.escolher(
                caminho -> ehCodigoDeProducao(caminho)
                        && (PapelNoPython.de(caminho) == PapelNoPython.CONTROLLER || ehArquivoDeEntrada(caminho)),
                MAXIMO_ARQUIVOS_DE_ROTA);

        Map<ArquivoParaAbrir, String> conteudos = new LinkedHashMap<>();
        Map<String, String> prefixos = new HashMap<>();
        for (ArquivoParaAbrir candidato : candidatos) {
            leitor.lerEAnalisar(candidato, conteudo -> {
                prefixos.putAll(detector.prefixosDeInclusao(conteudo));
                return conteudo;
            }).ifPresent(conteudo -> conteudos.put(candidato, conteudo));
        }

        List<Endpoint> endpoints = new ArrayList<>();
        List<String> comRotas = new ArrayList<>();
        for (Map.Entry<ArquivoParaAbrir, String> lido : conteudos.entrySet()) {
            String caminho = lido.getKey().caminho();
            String nome = ConvencaoPython.INSTANCIA.nome(caminho);
            String prefixo = prefixoDoArquivo(caminho, prefixos);
            List<Endpoint> doArquivo = leitor
                    .lerEAnalisar(lido.getKey(), ignorado -> detector.detectarRotas(lido.getValue(), caminho, nome))
                    .orElse(List.of()).stream()
                    .map(e -> new Endpoint(e.metodoHttp(), detector.juntarCaminhos(prefixo, e.caminho()), e.controller()))
                    .toList();
            if (!doArquivo.isEmpty()) {
                comRotas.add(caminho);
                endpoints.addAll(doArquivo);
            }
            if (endpoints.size() > MAXIMO_ENDPOINTS) {
                break;
            }
        }
        return new Rotas(endpoints, comRotas);
    }

    private record Rotas(List<Endpoint> endpoints, List<String> arquivosComRotas) {
    }

    /** O prefixo da pasta (o pacote incluído) e o do próprio arquivo, nessa ordem. */
    private String prefixoDoArquivo(String caminho, Map<String, String> prefixos) {
        String[] partes = caminho.split("/");
        String arquivo = partes[partes.length - 1];
        String modulo = arquivo.endsWith(".py") ? arquivo.substring(0, arquivo.length() - 3) : arquivo;
        String pasta = partes.length >= 2 ? partes[partes.length - 2] : "";
        String daPasta = pasta.equals(modulo) ? "" : prefixos.getOrDefault(pasta, "");
        return daPasta + prefixos.getOrDefault(modulo, "");
    }

    private boolean ehCodigoDeProducao(String caminho) {
        return ConvencaoPython.ehCodigo(caminho) && !ConvencaoPython.ehTeste(caminho);
    }

    /** Mixins, managers e a classe base não são entidades do negócio. */
    private boolean ehApoioDeModelo(String classeComArquivo) {
        String nome = ConvencaoPython.INSTANCIA.nome(classeComArquivo);
        return nome.endsWith("Mixin") || nome.endsWith("Manager") || nome.equals("Base");
    }

    private boolean ehArquivoDeEntrada(String caminho) {
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
