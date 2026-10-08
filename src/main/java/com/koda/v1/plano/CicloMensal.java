package com.koda.v1.plano;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public record CicloMensal(Instant inicio, Instant fim) {

    static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");

    public static CicloMensal contendo(Instant agora) {
        ZonedDateTime inicioDoMes = agora.atZone(FUSO)
                .withDayOfMonth(1)
                .toLocalDate()
                .atStartOfDay(FUSO);
        return new CicloMensal(inicioDoMes.toInstant(), inicioDoMes.plusMonths(1).toInstant());
    }
}
