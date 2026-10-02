package com.koda.v1.analyzer.contexto;

import com.koda.v1.analyzer.ResultadoAnalise;
import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.ecossistema.ConvencaoDeNomes;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

@Component
public class MontadorContexto {

    static final int MAXIMO_DOMINIOS = 15;
    static final int MAXIMO_FEATURES = 30;
    static final int MAXIMO_ENDPOINTS = SanitizadorIdentificador.MAXIMO_ITENS_POR_LISTA;

    private static final List<String> SUFIXOS_DE_DOMINIO =
            List.of("ServiceImpl", "Service", "Controller", "Repository");
    private static final List<String> SUFIXOS_DE_DTO = List.of("Dto", "DTO", "Request", "Response");
    private static final List<String> SUFIXOS_DE_TRATADOR =
            List.of("ExceptionHandler", "ControllerAdvice", "ErrorHandler");
    private static final String SUFIXO_DE_EXCECAO = "Exception";

    private static final Map<String, String> CAMADA_POR_PASTA = Map.ofEntries(
            Map.entry("controller", "controller"), Map.entry("controllers", "controller"),
            Map.entry("web", "controller"), Map.entry("rest", "controller"), Map.entry("api", "controller"),
            Map.entry("service", "service"), Map.entry("services", "service"),
            Map.entry("repository", "repository"), Map.entry("repositories", "repository"),
            Map.entry("dao", "repository"));
    private static final Set<String> PASTAS_DE_PORTAS_E_ADAPTADORES =
            Set.of("adapter", "adapters", "port", "ports");
    private static final Set<String> PASTAS_DE_NUCLEO = Set.of("domain", "application");

    private static final Set<String> NOMES_DE_COMPOSE =
            Set.of("docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml");
    private static final String NOME_DO_DOCKERFILE = "Dockerfile";

    private final SanitizadorIdentificador sanitizador;

    public MontadorContexto(SanitizadorIdentificador sanitizador) {
        this.sanitizador = sanitizador;
    }

    public ContextoProjeto montar(ResultadoAnalise resultado, List<String> caminhosDaArvore) {
        Objects.requireNonNull(resultado, "O resultado da análise é obrigatório");
        Objects.requireNonNull(caminhosDaArvore, "Os caminhos da árvore são obrigatórios");

        Balanco balanco = new Balanco();
        ConvencaoDeNomes convencao = ConvencaoDeNomes.de(resultado.linguagem());
        List<String> arquivosDeMain = convencao.arquivosDeFonte(caminhosDaArvore);

        List<EndpointContexto> endpoints = endpoints(resultado.endpoints(), balanco);
        ComponentesContexto componentes = componentes(resultado, arquivosDeMain, convencao, balanco);

        return new ContextoProjeto(
                ContextoProjeto.VERSAO_ESQUEMA,
                resultado.linguagem(),
                resultado.framework(),
                sanitizador.versao(resultado.versaoLinguagem()).orElse(null),
                sanitizador.versao(resultado.versaoFramework()).orElse(null),
                resultado.ferramentaDeBuild(),
                arquitetura(resultado, arquivosDeMain, convencao),
                dominios(resultado, convencao, balanco),
                resultado.tecnologias(),
                features(endpoints, balanco),
                endpoints,
                componentes,
                testes(resultado, convencao, balanco),
                infra(caminhosDaArvore),
                resultado.parcial(),
                balanco.truncado,
                balanco.descartados);
    }

    private Arquitetura arquitetura(ResultadoAnalise resultado, List<String> arquivosDeMain, ConvencaoDeNomes convencao) {
        Set<String> pastas = new HashSet<>();
        Map<String, Set<String>> camadasPorPasta = new HashMap<>();

        for (String arquivo : arquivosDeMain) {
            String pasta = pastaDe(arquivo);
            String nome = convencao.nome(arquivo);
            for (String segmento : pasta.split("/")) {
                pastas.add(segmento.toLowerCase());
            }
            camadaPeloSufixo(nome).ifPresent(camada ->
                    camadasPorPasta.computeIfAbsent(pasta, chave -> new HashSet<>()).add(camada));
        }

        if (contemAlgum(pastas, PASTAS_DE_PORTAS_E_ADAPTADORES) && contemAlgum(pastas, PASTAS_DE_NUCLEO)) {
            return Arquitetura.HEXAGONAL;
        }

        long camadasEmPastasProprias = pastas.stream()
                .map(CAMADA_POR_PASTA::get)
                .filter(Objects::nonNull)
                .distinct()
                .count();
        if (camadasEmPastasProprias >= 2) {
            return Arquitetura.EM_CAMADAS;
        }

        long pastasComVariasCamadas = camadasPorPasta.values().stream().filter(c -> c.size() >= 2).count();
        if (pastasComVariasCamadas >= 2) {
            return Arquitetura.POR_FEATURE;
        }

        long camadasPresentes = Stream.of(
                        resultado.controllers(), resultado.services(), resultado.repositories())
                .filter(lista -> !lista.isEmpty())
                .count();
        return camadasPresentes >= 2 ? Arquitetura.EM_CAMADAS : Arquitetura.INDEFINIDA;
    }

    private Optional<String> camadaPeloSufixo(String nome) {
        if (nome.endsWith("Controller")) {
            return Optional.of("controller");
        }
        if (nome.endsWith("Service") || nome.endsWith("ServiceImpl")) {
            return Optional.of("service");
        }
        if (nome.endsWith("Repository")) {
            return Optional.of("repository");
        }
        return Optional.empty();
    }

    private List<String> dominios(ResultadoAnalise resultado, ConvencaoDeNomes convencao, Balanco balanco) {
        List<String> nomes = Stream.concat(resultado.controllers().stream(), resultado.entidades().stream())
                .map(convencao::nome)
                .map(this::semSufixoDeDominio)
                .sorted()
                .toList();
        return listarDerivada(nomes, MAXIMO_DOMINIOS, balanco);
    }

    private String semSufixoDeDominio(String nome) {
        return SUFIXOS_DE_DOMINIO.stream()
                .filter(sufixo -> nome.endsWith(sufixo) && nome.length() > sufixo.length())
                .findFirst()
                .map(sufixo -> nome.substring(0, nome.length() - sufixo.length()))
                .orElse(nome);
    }

    private List<EndpointContexto> endpoints(List<Endpoint> brutos, Balanco balanco) {
        List<EndpointContexto> endpoints = new ArrayList<>();

        for (Endpoint bruto : brutos) {
            Optional<String> metodo = sanitizador.metodoHttp(bruto.metodoHttp());
            Optional<String> caminho = sanitizador.caminhoDeEndpoint(bruto.caminho());
            Optional<String> controller = sanitizador.identificador(bruto.controller());

            if (metodo.isEmpty() || caminho.isEmpty() || controller.isEmpty()) {
                balanco.descartados++;
            } else if (endpoints.size() >= MAXIMO_ENDPOINTS) {
                balanco.truncado = true;
            } else {
                endpoints.add(new EndpointContexto(metodo.get(), caminho.get(), controller.get()));
            }
        }
        return endpoints;
    }

    private List<String> features(List<EndpointContexto> endpoints, Balanco balanco) {
        Set<String> recursos = new LinkedHashSet<>();
        for (EndpointContexto endpoint : endpoints) {
            RecursoDoCaminho.de(endpoint.caminho()).ifPresent(recursos::add);
        }
        balanco.truncado |= recursos.size() > MAXIMO_FEATURES;
        return recursos.stream().limit(MAXIMO_FEATURES).toList();
    }

    private ComponentesContexto componentes(ResultadoAnalise resultado, List<String> arquivosDeMain,
                                            ConvencaoDeNomes convencao, Balanco balanco) {
        List<String> nomesDeArquivos = nomesDeClasses(arquivosDeMain, convencao);

        return new ComponentesContexto(
                listar(nomesDeClasses(resultado.controllers(), convencao), balanco),
                listar(nomesDeClasses(resultado.services(), convencao), balanco),
                listar(nomesDeClasses(resultado.repositories(), convencao), balanco),
                listar(nomesDeClasses(resultado.entidades(), convencao), balanco),
                listar(comSufixo(nomesDeArquivos, SUFIXOS_DE_DTO), balanco),
                listar(comSufixo(nomesDeArquivos, List.of(SUFIXO_DE_EXCECAO)), balanco),
                !comSufixo(nomesDeArquivos, SUFIXOS_DE_TRATADOR).isEmpty());
    }

    private TestesContexto testes(ResultadoAnalise resultado, ConvencaoDeNomes convencao, Balanco balanco) {
        Set<String> classesDeTeste = new HashSet<>(nomesDeClasses(resultado.testes(), convencao));

        List<String> servicesSemTeste = nomesDeClasses(resultado.services(), convencao).stream()
                .filter(nome -> !temTeste(nome, classesDeTeste))
                .toList();
        List<String> controllersSemTeste = nomesDeClasses(resultado.controllers(), convencao).stream()
                .filter(nome -> !temTeste(nome, classesDeTeste))
                .toList();

        return new TestesContexto(
                resultado.testes().size(),
                listarDerivada(servicesSemTeste, SanitizadorIdentificador.MAXIMO_ITENS_POR_LISTA, balanco),
                listarDerivada(controllersSemTeste, SanitizadorIdentificador.MAXIMO_ITENS_POR_LISTA, balanco));
    }

    private boolean temTeste(String nome, Set<String> classesDeTeste) {
        String semImpl = nome.endsWith("Impl") ? nome.substring(0, nome.length() - "Impl".length()) : nome;
        return Stream.of(nome, semImpl).anyMatch(base ->
                classesDeTeste.contains(base + "Test")
                        || classesDeTeste.contains(base + "Tests")
                        || classesDeTeste.contains(base + "IT"));
    }

    private InfraContexto infra(List<String> caminhosDaArvore) {
        boolean temDockerfile = false;
        boolean temCompose = false;

        for (String caminho : caminhosDaArvore) {
            String arquivo = caminho.substring(caminho.lastIndexOf('/') + 1);
            temDockerfile |= arquivo.equals(NOME_DO_DOCKERFILE);
            temCompose |= NOMES_DE_COMPOSE.contains(caminho);
        }
        return new InfraContexto(temDockerfile, temCompose);
    }

    private List<String> comSufixo(Collection<String> nomes, List<String> sufixos) {
        return nomes.stream()
                .filter(nome -> sufixos.stream().anyMatch(sufixo -> nome.endsWith(sufixo) && nome.length() > sufixo.length()))
                .toList();
    }

    private List<String> nomesDeClasses(Collection<String> caminhos, ConvencaoDeNomes convencao) {
        return caminhos.stream().map(convencao::nome).sorted().toList();
    }

    private String pastaDe(String caminhoRelativo) {
        int barra = caminhoRelativo.lastIndexOf('/');
        return barra < 0 ? "" : caminhoRelativo.substring(0, barra);
    }

    private boolean contemAlgum(Set<String> pastas, Set<String> procuradas) {
        return procuradas.stream().anyMatch(pastas::contains);
    }

    private List<String> listar(Collection<String> brutos, Balanco balanco) {
        ListaSanitizada lista = sanitizador.identificadores(brutos);
        balanco.descartados += lista.descartados();
        balanco.truncado |= lista.truncada();
        return lista.itens();
    }

    private List<String> listarDerivada(Collection<String> brutos, int maximo, Balanco balanco) {
        ListaSanitizada lista = sanitizador.identificadores(brutos);
        balanco.truncado |= lista.truncada() || lista.itens().size() > maximo;
        return lista.itens().stream().limit(maximo).toList();
    }

    private static final class Balanco {
        private int descartados;
        private boolean truncado;
    }
}
