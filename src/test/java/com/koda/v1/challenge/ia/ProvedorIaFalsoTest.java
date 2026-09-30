package com.koda.v1.challenge.ia;

import com.koda.v1.challenge.ConteudoDesafio;
import com.koda.v1.challenge.VerificadorConteudo;
import com.koda.v1.challenge.prompt.PromptDesafio;
import com.koda.v1.challenge.similaridade.DetectorSimilaridade;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ProvedorIaFalsoTest {

    private final ProvedorIaFalso provedor = new ProvedorIaFalso();
    private final VerificadorConteudo verificador = new VerificadorConteudo();

    private PromptDesafio prompt(String angulo, String alvo, String habilidades) {
        return new PromptDesafio("sistema", "Tipo do ticket: Feature (nova funcionalidade)\n"
                + "Ângulo: " + angulo + "\n"
                + "O que o ticket deve pedir: algo\n"
                + "Alvo: " + alvo + "\n"
                + "Habilidades que o ticket pode praticar: " + habilidades + "\n");
    }

    @Test
    void deveDevolverUmTicketQueOVerificadorAceita() {
        RespostaIa resposta = provedor.gerar(prompt("Paginação de uma listagem", "endpoint GET /pedidos", "Paginação, Spring Data"));

        ConteudoDesafio conteudo = verificador.verificar(resposta.texto());

        assertThat(resposta.modelo()).isEqualTo("simulado");
        assertThat(conteudo.titulo()).startsWith("[Simulado]").contains("Paginação de uma listagem");
        assertThat(conteudo.objetivo()).contains("endpoint GET /pedidos");
        assertThat(conteudo.habilidades()).containsExactly("Paginação", "Spring Data");
    }

    @Test
    void deveSerDeterministicoParaOMesmoPrompt() {
        PromptDesafio pedido = prompt("Paginação", "classe PedidoService", "JUnit 5");

        assertThat(provedor.gerar(pedido)).isEqualTo(provedor.gerar(pedido));
    }

    @Test
    void deveGerarTicketsDiferentesParaPromptsDiferentes() {
        ConteudoDesafio um = verificador.verificar(provedor.gerar(prompt("Paginação", "endpoint GET /pedidos", "Paginação")).texto());
        ConteudoDesafio outro = verificador.verificar(
                provedor.gerar(prompt("Teste unitário de um service", "classe ClienteService", "JUnit 5")).texto());

        assertThat(um.titulo()).isNotEqualTo(outro.titulo());
        assertThat(new DetectorSimilaridade(0.70).pontuacao(um, outro)).isLessThan(0.70);
    }

    @Test
    void naoDeveSerBarradoPelaSimilaridadeAoGerarVariosTicketsSeguidos() {
        DetectorSimilaridade detector = new DetectorSimilaridade(0.70);
        String[][] pedidos = {
                {"Paginação de uma listagem", "endpoint GET /pedidos"},
                {"Filtro opcional em uma listagem", "endpoint GET /clientes"},
                {"Teste unitário de um service sem cobertura", "classe ClienteService"},
                {"Item inexistente responde com erro interno", "endpoint GET /pedidos/{id}"},
                {"Exclusão de um recurso", "recurso clientes (controller ClienteController)"}};

        java.util.List<ConteudoDesafio> gerados = new java.util.ArrayList<>();
        for (String[] pedido : pedidos) {
            ConteudoDesafio novo = verificador.verificar(provedor.gerar(prompt(pedido[0], pedido[1], "Habilidade")).texto());
            assertThat(detector.buscarParecido(novo, gerados)).as(pedido[0]).isEmpty();
            gerados.add(0, novo);
        }
    }

    @Test
    void deveAguentarUmPromptSemAsLinhasEsperadas() {
        RespostaIa resposta = provedor.gerar(new PromptDesafio("s", "qualquer coisa"));

        ConteudoDesafio conteudo = verificador.verificar(resposta.texto());

        assertThat(conteudo.titulo()).contains("ângulo não informado");
        assertThat(conteudo.habilidades()).containsExactly("Simulação");
    }

    @Test
    void deveCortarTituloMuitoLongo() {
        String angulo = "a".repeat(300);

        ConteudoDesafio conteudo = verificador.verificar(provedor.gerar(prompt(angulo, "classe X", "Y")).texto());

        assertThat(conteudo.titulo()).hasSizeLessThanOrEqualTo(100);
    }
}
