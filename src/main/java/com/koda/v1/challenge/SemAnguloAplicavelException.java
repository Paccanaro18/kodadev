package com.koda.v1.challenge;

public class SemAnguloAplicavelException extends RuntimeException {

    public SemAnguloAplicavelException() {
        super("Este projeto não tem nada aplicável para esse tipo de desafio.");
    }
}
