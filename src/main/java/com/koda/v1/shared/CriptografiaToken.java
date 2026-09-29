package com.koda.v1.shared;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

@Component
public class CriptografiaToken {

    private static final String ALGORITMO = "AES/GCM/NoPadding";
    private static final int TAMANHO_CHAVE_BYTES = 32;
    private static final int TAMANHO_IV_BYTES = 12;
    private static final int TAMANHO_TAG_BITS = 128;

    private final SecretKey chave;
    private final SecureRandom aleatorio = new SecureRandom();

    public CriptografiaToken(@Value("${koda.seguranca.chave-criptografia}") String chaveBase64) {
        byte[] bytes = Base64.getDecoder().decode(chaveBase64);
        if (bytes.length != TAMANHO_CHAVE_BYTES) {
            throw new IllegalStateException(
                    "A chave de criptografia deve ter " + TAMANHO_CHAVE_BYTES + " bytes (AES-256)");
        }
        this.chave = new SecretKeySpec(bytes, "AES");
    }

    public String criptografar(String textoPuro) {
        try {
            byte[] iv = new byte[TAMANHO_IV_BYTES];
            aleatorio.nextBytes(iv);

            Cipher cifra = Cipher.getInstance(ALGORITMO);
            cifra.init(Cipher.ENCRYPT_MODE, chave, new GCMParameterSpec(TAMANHO_TAG_BITS, iv));
            byte[] cifrado = cifra.doFinal(textoPuro.getBytes(StandardCharsets.UTF_8));

            byte[] resultado = ByteBuffer.allocate(iv.length + cifrado.length)
                    .put(iv)
                    .put(cifrado)
                    .array();
            return Base64.getEncoder().encodeToString(resultado);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Falha ao criptografar", e);
        }
    }

    public String descriptografar(String textoCriptografado) {
        try {
            byte[] tudo = Base64.getDecoder().decode(textoCriptografado);
            byte[] iv = Arrays.copyOfRange(tudo, 0, TAMANHO_IV_BYTES);
            byte[] cifrado = Arrays.copyOfRange(tudo, TAMANHO_IV_BYTES, tudo.length);

            Cipher cifra = Cipher.getInstance(ALGORITMO);
            cifra.init(Cipher.DECRYPT_MODE, chave, new GCMParameterSpec(TAMANHO_TAG_BITS, iv));
            return new String(cifra.doFinal(cifrado), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            throw new IllegalStateException("Falha ao descriptografar", e);
        }
    }
}
