package com.koda.v1.plano;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AssinaturaTest {

    private static final Instant INICIO = Instant.parse("2026-10-01T00:00:00Z");
    private static final Instant FIM = Instant.parse("2026-11-01T00:00:00Z");

    @Test
    void deveEstarVigenteEntreOInicioEOFim() {
        Assinatura assinatura = new Assinatura(UUID.randomUUID(), Plano.PRO, INICIO, FIM);

        assertThat(assinatura.vigenteEm(INICIO)).isTrue();
        assertThat(assinatura.vigenteEm(Instant.parse("2026-10-15T00:00:00Z"))).isTrue();
        assertThat(assinatura.vigenteEm(FIM.minusSeconds(1))).isTrue();
    }

    @Test
    void naoDeveEstarVigenteAntesDoInicioNemNoFim() {
        Assinatura assinatura = new Assinatura(UUID.randomUUID(), Plano.PRO, INICIO, FIM);

        assertThat(assinatura.vigenteEm(INICIO.minusSeconds(1))).isFalse();
        assertThat(assinatura.vigenteEm(FIM)).isFalse();
    }

    @Test
    void semDataDeFimDeveFicarVigentePraSempre() {
        Assinatura assinatura = new Assinatura(UUID.randomUUID(), Plano.PRO, INICIO, null);

        assertThat(assinatura.vigenteEm(Instant.parse("2040-01-01T00:00:00Z"))).isTrue();
    }

    @Test
    void deveExigirUsuarioPlanoEInicio() {
        assertThatThrownBy(() -> new Assinatura(null, Plano.PRO, INICIO, null)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new Assinatura(UUID.randomUUID(), null, INICIO, null)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new Assinatura(UUID.randomUUID(), Plano.PRO, null, null)).isInstanceOf(NullPointerException.class);
    }
}
