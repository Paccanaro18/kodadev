package com.koda.v1.challenge.notificacao;

import com.koda.v1.challenge.persistence.TipoEvento;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * As notificações são eventos de ticket que a pessoa não provocou na hora: o ticket ficou pronto, a geração falhou
 * ou ela concluiu o desafio. Iniciar, reabrir e pedir dica não notificam.
 */
@Repository
public class ConsultaNotificacoes {

    static final int MAXIMO_DE_ITENS = 20;

    private static final String TIPOS_QUE_NOTIFICAM = "('DESAFIO_PRONTO', 'DESAFIO_FALHOU', 'PROGRESSO_CONCLUIDO')";

    private final JdbcTemplate jdbc;

    public ConsultaNotificacoes(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true)
    public NotificacoesResposta listar(UUID usuarioId) {
        Long naoLidas = jdbc.queryForObject(
                "SELECT count(*) FROM eventos_desafio WHERE usuario_id = ? AND lida_em IS NULL AND tipo IN "
                        + TIPOS_QUE_NOTIFICAM, Long.class, usuarioId);

        List<Notificacao> itens = jdbc.query("""
                SELECT e.id, e.tipo, e.desafio_id, d.numero, d.titulo, e.lida_em, e.criado_em
                FROM eventos_desafio e
                JOIN desafios d ON d.id = e.desafio_id
                WHERE e.usuario_id = ? AND e.tipo IN """ + TIPOS_QUE_NOTIFICAM + """

                ORDER BY e.criado_em DESC
                LIMIT ?
                """, (rs, i) -> new Notificacao(
                        rs.getObject("id", UUID.class),
                        TipoEvento.valueOf(rs.getString("tipo")),
                        rs.getObject("desafio_id", UUID.class),
                        String.format("DEV-%03d", rs.getInt("numero")),
                        rs.getString("titulo"),
                        rs.getTimestamp("lida_em") != null,
                        rs.getTimestamp("criado_em").toInstant()),
                usuarioId, MAXIMO_DE_ITENS);

        return new NotificacoesResposta(naoLidas == null ? 0 : naoLidas, itens);
    }

    @Transactional
    public int marcarTodasComoLidas(UUID usuarioId) {
        return jdbc.update("UPDATE eventos_desafio SET lida_em = now() WHERE usuario_id = ? AND lida_em IS NULL "
                + "AND tipo IN " + TIPOS_QUE_NOTIFICAM, usuarioId);
    }

    @Transactional
    public void marcarComoLida(UUID usuarioId, UUID eventoId) {
        Boolean existe = jdbc.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM eventos_desafio WHERE id = ? AND usuario_id = ? AND tipo IN "
                        + TIPOS_QUE_NOTIFICAM + ")", Boolean.class, eventoId, usuarioId);
        if (!Boolean.TRUE.equals(existe)) {
            throw new NotificacaoNaoEncontradaException();
        }
        jdbc.update("UPDATE eventos_desafio SET lida_em = now() WHERE id = ? AND usuario_id = ? AND lida_em IS NULL",
                eventoId, usuarioId);
    }
}
