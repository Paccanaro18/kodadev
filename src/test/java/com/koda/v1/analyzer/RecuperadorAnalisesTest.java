package com.koda.v1.analyzer;

import com.koda.v1.analyzer.persistence.RegistroAnalise;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class RecuperadorAnalisesTest {

    @Test
    void deveFalharAsAnalisesQueFicaramEmAbertoAoIniciar() {
        RegistroAnalise registro = mock(RegistroAnalise.class);

        new RecuperadorAnalises(registro).run(null);

        verify(registro).falharAnalisesEmAberto(RecuperadorAnalises.MENSAGEM_INTERROMPIDA);
    }
}
