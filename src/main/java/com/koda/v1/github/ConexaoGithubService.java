package com.koda.v1.github;

import com.koda.v1.github.repository.ConexaoGithubRepository;
import com.koda.v1.shared.CriptografiaToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
public class ConexaoGithubService {

    private final ConexaoGithubRepository conexaoRepository;
    private final CriptografiaToken criptografia;

    public ConexaoGithubService(ConexaoGithubRepository conexaoRepository,
                                CriptografiaToken criptografia) {
        this.conexaoRepository = conexaoRepository;
        this.criptografia = criptografia;
    }

    @Transactional
    public void salvarOuAtualizar(UUID usuarioId, String tokenPuro, Set<String> escopos) {
        String tokenCriptografado = criptografia.criptografar(tokenPuro);
        String escoposTexto = String.join(",", escopos);

        conexaoRepository.findByUsuarioId(usuarioId)
                .ifPresentOrElse(
                        existente -> existente.atualizarToken(tokenCriptografado, escoposTexto),
                        () -> conexaoRepository.save(
                                new ConexaoGithub(usuarioId, tokenCriptografado, escoposTexto)));
    }

    @Transactional(readOnly = true)
    public String obterToken(UUID usuarioId) {
        ConexaoGithub conexao = conexaoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new IllegalStateException(
                        "Usuário sem conexão com o GitHub: " + usuarioId));
        return criptografia.descriptografar(conexao.getTokenCriptografado());
    }
}
