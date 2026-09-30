package com.koda.v1.analyzer;

import com.koda.v1.analyzer.persistence.RegistroAnalise;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class RecuperadorAnalises implements ApplicationRunner {

    static final String MENSAGEM_INTERROMPIDA = "A análise foi interrompida porque o servidor foi reiniciado.";

    private final RegistroAnalise registro;

    public RecuperadorAnalises(RegistroAnalise registro) {
        this.registro = registro;
    }

    @Override
    public void run(ApplicationArguments argumentos) {
        registro.falharAnalisesEmAberto(MENSAGEM_INTERROMPIDA);
    }
}
