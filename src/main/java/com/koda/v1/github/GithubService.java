package com.koda.v1.github;

import com.koda.v1.github.dto.ArquivoResposta;
import com.koda.v1.github.dto.ArvoreGithub;
import com.koda.v1.github.dto.ArvoreResposta;
import com.koda.v1.github.dto.BlobGithub;
import com.koda.v1.github.dto.ItemArvoreResposta;
import com.koda.v1.github.dto.RepositorioGithub;
import com.koda.v1.github.dto.RepositorioResposta;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class GithubService {

    private final GithubClient githubClient;
    private final ConexaoGithubService conexaoGithubService;

    public GithubService(GithubClient githubClient, ConexaoGithubService conexaoGithubService) {
        this.githubClient = githubClient;
        this.conexaoGithubService = conexaoGithubService;
    }

    public List<RepositorioResposta> listarRepositorios(UUID usuarioId) {
        String token = conexaoGithubService.obterToken(usuarioId);

        return githubClient.listarRepositorios(token).stream()
                .map(RepositorioResposta::de)
                .toList();
    }

    public ArvoreResposta buscarArvore(UUID usuarioId, String dono, String repositorio) {
        String token = conexaoGithubService.obterToken(usuarioId);

        RepositorioGithub dados = githubClient.buscarRepositorio(token, dono, repositorio);
        ArvoreGithub arvore = githubClient.buscarArvore(token, dono, repositorio, dados.branchPadrao());

        List<ItemArvoreResposta> itens = arvore.itens().stream()
                .map(ItemArvoreResposta::de)
                .toList();

        return new ArvoreResposta(dados.branchPadrao(), arvore.truncada(), itens);
    }

    public ArquivoResposta lerArquivo(UUID usuarioId, String dono, String repositorio, String sha) {
        String token = conexaoGithubService.obterToken(usuarioId);

        BlobGithub blob = githubClient.buscarBlob(token, dono, repositorio, sha);
        String texto = decodificar(blob);

        return new ArquivoResposta(blob.sha(), blob.tamanho(), texto);
    }

    private String decodificar(BlobGithub blob) {
        if (!"base64".equals(blob.codificacao())) {
            return blob.conteudo();
        }
        byte[] bytes = Base64.getMimeDecoder().decode(blob.conteudo());
        return new String(bytes, StandardCharsets.UTF_8);
    }
}