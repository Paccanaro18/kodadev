package com.koda.v1.seguranca;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ResolucaoDeSegurancaRepository extends JpaRepository<ResolucaoDeSeguranca, UUID> {

    List<ResolucaoDeSeguranca> findByUsuarioId(UUID usuarioId);

    boolean existsByUsuarioIdAndDesafioSlug(UUID usuarioId, String desafioSlug);

    @Modifying
    @Query(value = "INSERT INTO resolucoes_seguranca (usuario_id, desafio_slug, pontos) "
            + "VALUES (:usuarioId, :desafioSlug, :pontos) ON CONFLICT (usuario_id, desafio_slug) DO NOTHING",
            nativeQuery = true)
    int inserirSeNova(@Param("usuarioId") UUID usuarioId, @Param("desafioSlug") String desafioSlug,
                      @Param("pontos") int pontos);

    @Query(value = "SELECT u.id AS usuarioId, u.login AS login, SUM(r.pontos) AS pontos, COUNT(*) AS resolvidos "
            + "FROM resolucoes_seguranca r JOIN usuarios u ON u.id = r.usuario_id "
            + "GROUP BY u.id, u.login "
            + "ORDER BY SUM(r.pontos) DESC, MAX(r.resolvido_em) ASC, u.login ASC",
            nativeQuery = true)
    List<LinhaDoPlacar> placar();

    interface LinhaDoPlacar {

        UUID getUsuarioId();

        String getLogin();

        long getPontos();

        long getResolvidos();
    }
}
