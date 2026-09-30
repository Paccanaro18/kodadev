package com.koda.v1.analyzer.contexto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RecursoDoCaminhoTest {

    @Test
    void deveDevolverOPrimeiroSegmentoQueNaoEPrefixoDeApi() {
        assertThat(RecursoDoCaminho.de("/pedidos")).contains("pedidos");
        assertThat(RecursoDoCaminho.de("/pedidos/{id}/itens")).contains("pedidos");
        assertThat(RecursoDoCaminho.de("/api/pedidos")).contains("pedidos");
        assertThat(RecursoDoCaminho.de("/api/v1/order-items")).contains("order-items");
        assertThat(RecursoDoCaminho.de("/V2/clientes")).contains("clientes");
    }

    @Test
    void naoDeveDevolverRecursoParaCaminhosSemNome() {
        assertThat(RecursoDoCaminho.de("/")).isEmpty();
        assertThat(RecursoDoCaminho.de("")).isEmpty();
        assertThat(RecursoDoCaminho.de("/api")).isEmpty();
        assertThat(RecursoDoCaminho.de("/{id}")).isEmpty();
        assertThat(RecursoDoCaminho.de("/api/v1")).isEmpty();
    }
}
