package com.koda.v1.plano;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class CotaMensalExcedidaException extends RuntimeException {

    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.of("pt", "BR"));

    public CotaMensalExcedidaException(Plano plano, Instant renovaEm) {
        super("Você usou os " + plano.ticketsPorMes() + " tickets do plano " + plano.nome()
                + " neste mês. A cota renova em " + DATA.format(renovaEm.atZone(CicloMensal.FUSO)) + ".");
    }
}
