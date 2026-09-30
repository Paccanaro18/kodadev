package com.koda.v1.challenge.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface DesafioRepository extends JpaRepository<Desafio, UUID> {

    boolean existsByUsuarioIdAndStatusGeracaoIn(UUID usuarioId, Collection<StatusGeracao> status);

    @Query("select coalesce(max(d.numero), 0) from Desafio d where d.usuarioId = :usuarioId")
    int maiorNumeroDoUsuario(@Param("usuarioId") UUID usuarioId);

    List<Desafio> findTop50ByUsuarioIdAndStatusGeracaoOrderByCriadoEmDesc(UUID usuarioId, StatusGeracao status);

    List<Desafio> findByUsuarioIdAndAnaliseIdAndStatusGeracaoOrderByCriadoEmDesc(
            UUID usuarioId, UUID analiseId, StatusGeracao status);

    List<Desafio> findByUsuarioIdAndAnaliseIdOrderByNumeroDesc(UUID usuarioId, UUID analiseId);

    List<Desafio> findAllByStatusGeracaoIn(Collection<StatusGeracao> status);

    long countByUsuarioIdAndStatusGeracaoInAndCriadoEmAfter(
            UUID usuarioId, Collection<StatusGeracao> status, Instant desde);
}
