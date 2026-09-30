package com.koda.v1.challenge.geracao;

import com.koda.v1.challenge.persistence.RegistroDesafio;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class RecuperadorDesafios implements ApplicationRunner {

    static final String MENSAGEM_INTERROMPIDA =
            "A geração do desafio foi interrompida porque o servidor foi reiniciado.";

    private final RegistroDesafio registro;

    public RecuperadorDesafios(RegistroDesafio registro) {
        this.registro = registro;
    }

    @Override
    public void run(ApplicationArguments argumentos) {
        registro.falharGeracoesEmAberto(MENSAGEM_INTERROMPIDA);
    }
}
