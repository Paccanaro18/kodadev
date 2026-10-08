package com.koda.v1.plano;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PlanoTest {

    @Test
    void planoGratisDeveSerPequenoEOProMaior() {
        assertThat(Plano.GRATIS.ticketsPorMes()).isEqualTo(3);
        assertThat(Plano.GRATIS.repositorios()).isEqualTo(1);
        assertThat(Plano.PRO.ticketsPorMes()).isGreaterThan(Plano.GRATIS.ticketsPorMes());
        assertThat(Plano.PRO.repositorios()).isGreaterThan(Plano.GRATIS.repositorios());
    }

    @Test
    void deveTerNomeParaMostrarAoUsuario() {
        assertThat(Plano.GRATIS.nome()).isEqualTo("Grátis");
        assertThat(Plano.PRO.nome()).isEqualTo("Pro");
    }
}
