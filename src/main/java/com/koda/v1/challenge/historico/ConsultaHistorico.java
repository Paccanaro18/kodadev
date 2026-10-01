package com.koda.v1.challenge.historico;

import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.persistence.StatusGeracao;
import com.koda.v1.challenge.persistence.StatusProgresso;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Consultas de leitura do histórico e do progresso. O SQL só tem trechos fixos; todo valor vindo do cliente
 * entra como parâmetro.
 */
@Repository
public class ConsultaHistorico {

    private static final int MAXIMO_DE_HABILIDADES = 8;

    private static final String DE = """
            FROM desafios d
            JOIN analises_projeto a ON a.id = d.analise_id
            JOIN repositorios r ON r.id = a.repositorio_id
            WHERE d.usuario_id = ?
            """;

    private final JdbcTemplate jdbc;

    public ConsultaHistorico(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true)
    public PaginaBruta buscar(UUID usuarioId, StatusProgresso progresso, TipoDesafio tipo, UUID analiseId,
                              int pagina, int tamanho) {
        StringBuilder filtros = new StringBuilder();
        List<Object> parametros = new ArrayList<>();
        parametros.add(usuarioId);
        if (progresso != null) {
            filtros.append(" AND d.status_progresso = ?");
            parametros.add(progresso.name());
        }
        if (tipo != null) {
            filtros.append(" AND d.tipo = ?");
            parametros.add(tipo.name());
        }
        if (analiseId != null) {
            filtros.append(" AND d.analise_id = ?");
            parametros.add(analiseId);
        }

        filtros.append('\n');

        Long total = jdbc.queryForObject("SELECT count(*) " + DE + filtros, Long.class, parametros.toArray());

        List<Object> parametrosDaPagina = new ArrayList<>(parametros);
        parametrosDaPagina.add(tamanho);
        parametrosDaPagina.add((long) pagina * tamanho);
        List<LinhaDoHistorico> linhas = jdbc.query("""
                SELECT d.id, d.analise_id, r.nome AS repositorio, d.numero, d.tipo, d.status_geracao,
                       d.status_progresso, d.titulo, d.criado_em, d.finalizado_em,
                       (SELECT count(*) FROM dicas_desafio x WHERE x.desafio_id = d.id) AS dicas
                """ + DE + filtros + """
                ORDER BY d.criado_em DESC, d.numero DESC
                LIMIT ? OFFSET ?
                """,
                (rs, i) -> new LinhaDoHistorico(
                        rs.getObject("id", UUID.class),
                        rs.getObject("analise_id", UUID.class),
                        rs.getString("repositorio"),
                        rs.getInt("numero"),
                        TipoDesafio.valueOf(rs.getString("tipo")),
                        StatusGeracao.valueOf(rs.getString("status_geracao")),
                        StatusProgresso.valueOf(rs.getString("status_progresso")),
                        rs.getString("titulo"),
                        rs.getInt("dicas"),
                        instante(rs.getTimestamp("criado_em")),
                        instante(rs.getTimestamp("finalizado_em"))),
                parametrosDaPagina.toArray());

        return new PaginaBruta(linhas, total == null ? 0 : total);
    }

    @Transactional(readOnly = true)
    public ResumoProgresso resumir(UUID usuarioId) {
        long[] contagens = new long[StatusProgresso.values().length];
        jdbc.query("""
                SELECT status_progresso, count(*) AS total
                FROM desafios
                WHERE usuario_id = ? AND status_geracao = 'PRONTO'
                GROUP BY status_progresso
                """, rs -> {
            contagens[StatusProgresso.valueOf(rs.getString("status_progresso")).ordinal()] = rs.getLong("total");
        }, usuarioId);

        Long dicas = jdbc.queryForObject(
                "SELECT count(*) FROM dicas_desafio WHERE usuario_id = ?", Long.class, usuarioId);

        List<HabilidadePraticada> habilidades = jdbc.query("""
                SELECT habilidade, count(*) AS total
                FROM desafios d, jsonb_array_elements_text(d.conteudo -> 'habilidades') AS habilidade
                WHERE d.usuario_id = ? AND d.status_progresso = 'CONCLUIDO' AND d.conteudo IS NOT NULL
                GROUP BY habilidade
                ORDER BY total DESC, habilidade ASC
                LIMIT ?
                """, (rs, i) -> new HabilidadePraticada(rs.getString("habilidade"), rs.getLong("total")),
                usuarioId, MAXIMO_DE_HABILIDADES);

        return new ResumoProgresso(
                contagens[StatusProgresso.NAO_INICIADO.ordinal()],
                contagens[StatusProgresso.EM_ANDAMENTO.ordinal()],
                contagens[StatusProgresso.CONCLUIDO.ordinal()],
                dicas == null ? 0 : dicas,
                habilidades);
    }

    private Instant instante(Timestamp timestamp) {
        return timestamp == null ? null : timestamp.toInstant();
    }

    public record LinhaDoHistorico(UUID id, UUID analiseId, String repositorio, int numero, TipoDesafio tipo,
                                   StatusGeracao statusGeracao, StatusProgresso statusProgresso, String titulo,
                                   int dicasUsadas, Instant criadoEm, Instant finalizadoEm) {
    }

    public record PaginaBruta(List<LinhaDoHistorico> linhas, long total) {
    }
}
