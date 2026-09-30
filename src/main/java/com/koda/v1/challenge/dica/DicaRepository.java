package com.koda.v1.challenge.dica;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface DicaRepository extends JpaRepository<Dica, UUID> {

    List<Dica> findByDesafioIdOrderByNivelAsc(UUID desafioId);

    long countByUsuarioIdAndCriadoEmAfter(UUID usuarioId, Instant desde);
}
