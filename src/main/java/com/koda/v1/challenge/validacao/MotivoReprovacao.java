package com.koda.v1.challenge.validacao;

/**
 * Motivos pelos quais um ticket gerado é recusado. O texto de orientação é fixo: é ele (e nunca o conteúdo
 * devolvido pela IA) que volta para o prompt da nova tentativa.
 */
public enum MotivoReprovacao {
    SOLUCAO_ENTREGUE("Não escreva código, nomes de métodos nem instruções de como implementar. Descreva só o resultado esperado."),
    REFERENCIA_INEXISTENTE("Cite apenas classes e endpoints que existem no contexto do projeto. Se algo for novo, diga que deve ser criado, sem dar nome de classe ou caminho."),
    CRITERIO_VAGO("Escreva critérios de aceite que possam ser verificados, com entrada e resultado observável, sem termos vagos como melhorar ou otimizar."),
    TIPO_INCOERENTE("Respeite o tipo do ticket: Bug descreve o problema que acontece hoje; Testing pede testes automatizados."),
    FORA_DO_ALVO("O ticket precisa tratar do alvo indicado, citando-o pelo nome."),
    ESCOPO_GRANDE("Reduza o escopo: um ticket júnior deve tocar poucas classes.");

    private final String orientacao;

    MotivoReprovacao(String orientacao) {
        this.orientacao = orientacao;
    }

    public String orientacao() {
        return orientacao;
    }
}
