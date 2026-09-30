package com.koda.v1.challenge.prompt;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.random.RandomGenerator;

@Component
public class Perspectivas {

    private static final List<String> TODAS = List.of(
            "a equipe financeira, que acompanha valores e cobranças",
            "o atendimento ao cliente, que precisa responder dúvidas rapidamente",
            "a equipe de produto, que quer medir o uso da funcionalidade",
            "a equipe de operações e logística, que depende de dados corretos no dia a dia",
            "um aplicativo mobile que consome a API e precisa de respostas previsíveis",
            "um parceiro externo que integra seu sistema com esta API",
            "a área de auditoria e compliance, que exige rastreabilidade",
            "a equipe de dados e relatórios, que extrai informações do sistema",
            "a equipe de segurança da informação, preocupada com o que a API expõe",
            "o suporte técnico de plantão, que investiga problemas reportados");

    private final RandomGenerator aleatorio;

    @Autowired
    public Perspectivas() {
        this(RandomGenerator.getDefault());
    }

    Perspectivas(RandomGenerator aleatorio) {
        this.aleatorio = aleatorio;
    }

    public List<String> todas() {
        return TODAS;
    }

    public boolean existe(String perspectiva) {
        return perspectiva != null && TODAS.contains(perspectiva);
    }

    public String escolher(List<String> usadasRecentemente) {
        List<String> embaralhadas = new ArrayList<>(TODAS);
        Collections.shuffle(embaralhadas, aleatorio);

        String escolhida = embaralhadas.get(0);
        int maiorIdade = idade(escolhida, usadasRecentemente);
        for (String candidata : embaralhadas) {
            int idade = idade(candidata, usadasRecentemente);
            if (idade > maiorIdade) {
                escolhida = candidata;
                maiorIdade = idade;
            }
        }
        return escolhida;
    }

    private int idade(String perspectiva, List<String> usadasRecentemente) {
        int posicao = usadasRecentemente.indexOf(perspectiva);
        return posicao < 0 ? Integer.MAX_VALUE : posicao;
    }
}
