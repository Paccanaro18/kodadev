package com.koda.v1.analyzer.ecossistema.node;

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
import com.koda.v1.analyzer.ecossistema.LeitorDeArquivos;
import com.koda.v1.analyzer.ecossistema.ProdutoDaAnalise;
import com.koda.v1.github.dto.ArvoreResposta;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Servidores Node em TypeScript ou JavaScript: NestJS, Express, Fastify, Koa, Hono, Hapi e Next.js. */
@Component
public class EcossistemaNode implements Ecossistema {

    static final int MAXIMO_ENDPOINTS = 500;
    static final int MAXIMO_ARQUIVOS_DE_ROTA = 80;
    static final String CAMINHO_PRISMA = "prisma/schema.prisma";
    static final String MENSAGEM_SEM_PACKAGE_JSON = "Não encontramos um package.json legível na raiz do repositório.";
    static final String MENSAGEM_SEM_FRAMEWORK =
            "O repositório não parece um servidor Node (NestJS, Express, Fastify, Koa, Hono, Hapi ou Next.js).";

    private static final Set<String> ARQUIVOS_DE_ENTRADA = Set.of("app", "server", "index", "main");
    private static final Pattern MODEL_DO_PRISMA = Pattern.compile("(?m)^\\s{0,10}model\\s+(\\w{1,60})\\s*\\{");

    private final DetectorPackageJson detectorPackageJson;
    private final DetectorRotasNode detectorRotas;
    private final DetectorDockerCompose detectorCompose;
    private final MontadorContexto montadorContexto;

    public EcossistemaNode(DetectorPackageJson detectorPackageJson,
                           DetectorRotasNode detectorRotas,
                           DetectorDockerCompose detectorCompose,
                           MontadorContexto montadorContexto) {
        this.detectorPackageJson = detectorPackageJson;
        this.detectorRotas = detectorRotas;
        this.detectorCompose = detectorCompose;
        this.montadorContexto = montadorContexto;
    }

    @Override
    public int peso(List<String> caminhosDeArquivos) {
        if (!caminhosDeArquivos.contains("package.json")) {
            return 0;
        }
        return ConvencaoNode.INSTANCIA.arquivosDeFonte(caminhosDeArquivos).size();
    }

    @Override
    public ProdutoDaAnalise analisar(ArvoreResposta arvore, LeitorDeArquivos leitor) {
        ArvoreDoRepositorio arquivos = new ArvoreDoRepositorio(arvore.itens());

        ArquivoParaAbrir packageJson = arquivos.naRaiz("package.json")
                .orElseThrow(() -> new AnaliseRecusadaException(MENSAGEM_SEM_PACKAGE_JSON));
        ResultadoPackageJson pacote =
                detectorPackageJson.detectar(leitor.ler(packageJson), arquivos.temNaRaiz("tsconfig.json"));
        if (!pacote.temFramework()) {
            throw new AnaliseRecusadaException(MENSAGEM_SEM_FRAMEWORK);
        }

        List<String> caminhos = arquivos.caminhos();
        List<String> fontes = ConvencaoNode.INSTANCIA.arquivosDeFonte(caminhos);

        List<String> controllers = new ArrayList<>();
        List<String> services = new ArrayList<>();
        List<String> repositories = new ArrayList<>();
        List<String> entidades = new ArrayList<>();
        for (String fonte : fontes) {
            switch (PapelNoNode.de(fonte)) {
                case CONTROLLER -> controllers.add(fonte);
                case SERVICE -> services.add(fonte);
                case REPOSITORY -> repositories.add(fonte);
                case ENTIDADE -> entidades.add(fonte);
                case OUTRO -> { }
            }
        }
        entidades.addAll(modelsDoPrisma(arquivos, leitor));

        List<String> testes = caminhos.stream()
                .filter(caminho -> ConvencaoNode.ehCodigo(caminho) && ConvencaoNode.ehTeste(caminho))
                .toList();

        boolean limitesAplicados = false;
        List<Endpoint> endpoints = detectarEndpoints(arquivos, leitor, controllers);
        if (endpoints.size() > MAXIMO_ENDPOINTS) {
            endpoints = List.copyOf(endpoints.subList(0, MAXIMO_ENDPOINTS));
            limitesAplicados = true;
        }

        ResultadoCompose compose = arquivos.compose()
                .flatMap(arquivo -> leitor.lerEAnalisar(arquivo, detectorCompose::detectar))
                .orElse(null);
        Set<Tecnologia> tecnologias = EnumSet.noneOf(Tecnologia.class);
        tecnologias.addAll(pacote.tecnologias());
        if (compose != null) {
            tecnologias.addAll(compose.tecnologias());
        }

        boolean parcial = arvore.truncada() || arquivos.limitou() || leitor.parcial() || limitesAplicados;

        ResultadoAnalise resultado = new ResultadoAnalise(
                pacote.linguagem(),
                pacote.framework(),
                !fontes.isEmpty(),
                pacote.versaoLinguagem(),
                pacote.versaoFramework(),
                gerenciadorDePacotes(arquivos),
                pacote.dependencias(),
                List.copyOf(tecnologias),
                compose == null ? List.of() : compose.imagens(),
                controllers,
                services,
                repositories,
                entidades,
                testes,
                endpoints,
                parcial);
        ContextoProjeto contexto = montadorContexto.montar(resultado, caminhos);

        return new ProdutoDaAnalise(resultado, contexto);
    }

    private List<Endpoint> detectarEndpoints(ArvoreDoRepositorio arquivos, LeitorDeArquivos leitor,
                                             List<String> controllers) {
        Set<String> conhecidos = Set.copyOf(controllers);
        List<ArquivoParaAbrir> candidatos = arquivos.escolher(
                caminho -> conhecidos.contains(caminho) || ehArquivoDeEntrada(caminho), MAXIMO_ARQUIVOS_DE_ROTA);

        List<Endpoint> endpoints = new ArrayList<>();
        for (ArquivoParaAbrir candidato : candidatos) {
            String nome = ConvencaoNode.INSTANCIA.nome(candidato.caminho());
            leitor.lerEAnalisar(candidato, conteudo -> detectorRotas.detectar(conteudo, candidato.caminho(), nome))
                    .ifPresent(endpoints::addAll);
            if (endpoints.size() > MAXIMO_ENDPOINTS) {
                break;
            }
        }
        return endpoints;
    }

    private boolean ehArquivoDeEntrada(String caminho) {
        if (!ConvencaoNode.ehCodigo(caminho) || ConvencaoNode.ehTeste(caminho)) {
            return false;
        }
        String[] partes = caminho.split("/");
        String arquivo = partes[partes.length - 1];
        int ponto = arquivo.lastIndexOf('.');
        String stem = ponto < 0 ? arquivo : arquivo.substring(0, ponto);
        return partes.length <= 2 && ARQUIVOS_DE_ENTRADA.contains(stem);
    }

    private List<String> modelsDoPrisma(ArvoreDoRepositorio arquivos, LeitorDeArquivos leitor) {
        return arquivos.naRaiz(CAMINHO_PRISMA)
                .flatMap(arquivo -> leitor.lerEAnalisar(arquivo, this::models))
                .orElse(List.of())
                .stream()
                .map(nome -> CAMINHO_PRISMA + "#" + nome)
                .toList();
    }

    private List<String> models(String schema) {
        List<String> nomes = new ArrayList<>();
        Matcher model = MODEL_DO_PRISMA.matcher(schema);
        while (model.find()) {
            nomes.add(model.group(1));
        }
        return nomes;
    }

    private String gerenciadorDePacotes(ArvoreDoRepositorio arquivos) {
        if (arquivos.temNaRaiz("pnpm-lock.yaml")) {
            return "pnpm";
        }
        if (arquivos.temNaRaiz("yarn.lock")) {
            return "yarn";
        }
        if (arquivos.temNaRaiz("bun.lockb") || arquivos.temNaRaiz("bun.lock")) {
            return "bun";
        }
        return "npm";
    }
}
