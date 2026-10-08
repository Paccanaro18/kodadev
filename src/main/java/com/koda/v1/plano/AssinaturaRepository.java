package com.koda.v1.plano;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AssinaturaRepository extends JpaRepository<Assinatura, UUID> {
}
