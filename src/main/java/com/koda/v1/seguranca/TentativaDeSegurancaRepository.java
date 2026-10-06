package com.koda.v1.seguranca;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.UUID;

public interface TentativaDeSegurancaRepository extends JpaRepository<TentativaDeSeguranca, UUID> {

    long countByUsuarioIdAndCorretaFalseAndCriadoEmAfter(UUID usuarioId, Instant desde);
}
