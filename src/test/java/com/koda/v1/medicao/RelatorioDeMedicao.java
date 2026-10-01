package com.koda.v1.medicao;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

/**
 * Números de uma bateria de medição da IA. Só guarda contagens, nomes fixos de motivo e números: nenhum texto de
 * ticket, de dica ou de prompt entra aqui, então o relatório pode ser compartilhado.
 */
public class RelatorioDeMedicao {

    public int ticketsPedidos;
    public int ticketsNaPrimeira;
    public int ticketsNaSegunda;
    public int ticketsFalharam;
    public final Map<String, Integer> descartesDeTicket = new TreeMap<>();
    public final Map<String, Integer> reprovacoesDeTicket = new TreeMap<>();
    public final List<Double> maiorSimilaridadePorTicket = new ArrayList<>();
    public final Set<String> angulosDistintos = new TreeSet<>();
    public final Map<String, Integer> modelos = new TreeMap<>();
    public final List<Long> duracoesDasChamadasEmMs = new ArrayList<>();

    public int dicasPedidas;
    public int dicasNaPrimeira;
    public int dicasNaSegunda;
    public int dicasFalharam;
    public final Map<String, Integer> descartesDeDica = new TreeMap<>();
    public final Map<String, Integer> reprovacoesDeDica = new TreeMap<>();
    public final List<Integer> tamanhosDasDicas = new ArrayList<>();

    public static void contar(Map<String, Integer> mapa, String chave) {
        mapa.merge(chave, 1, Integer::sum);
    }

    public int ticketsAprovados() {
        return ticketsNaPrimeira + ticketsNaSegunda;
    }

    public int dicasAprovadas() {
        return dicasNaPrimeira + dicasNaSegunda;
    }

    public double maiorSimilaridade() {
        return maiorSimilaridadePorTicket.stream().mapToDouble(Double::doubleValue).max().orElse(0);
    }

    public double percentilDaDuracao(double percentil) {
        if (duracoesDasChamadasEmMs.isEmpty()) {
            return 0;
        }
        List<Long> ordenadas = duracoesDasChamadasEmMs.stream().sorted().toList();
        int indice = (int) Math.min(ordenadas.size() - 1, Math.ceil(percentil * ordenadas.size()) - 1);
        return ordenadas.get(Math.max(0, indice));
    }

    public double tamanhoMedioDasDicas() {
        return tamanhosDasDicas.stream().mapToInt(Integer::intValue).average().orElse(0);
    }

    private static String taxa(int parte, int total) {
        return total == 0 ? "-" : String.format(Locale.ROOT, "%d de %d (%.0f%%)", parte, total, 100.0 * parte / total);
    }

    private static String mapa(Map<String, Integer> valores) {
        if (valores.isEmpty()) {
            return "nenhum";
        }
        return valores.entrySet().stream().map(e -> e.getKey() + " = " + e.getValue()).reduce((a, b) -> a + "; " + b).orElse("");
    }

    public String paraMarkdown(String modeloPedido) {
        StringBuilder s = new StringBuilder();
        s.append("# Medição da IA\n\n");
        s.append("Modelo pedido: `").append(modeloPedido.isBlank() ? "(padrão do provedor)" : modeloPedido).append("`\n\n");

        s.append("## Tickets\n\n");
        s.append("- Pedidos: ").append(ticketsPedidos).append('\n');
        s.append("- Aprovados na primeira tentativa: ").append(taxa(ticketsNaPrimeira, ticketsPedidos)).append('\n');
        s.append("- Aprovados só na segunda: ").append(taxa(ticketsNaSegunda, ticketsPedidos)).append('\n');
        s.append("- Falharam nas duas tentativas: ").append(taxa(ticketsFalharam, ticketsPedidos)).append('\n');
        s.append("- Tentativas descartadas por motivo: ").append(mapa(descartesDeTicket)).append('\n');
        s.append("- Reprovações do validador por motivo: ").append(mapa(reprovacoesDeTicket)).append('\n');
        s.append(String.format(Locale.ROOT, "- Maior similaridade com um ticket anterior: %.2f (limite 0,70)%n", maiorSimilaridade()));
        s.append("- Ângulos distintos nos aprovados: ").append(angulosDistintos.size()).append('\n');
        s.append("- Modelos que responderam: ").append(mapa(modelos)).append("\n\n");

        s.append("## Dicas\n\n");
        s.append("- Pedidas: ").append(dicasPedidas).append('\n');
        s.append("- Aprovadas na primeira tentativa: ").append(taxa(dicasNaPrimeira, dicasPedidas)).append('\n');
        s.append("- Aprovadas só na segunda: ").append(taxa(dicasNaSegunda, dicasPedidas)).append('\n');
        s.append("- Falharam nas duas tentativas: ").append(taxa(dicasFalharam, dicasPedidas)).append('\n');
        s.append("- Tentativas descartadas por motivo: ").append(mapa(descartesDeDica)).append('\n');
        s.append("- Reprovações do validador por motivo: ").append(mapa(reprovacoesDeDica)).append('\n');
        s.append(String.format(Locale.ROOT, "- Tamanho médio da dica aprovada: %.0f caracteres%n%n", tamanhoMedioDasDicas()));

        s.append("## Tempo das chamadas ao provedor\n\n");
        s.append("- Chamadas: ").append(duracoesDasChamadasEmMs.size()).append('\n');
        s.append(String.format(Locale.ROOT, "- Mediana: %.1f s | p95: %.1f s | maior: %.1f s%n",
                percentilDaDuracao(0.5) / 1000, percentilDaDuracao(0.95) / 1000, percentilDaDuracao(1.0) / 1000));
        return s.toString();
    }
}
