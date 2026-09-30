package com.koda.v1.analyzer.contexto;

import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class SanitizadorIdentificador {

    static final int TAMANHO_MAXIMO_IDENTIFICADOR = 80;
    static final int TAMANHO_MAXIMO_CAMINHO = 120;
    static final int TAMANHO_MAXIMO_VERSAO = 30;
    static final int MAXIMO_ITENS_POR_LISTA = 100;

    private static final Pattern IDENTIFICADOR = Pattern.compile("[A-Za-z0-9_$]+");
    private static final Pattern CAMINHO = Pattern.compile("[A-Za-z0-9/_{}.:-]+");
    private static final Pattern VERSAO = Pattern.compile("[A-Za-z0-9._-]+");
    private static final Set<String> METODOS_HTTP =
            Set.of("GET", "POST", "PUT", "DELETE", "PATCH", "QUALQUER");

    public Optional<String> identificador(String bruto) {
        return aceitar(bruto, TAMANHO_MAXIMO_IDENTIFICADOR, IDENTIFICADOR);
    }

    public Optional<String> caminhoDeEndpoint(String bruto) {
        return aceitar(bruto, TAMANHO_MAXIMO_CAMINHO, CAMINHO);
    }

    public Optional<String> versao(String bruto) {
        return aceitar(bruto, TAMANHO_MAXIMO_VERSAO, VERSAO);
    }

    public Optional<String> metodoHttp(String bruto) {
        return Optional.ofNullable(bruto).filter(METODOS_HTTP::contains);
    }

    public ListaSanitizada identificadores(Collection<String> brutos) {
        Set<String> aceitos = new LinkedHashSet<>();
        int descartados = 0;

        for (String bruto : brutos) {
            Optional<String> valido = identificador(bruto);
            if (valido.isPresent()) {
                aceitos.add(valido.get());
            } else {
                descartados++;
            }
        }

        boolean truncada = aceitos.size() > MAXIMO_ITENS_POR_LISTA;
        return new ListaSanitizada(
                aceitos.stream().limit(MAXIMO_ITENS_POR_LISTA).toList(), descartados, truncada);
    }

    private Optional<String> aceitar(String bruto, int tamanhoMaximo, Pattern padrao) {
        if (bruto == null || bruto.isEmpty() || bruto.length() > tamanhoMaximo) {
            return Optional.empty();
        }
        return padrao.matcher(bruto).matches() ? Optional.of(bruto) : Optional.empty();
    }
}
