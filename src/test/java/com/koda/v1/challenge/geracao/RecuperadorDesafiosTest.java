package com.koda.v1.challenge.geracao;

import com.koda.v1.challenge.persistence.RegistroDesafio;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class RecuperadorDesafiosTest {

    @Test
    void deveFalharAsGeracoesQueFicaramEmAbertoAoIniciar() {
        RegistroDesafio registro = mock(RegistroDesafio.class);

        new RecuperadorDesafios(registro).run(null);

        verify(registro).falharGeracoesEmAberto(RecuperadorDesafios.MENSAGEM_INTERROMPIDA);
    }
}
