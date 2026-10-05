package com.koda.v1.estudo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProgressoDeEstudoRepository extends JpaRepository<ProgressoDeEstudo, UUID> {

    List<ProgressoDeEstudo> findByUsuarioId(UUID usuarioId);

    Optional<ProgressoDeEstudo> findByUsuarioIdAndTrilhaAndItem(UUID usuarioId, String trilha, String item);

    long countByUsuarioId(UUID usuarioId);
}
