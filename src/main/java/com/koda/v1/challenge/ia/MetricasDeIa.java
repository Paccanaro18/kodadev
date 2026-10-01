package com.koda.v1.challenge.ia;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;

import java.util.function.Supplier;

/**
 * Contadores e tempos do que a IA faz no Koda, para a qualidade dela poder ser acompanhada sem medição manual. Os
 * rótulos são sempre nomes fixos (origem, resultado e motivo): nunca entra texto de ticket, de prompt ou de pessoa.
 */
@Component
public class MetricasDeIa {

    public static final String ORIGEM_DESAFIO = "desafio";
    public static final String ORIGEM_DICA = "dica";

    private final MeterRegistry registro;

    public MetricasDeIa(MeterRegistry registro) {
        this.registro = registro;
    }

    /** Uma geração terminou: o ticket (ou a dica) saiu pronto ou falhou de vez. */
    public void geracao(String origem, boolean pronto) {
        registro.counter("koda.ia.geracoes", "origem", origem, "resultado", pronto ? "pronto" : "falhou").increment();
    }

    /** Uma tentativa foi descartada (ainda pode haver outra). O motivo é um nome fixo, como CONTEUDO_INVALIDO. */
    public void tentativaDescartada(String origem, String motivo) {
        registro.counter("koda.ia.tentativas.descartadas", "origem", origem, "motivo", motivo).increment();
    }

    /** O validador reprovou o texto por um motivo. Um texto pode ter mais de um motivo. */
    public void reprovacaoDoValidador(String origem, String motivo) {
        registro.counter("koda.ia.validador.reprovacoes", "origem", origem, "motivo", motivo).increment();
    }

    /** Mede a chamada ao provedor de IA, com ou sem erro. */
    public <T> T medirChamada(String origem, Supplier<T> chamada) {
        Timer.Sample amostra = Timer.start(registro);
        String resultado = "ok";
        try {
            return chamada.get();
        } catch (RuntimeException e) {
            resultado = "erro";
            throw e;
        } finally {
            amostra.stop(registro.timer("koda.ia.chamadas", "origem", origem, "resultado", resultado));
        }
    }
}
