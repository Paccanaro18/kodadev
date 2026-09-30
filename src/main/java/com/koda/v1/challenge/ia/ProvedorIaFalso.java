package com.koda.v1.challenge.ia;

import com.koda.v1.challenge.prompt.PromptDesafio;
import tools.jackson.databind.json.JsonMapper;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ProvedorIaFalso implements ProvedorIa {

    static final String MODELO = "simulado";

    private static final String PREFIXO_ANGULO = "Ângulo: ";
    private static final String PREFIXO_ALVO = "Alvo: ";
    private static final String PREFIXO_HABILIDADES = "Habilidades que o ticket pode praticar: ";
    private static final int TAMANHO_MAXIMO_TITULO = 100;
    private static final JsonMapper MAPEADOR = JsonMapper.builder().build();

    @Override
    public RespostaIa gerar(PromptDesafio prompt) {
        String angulo = valorDaLinha(prompt.usuario(), PREFIXO_ANGULO, "ângulo não informado");
        String alvo = valorDaLinha(prompt.usuario(), PREFIXO_ALVO, "alvo não informado");

        Map<String, Object> conteudo = new LinkedHashMap<>();
        conteudo.put("titulo", cortar("[Simulado] " + angulo + " em " + alvo));
        conteudo.put("contexto", "Este ticket foi simulado, sem IA de verdade, para testar o fluxo de " + angulo + ".");
        conteudo.put("cenarioAtual", "Hoje, em " + alvo + ", o comportamento apresenta um problema em relação ao que o ângulo "
                + angulo + " descreve.");
        conteudo.put("objetivo", "Praticar " + angulo + " tendo como alvo " + alvo + ".");
        conteudo.put("regrasDeNegocio", List.of(
                "Respeitar o comportamento atual de " + alvo + ".",
                "Manter a tarefa pequena e delimitada, no nível júnior."));
        conteudo.put("requisitosTecnicos", List.of(
                "Reaproveitar as classes que já existem ao redor de " + alvo + " e cobrir o resultado com testes automatizados.",
                "Seguir o padrão de nomes e de camadas do projeto."));
        conteudo.put("criteriosDeAceite", List.of(
                "O resultado de " + angulo + " pode ser verificado em " + alvo + ".",
                "Nenhum comportamento existente deixa de funcionar."));
        conteudo.put("testesEsperados", List.of("Cobrir o cenário principal de " + alvo + "."));
        conteudo.put("restricoes", List.of("Não adicionar dependências novas ao projeto."));
        conteudo.put("habilidades", habilidades(prompt.usuario()));

        return new RespostaIa(MAPEADOR.writeValueAsString(conteudo), MODELO);
    }

    private List<String> habilidades(String usuario) {
        String linha = valorDaLinha(usuario, PREFIXO_HABILIDADES, "");
        List<String> habilidades = Arrays.stream(linha.split(","))
                .map(String::trim)
                .filter(habilidade -> !habilidade.isEmpty() && habilidade.length() <= 40)
                .limit(6)
                .toList();
        return habilidades.isEmpty() ? List.of("Simulação") : habilidades;
    }

    private String valorDaLinha(String usuario, String prefixo, String padrao) {
        return usuario.lines()
                .filter(linha -> linha.startsWith(prefixo))
                .map(linha -> linha.substring(prefixo.length()).trim())
                .findFirst()
                .orElse(padrao);
    }

    private String cortar(String titulo) {
        return titulo.length() <= TAMANHO_MAXIMO_TITULO ? titulo : titulo.substring(0, TAMANHO_MAXIMO_TITULO - 1) + "…";
    }
}
