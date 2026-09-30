package com.koda.v1.analyzer;

import com.koda.v1.analyzer.detector.Endpoint;
import com.koda.v1.analyzer.detector.ResultadoCompose;
import com.koda.v1.analyzer.detector.ResultadoPom;
import com.koda.v1.analyzer.detector.Tecnologia;
import com.koda.v1.analyzer.estrutura.ResultadoEstrutura;

import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Component
public class MontadorResultado {

    public ResultadoAnalise montar(ResultadoPom pom,
                                   ResultadoCompose compose,
                                   ResultadoEstrutura estrutura,
                                   List<Endpoint> endpoints,
                                   boolean parcial) {

        Objects.requireNonNull(estrutura, "A estrutura é obrigatória para montar o resultado");

        Set<Tecnologia> tecnologias = EnumSet.noneOf(Tecnologia.class);
        if (pom != null) {
            tecnologias.addAll(pom.tecnologias());
        }
        if (compose != null) {
            tecnologias.addAll(compose.tecnologias());
        }

        return new ResultadoAnalise(
                estrutura.temCodigoJava(),
                pom != null && pom.ehSpringBoot(),
                pom != null ? pom.versaoJava() : null,
                pom != null ? pom.versaoSpringBoot() : null,
                pom != null ? pom.dependencias() : List.of(),
                List.copyOf(tecnologias),
                compose != null ? compose.imagens() : List.of(),
                estrutura.controllers(),
                estrutura.services(),
                estrutura.repositories(),
                estrutura.entidades(),
                estrutura.testes(),
                endpoints != null ? endpoints : List.of(),
                parcial
        );
    }
}
