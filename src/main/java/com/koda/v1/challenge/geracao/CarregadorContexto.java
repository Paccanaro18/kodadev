package com.koda.v1.challenge.geracao;

import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.analyzer.persistence.AnaliseDetalhe;
import com.koda.v1.analyzer.persistence.AnaliseNaoEncontradaException;
import com.koda.v1.analyzer.persistence.ConsultaAnalise;
import com.koda.v1.analyzer.persistence.StatusAnalise;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CarregadorContexto {

    private final ConsultaAnalise consultaAnalise;
    private final SerializadorContexto serializador;

    public CarregadorContexto(ConsultaAnalise consultaAnalise, SerializadorContexto serializador) {
        this.consultaAnalise = consultaAnalise;
        this.serializador = serializador;
    }

    public ContextoProjeto carregar(UUID usuarioId, UUID analiseId) {
        AnaliseDetalhe analise;
        try {
            analise = consultaAnalise.buscarDoUsuario(usuarioId, analiseId);
        } catch (AnaliseNaoEncontradaException e) {
            throw new ContextoIndisponivelException();
        }
        if (analise.status() != StatusAnalise.CONCLUIDA || analise.contextoJson() == null) {
            throw new ContextoIndisponivelException();
        }
        return serializador.deJson(analise.contextoJson());
    }
}
