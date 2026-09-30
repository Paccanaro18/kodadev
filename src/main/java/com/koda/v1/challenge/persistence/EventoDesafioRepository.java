package com.koda.v1.challenge.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EventoDesafioRepository extends JpaRepository<EventoDesafio, UUID> {

    List<EventoDesafio> findByDesafioIdOrderByCriadoEmAsc(UUID desafioId);
}
