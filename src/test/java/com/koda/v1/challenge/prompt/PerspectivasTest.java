package com.koda.v1.challenge.prompt;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class PerspectivasTest {

    @Test
    void deveTerPerspectivasDiferentesEReconhecerSoAsDaLista() {
        Perspectivas perspectivas = new Perspectivas();

        assertThat(perspectivas.todas()).hasSizeGreaterThanOrEqualTo(10).doesNotHaveDuplicates();
        assertThat(perspectivas.existe(perspectivas.todas().get(3))).isTrue();
        assertThat(perspectivas.existe("qualquer coisa")).isFalse();
        assertThat(perspectivas.existe(null)).isFalse();
    }

    @Test
    void deveEscolherUmaNuncaUsadaAntesDeRepetir() {
        Perspectivas perspectivas = new Perspectivas(new Random(4));
        List<String> usadas = new ArrayList<>();
        Set<String> vistas = new HashSet<>();

        for (int i = 0; i < perspectivas.todas().size(); i++) {
            String escolhida = perspectivas.escolher(usadas);
            assertThat(vistas.add(escolhida)).as("repetiu na escolha %d", i).isTrue();
            usadas.add(0, escolhida);
        }

        assertThat(vistas).hasSameSizeAs(perspectivas.todas());
    }

    @Test
    void deveEscolherAMaisAntigaQuandoTodasJaForamUsadas() {
        Perspectivas perspectivas = new Perspectivas(new Random(1));
        List<String> maisRecentePrimeiro = new ArrayList<>(perspectivas.todas());

        assertThat(perspectivas.escolher(maisRecentePrimeiro))
                .isEqualTo(maisRecentePrimeiro.get(maisRecentePrimeiro.size() - 1));
    }

    @Test
    void deveSerDeterministicoComAMesmaSementeEVariarComOutras() {
        Set<String> primeirasEscolhas = new HashSet<>();
        for (long semente = 0; semente < 30; semente++) {
            primeirasEscolhas.add(new Perspectivas(new Random(semente)).escolher(List.of()));
        }

        assertThat(new Perspectivas(new Random(9)).escolher(List.of()))
                .isEqualTo(new Perspectivas(new Random(9)).escolher(List.of()));
        assertThat(primeirasEscolhas.size()).isGreaterThan(5);
    }
}
