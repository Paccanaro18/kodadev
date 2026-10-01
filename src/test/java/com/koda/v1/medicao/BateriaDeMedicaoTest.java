package com.koda.v1.medicao;

import com.koda.v1.challenge.ia.MotivoFalhaIa;
import com.koda.v1.challenge.ia.ProvedorIa;
import com.koda.v1.challenge.ia.ProvedorIaException;
import com.koda.v1.challenge.ia.ProvedorIaFalso;
import com.koda.v1.challenge.ia.RespostaIa;
import com.koda.v1.challenge.prompt.PromptDesafio;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

/** Garante que a bateria funciona de ponta a ponta com o provedor falso, para ela merecer confiança com o real. */
class BateriaDeMedicaoTest {

    @Test
    void deveAprovarTodosOsTicketsEDicasDoProvedorFalsoDeDeterministicoSemRepetirAngulo() {
        RelatorioDeMedicao relatorio = new BateriaDeMedicao(new ProvedorIaFalso())
                .executar(ContextosDeMedicao.rico(), 6, 2);

        assertThat(relatorio.ticketsPedidos).isEqualTo(6);
        assertThat(relatorio.ticketsNaPrimeira).isEqualTo(6);
        assertThat(relatorio.ticketsNaSegunda).isZero();
        assertThat(relatorio.ticketsFalharam).isZero();
        assertThat(relatorio.angulosDistintos).hasSize(6);
        assertThat(relatorio.maiorSimilaridade()).isLessThan(0.70);
        assertThat(relatorio.modelos).containsExactly(java.util.Map.entry("simulado", 6));
        assertThat(relatorio.dicasPedidas).isEqualTo(12);
        assertThat(relatorio.dicasNaPrimeira).isEqualTo(12);
        assertThat(relatorio.dicasFalharam).isZero();
        assertThat(relatorio.descartesDeTicket).isEmpty();
        assertThat(relatorio.duracoesDasChamadasEmMs).hasSize(18);
    }

    @Test
    void deveContarOsDescartesEAprovarNaSegundaQuandoOProvedorFalhaAntes() {
        ProvedorIa falho = new ProvedorIa() {
            private final ProvedorIaFalso falso = new ProvedorIaFalso();
            private final AtomicInteger chamadas = new AtomicInteger();

            @Override
            public RespostaIa gerar(PromptDesafio prompt) {
                // A primeira chamada de cada texto falha: ímpares falham, pares respondem.
                if (chamadas.incrementAndGet() % 2 == 1) {
                    throw new ProvedorIaException(MotivoFalhaIa.INDISPONIVEL);
                }
                return falso.gerar(prompt);
            }
        };

        RelatorioDeMedicao relatorio = new BateriaDeMedicao(falho).executar(ContextosDeMedicao.rico(), 3, 1);

        assertThat(relatorio.ticketsNaPrimeira).isZero();
        assertThat(relatorio.ticketsNaSegunda).isEqualTo(3);
        assertThat(relatorio.dicasNaSegunda).isEqualTo(3);
        assertThat(relatorio.descartesDeTicket).containsEntry("PROVEDOR_INDISPONIVEL", 3);
        assertThat(relatorio.descartesDeDica).containsEntry("PROVEDOR_INDISPONIVEL", 3);
    }

    @Test
    void deveContarAFalhaQuandoAsDuasTentativasVemForaDoFormato() {
        ProvedorIa lixo = prompt -> new RespostaIa("isso não é json", "modelo-ruim");

        RelatorioDeMedicao relatorio = new BateriaDeMedicao(lixo).executar(ContextosDeMedicao.rico(), 2, 3);

        assertThat(relatorio.ticketsFalharam).isEqualTo(2);
        assertThat(relatorio.ticketsAprovados()).isZero();
        assertThat(relatorio.dicasPedidas).isZero();
        assertThat(relatorio.descartesDeTicket).containsEntry("CONTEUDO_INVALIDO", 4);
        assertThat(relatorio.modelos).isEmpty();
    }

    @Test
    void deveEscreverORelatorioSoComNumerosEMotivosFixos() throws IOException {
        RelatorioDeMedicao relatorio = new BateriaDeMedicao(new ProvedorIaFalso())
                .executar(ContextosDeMedicao.pagamentos(), 1, 3);

        String texto = relatorio.paraMarkdown("auto:fast");

        assertThat(texto).contains("# Medição da IA", "Modelo pedido: `auto:fast`", "## Tickets", "## Dicas",
                "Aprovados na primeira tentativa: 1 de 1 (100%)", "Aprovadas na primeira tentativa: 3 de 3 (100%)",
                "Maior similaridade com um ticket anterior: 0,00".replace(',', '.'), "Mediana:");
        assertThat(texto).doesNotContain("[Simulado]");
    }

    @Test
    void deveCalcularPercentisDoTempoESerSeguroSemChamadas() {
        RelatorioDeMedicao vazio = new RelatorioDeMedicao();
        assertThat(vazio.percentilDaDuracao(0.95)).isZero();
        assertThat(vazio.maiorSimilaridade()).isZero();
        assertThat(vazio.tamanhoMedioDasDicas()).isZero();

        RelatorioDeMedicao relatorio = new RelatorioDeMedicao();
        for (long ms : new long[]{1000, 2000, 3000, 4000, 10_000}) {
            relatorio.duracoesDasChamadasEmMs.add(ms);
        }
        assertThat(relatorio.percentilDaDuracao(0.5)).isEqualTo(3000);
        assertThat(relatorio.percentilDaDuracao(1.0)).isEqualTo(10_000);
        assertThat(relatorio.paraMarkdown("")).contains("(padrão do provedor)");
    }
}
