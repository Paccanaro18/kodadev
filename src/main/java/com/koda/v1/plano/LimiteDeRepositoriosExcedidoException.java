package com.koda.v1.plano;

public class LimiteDeRepositoriosExcedidoException extends RuntimeException {

    public LimiteDeRepositoriosExcedidoException(Plano plano) {
        super("O plano " + plano.nome() + " permite " + plano.repositorios() + " "
                + (plano.repositorios() == 1 ? "repositório" : "repositórios")
                + ". Arquive um repositório conectado para liberar a vaga ou escolha um plano com mais espaço.");
    }
}
