package com.koda.v1.github.repository;

import com.koda.v1.github.ConexaoGithub;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ConexaoGithubRepository extends JpaRepository<ConexaoGithub, UUID> {

    Optional<ConexaoGithub> findByUsuarioId(UUID usuarioId);
}
