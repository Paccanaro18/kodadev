package com.koda.v1.analyzer.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositorioGithubRepository extends JpaRepository<RepositorioGithub, UUID> {

    Optional<RepositorioGithub> findByUsuarioIdAndGithubIdRepositorio(UUID usuarioId, Long githubIdRepositorio);

    List<RepositorioGithub> findAllByUsuarioIdOrderByCriadoEmDesc(UUID usuarioId);
}
