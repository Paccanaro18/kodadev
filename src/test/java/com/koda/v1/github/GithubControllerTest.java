package com.koda.v1.github;

import com.koda.v1.challenge.TesteDeApiComSessao;
import com.koda.v1.github.dto.ArquivoResposta;
import com.koda.v1.github.dto.ArvoreResposta;
import com.koda.v1.github.dto.RepositorioResposta;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GithubControllerTest extends TesteDeApiComSessao {

    @MockitoBean
    private GithubService githubService;

    @Test
    void deveExigirSessaoEmTodasAsRotas() throws Exception {
        mockMvc.perform(get("/api/repositorios")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/repositorios/artur/koda/arvore")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/repositorios/artur/koda/blobs/abc")).andExpect(status().isUnauthorized());
    }

    @Test
    void deveListarOsRepositoriosDoUsuarioDaSessao() throws Exception {
        RepositorioResposta repositorio = mock(RepositorioResposta.class);
        when(githubService.listarRepositorios(usuarioId)).thenReturn(List.of());

        mockMvc.perform(get("/api/repositorios").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(githubService).listarRepositorios(usuarioId);
        org.assertj.core.api.Assertions.assertThat(repositorio).isNotNull();
    }

    @Test
    void deveBuscarAArvoreEOArquivoDoRepositorioInformado() throws Exception {
        when(githubService.buscarArvore(any(UUID.class), eq("artur"), eq("koda"))).thenReturn(mock(ArvoreResposta.class));
        when(githubService.lerArquivo(any(UUID.class), eq("artur"), eq("koda"), eq("sha1"))).thenReturn(mock(ArquivoResposta.class));

        mockMvc.perform(get("/api/repositorios/artur/koda/arvore").session(sessao)).andExpect(status().isOk());
        mockMvc.perform(get("/api/repositorios/artur/koda/blobs/sha1").session(sessao)).andExpect(status().isOk());

        verify(githubService).buscarArvore(usuarioId, "artur", "koda");
        verify(githubService).lerArquivo(usuarioId, "artur", "koda", "sha1");
    }
}
