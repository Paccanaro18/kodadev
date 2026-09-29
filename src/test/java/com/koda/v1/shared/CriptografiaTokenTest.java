package com.koda.v1.shared;

import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CriptografiaTokenTest {

    private static final String CHAVE_DE_TESTE =
            Base64.getEncoder().encodeToString(new byte[32]);

    private final CriptografiaToken criptografia = new CriptografiaToken(CHAVE_DE_TESTE);

    @Test
    void deveDescriptografarOQueFoiCriptografado() {
        String token = "gho_exemplo123";

        String cifrado = criptografia.criptografar(token);

        assertThat(cifrado).isNotEqualTo(token);
        assertThat(criptografia.descriptografar(cifrado)).isEqualTo(token);
    }

    @Test
    void deveGerarResultadosDiferentesParaOMesmoTexto() {
        String primeiro = criptografia.criptografar("gho_exemplo123");
        String segundo = criptografia.criptografar("gho_exemplo123");

        assertThat(primeiro).isNotEqualTo(segundo);
    }

    @Test
    void deveFalharSeOTextoCifradoForAlterado() {
        byte[] bytes = Base64.getDecoder().decode(criptografia.criptografar("gho_exemplo123"));
        bytes[bytes.length - 1] ^= 1;
        String adulterado = Base64.getEncoder().encodeToString(bytes);

        assertThatThrownBy(() -> criptografia.descriptografar(adulterado))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void deveRejeitarChaveComTamanhoErrado() {
        String chaveCurta = Base64.getEncoder().encodeToString(new byte[16]);

        assertThatThrownBy(() -> new CriptografiaToken(chaveCurta))
                .isInstanceOf(IllegalStateException.class);
    }
}
