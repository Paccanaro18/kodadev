package com.koda.v1.challenge.ia;

public enum MotivoFalhaIa {
    INDISPONIVEL("O provedor de IA não respondeu. Tente novamente em instantes."),
    LIMITE_ATINGIDO("O limite de uso do provedor de IA foi atingido. Tente novamente mais tarde."),
    NAO_AUTORIZADO("O provedor de IA recusou as credenciais configuradas."),
    RESPOSTA_INVALIDA("O provedor de IA devolveu uma resposta inválida."),
    RESPOSTA_GRANDE_DEMAIS("A resposta do provedor de IA passou do tamanho permitido.");

    private final String mensagem;

    MotivoFalhaIa(String mensagem) {
        this.mensagem = mensagem;
    }

    public String mensagem() {
        return mensagem;
    }
}
