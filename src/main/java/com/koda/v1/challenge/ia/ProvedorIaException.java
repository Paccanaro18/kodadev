package com.koda.v1.challenge.ia;

public class ProvedorIaException extends RuntimeException {

    private final MotivoFalhaIa motivo;

    public ProvedorIaException(MotivoFalhaIa motivo) {
        super(motivo.mensagem());
        this.motivo = motivo;
    }

    public MotivoFalhaIa getMotivo() {
        return motivo;
    }
}
