package com.koda.v1.challenge.historico;

import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.persistence.StatusProgresso;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class HistoricoService {

    static final int TAMANHO_PADRAO = 20;
    static final int TAMANHO_MAXIMO = 50;

    private final ConsultaHistorico consulta;

    public HistoricoService(ConsultaHistorico consulta) {
        this.consulta = consulta;
    }

    public PaginaHistorico listar(UUID usuarioId, StatusProgresso progresso, TipoDesafio tipo, UUID analiseId,
                                  Integer pagina, Integer tamanho) {
        int paginaEscolhida = pagina == null ? 0 : pagina;
        int tamanhoEscolhido = tamanho == null ? TAMANHO_PADRAO : tamanho;
        if (paginaEscolhida < 0) {
            throw new ParametroDeHistoricoInvalidoException("A página não pode ser negativa.");
        }
        if (tamanhoEscolhido < 1 || tamanhoEscolhido > TAMANHO_MAXIMO) {
            throw new ParametroDeHistoricoInvalidoException("O tamanho da página deve ficar entre 1 e " + TAMANHO_MAXIMO + ".");
        }

        ConsultaHistorico.PaginaBruta bruta =
                consulta.buscar(usuarioId, progresso, tipo, analiseId, paginaEscolhida, tamanhoEscolhido);
        List<ItemHistorico> itens = bruta.linhas().stream().map(this::paraItem).toList();
        int totalPaginas = (int) ((bruta.total() + tamanhoEscolhido - 1) / tamanhoEscolhido);

        return new PaginaHistorico(itens, paginaEscolhida, tamanhoEscolhido, bruta.total(), totalPaginas);
    }

    /** Todos os desafios em aberto, de todos os projetos, do mais novo para o mais antigo. */
    public List<ItemHistorico> emAberto(UUID usuarioId) {
        return consulta.emAberto(usuarioId).stream().map(this::paraItem).toList();
    }

    private ItemHistorico paraItem(ConsultaHistorico.LinhaDoHistorico linha) {
        return new ItemHistorico(
                linha.id(), linha.analiseId(), linha.repositorio(), linha.numero(), codigoDe(linha.numero()),
                linha.tipo(), linha.statusGeracao(), linha.statusProgresso(), linha.titulo(),
                linha.dicasUsadas(), linha.criadoEm(), linha.finalizadoEm());
    }

    public ResumoProgresso resumir(UUID usuarioId) {
        return consulta.resumir(usuarioId);
    }

    static String codigoDe(int numero) {
        return String.format("DEV-%03d", numero);
    }
}
