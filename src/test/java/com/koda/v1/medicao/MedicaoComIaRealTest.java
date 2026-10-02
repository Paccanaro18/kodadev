package com.koda.v1.medicao;

import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.challenge.ia.ProvedorIaCompativelComOpenAi;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

import static org.assertj.core.api.Assumptions.assumeThat;

/**
 * Bateria de medição contra o provedor de IA de verdade. NÃO roda no {@code verify}: gasta a cota gratuita do provedor.
 *
 * <pre>
 *   set -a; . ./.env; set +a          # carrega KODA_IA_URL, KODA_IA_CHAVE e KODA_IA_MODELO no ambiente
 *   ./mvnw -Pmedicao test -Dtest=MedicaoComIaRealTest -Dmedicao.tickets=6 -Dmedicao.dicas=2
 * </pre>
 *
 * Opções: {@code -Dmedicao.tickets} (padrão 6), {@code -Dmedicao.dicas} de 0 a 3 por ticket (padrão 2),
 * {@code -Dmedicao.contexto=rico|pagamentos|<arquivo.json>} (padrão rico) e {@code -Dmedicao.relatorio=<nome>.md}.
 * O relatório vai para {@code target/medicao/relatorio.md} e só tem números e nomes fixos de motivo.
 * A chave nunca é impressa nem gravada.
 */
@Tag("medicao")
class MedicaoComIaRealTest {

    @Test
    void deveMedirATaxaDeAprovacaoDeTicketsEDicasComOProvedorReal() throws IOException {
        String url = System.getenv().getOrDefault("KODA_IA_URL", "");
        String chave = System.getenv().getOrDefault("KODA_IA_CHAVE", "");
        String modelo = System.getenv().getOrDefault("KODA_IA_MODELO", "");
        assumeThat(url).as("KODA_IA_URL no ambiente (carregue o .env no shell antes)").isNotBlank();
        assumeThat(modelo).as("KODA_IA_MODELO no ambiente").isNotBlank();
        assumeThat(url.startsWith("\"") || modelo.startsWith("\""))
                .as("valores entre aspas: escreva sem aspas ou carregue o .env pelo shell").isFalse();

        int tickets = Integer.getInteger("medicao.tickets", 6);
        int dicas = Integer.getInteger("medicao.dicas", 2);
        ContextoProjeto contexto = escolherContexto(System.getProperty("medicao.contexto"));

        var provedor = new ProvedorIaCompativelComOpenAi(url, chave, modelo, Duration.ofSeconds(60), 1500, 0.8);
        RelatorioDeMedicao relatorio = new BateriaDeMedicao(provedor).executar(contexto, tickets, dicas);

        String texto = relatorio.paraMarkdown(modelo);
        Path destino = Path.of("target", "medicao", System.getProperty("medicao.relatorio", "relatorio.md"));
        Files.createDirectories(destino.getParent());
        Files.writeString(destino, texto, StandardCharsets.UTF_8);
        System.out.println("\n" + texto + "\nRelatório salvo em " + destino.toAbsolutePath());
    }

    /** "rico" (padrão), "pagamentos" ou o caminho de um contexto gravado por AnaliseLocalParaMedicaoTest. */
    private static ContextoProjeto escolherContexto(String opcao) throws IOException {
        if ("pagamentos".equals(opcao)) {
            return ContextosDeMedicao.pagamentos();
        }
        if (opcao != null && opcao.endsWith(".json")) {
            String json = Files.readString(Path.of(opcao), StandardCharsets.UTF_8);
            return new com.koda.v1.analyzer.contexto.SerializadorContexto().deJson(json);
        }
        return ContextosDeMedicao.rico();
    }
}
