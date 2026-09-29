package com.koda.v1.analyzer.detector;

import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Component
public class DetectorPom {

    private static final String NOME_ARQUIVO = "pom.xml";
    private static final String GRUPO_SPRING_BOOT = "org.springframework.boot";
    private static final List<String> PROPRIEDADES_JAVA = List.of(
            "java.version", "maven.compiler.release", "maven.compiler.source", "maven.compiler.target");

    public ResultadoPom detectar(String conteudo) {
        LimitesAnalise.validarTamanho(conteudo, NOME_ARQUIVO);

        Element projeto = lerRaiz(conteudo);

        String versaoSpringBoot = detectarVersaoSpringBoot(projeto);
        String versaoJava = detectarVersaoJava(projeto);
        List<String> dependencias = listarDependencias(projeto);
        Set<Tecnologia> tecnologias = detectarTecnologias(dependencias);

        return new ResultadoPom(versaoJava, versaoSpringBoot, dependencias, tecnologias);
    }

    private Element lerRaiz(String conteudo) {
        try {
            DocumentBuilderFactory fabrica = DocumentBuilderFactory.newInstance();
            fabrica.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
            fabrica.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            fabrica.setXIncludeAware(false);
            fabrica.setExpandEntityReferences(false);

            Document documento = fabrica.newDocumentBuilder()
                    .parse(new InputSource(new StringReader(conteudo)));
            Element raiz = documento.getDocumentElement();

            if (!"project".equals(raiz.getTagName())) {
                throw new ArquivoNaoAnalisavelException(NOME_ARQUIVO, "o elemento raiz não é <project>");
            }
            return raiz;
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new ArquivoNaoAnalisavelException(NOME_ARQUIVO, "XML inválido ou não permitido", e);
        }
    }

    private String detectarVersaoSpringBoot(Element projeto) {
        for (Element parent : filhos(projeto, "parent")) {
            if (GRUPO_SPRING_BOOT.equals(texto(parent, "groupId"))
                    && "spring-boot-starter-parent".equals(texto(parent, "artifactId"))) {
                return resolver(texto(parent, "version"), projeto);
            }
        }
        for (Element gerenciamento : filhos(projeto, "dependencyManagement")) {
            for (Element dependencias : filhos(gerenciamento, "dependencies")) {
                for (Element dependencia : filhos(dependencias, "dependency")) {
                    if ("spring-boot-dependencies".equals(texto(dependencia, "artifactId"))) {
                        return resolver(texto(dependencia, "version"), projeto);
                    }
                }
            }
        }
        return null;
    }

    private String detectarVersaoJava(Element projeto) {
        for (Element propriedades : filhos(projeto, "properties")) {
            for (String nome : PROPRIEDADES_JAVA) {
                String valor = resolver(texto(propriedades, nome), projeto);
                if (valor != null) {
                    return valor;
                }
            }
        }
        return null;
    }

    private List<String> listarDependencias(Element projeto) {
        List<String> resultado = new ArrayList<>();
        for (Element dependencias : filhos(projeto, "dependencies")) {
            for (Element dependencia : filhos(dependencias, "dependency")) {
                String grupo = texto(dependencia, "groupId");
                String artefato = texto(dependencia, "artifactId");
                if (grupo != null && artefato != null) {
                    resultado.add(grupo + ":" + artefato);
                }
            }
        }
        return resultado;
    }

    private Set<Tecnologia> detectarTecnologias(List<String> dependencias) {
        Set<Tecnologia> tecnologias = EnumSet.noneOf(Tecnologia.class);
        if (temAlguma(dependencias, "org.postgresql:postgresql")) {
            tecnologias.add(Tecnologia.POSTGRESQL);
        }
        if (temAlguma(dependencias, "org.springframework.boot:spring-boot-starter-amqp",
                "org.springframework.amqp:spring-rabbit")) {
            tecnologias.add(Tecnologia.RABBITMQ);
        }
        if (temAlguma(dependencias, "org.springframework.boot:spring-boot-starter-data-redis",
                "redis.clients:jedis", "io.lettuce:lettuce-core")) {
            tecnologias.add(Tecnologia.REDIS);
        }
        return tecnologias;
    }

    private boolean temAlguma(List<String> dependencias, String... procuradas) {
        for (String procurada : procuradas) {
            if (dependencias.contains(procurada)) {
                return true;
            }
        }
        return false;
    }

    private String resolver(String valor, Element projeto) {
        if (valor == null) {
            return null;
        }
        if (valor.startsWith("${") && valor.endsWith("}")) {
            String nomePropriedade = valor.substring(2, valor.length() - 1);
            for (Element propriedades : filhos(projeto, "properties")) {
                String encontrado = texto(propriedades, nomePropriedade);
                if (encontrado != null && !encontrado.startsWith("${")) {
                    return encontrado;
                }
            }
            return null;
        }
        return valor;
    }

    private static List<Element> filhos(Element pai, String nome) {
        List<Element> resultado = new ArrayList<>();
        NodeList nos = pai.getChildNodes();
        for (int i = 0; i < nos.getLength(); i++) {
            if (nos.item(i) instanceof Element elemento && elemento.getTagName().equals(nome)) {
                resultado.add(elemento);
            }
        }
        return resultado;
    }

    private static String texto(Element pai, String nome) {
        List<Element> encontrados = filhos(pai, nome);
        if (encontrados.isEmpty()) {
            return null;
        }
        String conteudo = encontrados.get(0).getTextContent().trim();
        return conteudo.isEmpty() ? null : conteudo;
    }
}
