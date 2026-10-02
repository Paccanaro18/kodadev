package com.koda.v1.challenge.historico;

import com.koda.v1.challenge.TesteDeApiComSessao;
import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.dica.DicaRepository;
import com.koda.v1.challenge.dica.Dica;
import com.koda.v1.challenge.persistence.RegistroProgresso;
import com.koda.v1.challenge.persistence.StatusProgresso;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class HistoricoControllerTest extends TesteDeApiComSessao {

    @Autowired
    private RegistroProgresso progresso;

    @Autowired
    private DicaRepository dicas;

    @Test
    void deveExigirSessao() throws Exception {
        mockMvc.perform(get("/api/historico")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/progresso")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/historico/abertos")).andExpect(status().isUnauthorized());
    }

    @Test
    void deveListarSoOsDesafiosEmAbertoDeTodosOsProjetos() throws Exception {
        UUID analiseA = criarAnalise(usuarioId, "repo-a");
        UUID analiseB = criarAnalise(usuarioId, "repo-b");
        UUID naoIniciado = criarPronto(analiseA, TipoDesafio.FEATURE, "A", List.of("REST"));
        UUID emAndamento = criarPronto(analiseB, TipoDesafio.BUG, "B", List.of("JPA"));
        UUID concluido = criarPronto(analiseA, TipoDesafio.TESTING, "C", List.of("JUnit"));
        progresso.mudar(usuarioId, emAndamento, StatusProgresso.EM_ANDAMENTO);
        progresso.mudar(usuarioId, concluido, StatusProgresso.EM_ANDAMENTO);
        progresso.mudar(usuarioId, concluido, StatusProgresso.CONCLUIDO);
        UUID falhou = registro.registrarNovo(usuarioId, analiseA, TipoDesafio.BUG, "ANGULO_F", "CLASSE:F", "p");
        registro.iniciar(falhou);
        registro.falhar(falhou, "erro");
        entityManager.flush();
        UUID gerando = registro.registrarNovo(usuarioId, analiseB, TipoDesafio.FEATURE, "ANGULO_G", "CLASSE:G", "p");
        entityManager.flush();

        mockMvc.perform(get("/api/historico/abertos").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[?(@.id=='" + naoIniciado + "')].repositorio").value("repo-a"))
                .andExpect(jsonPath("$[?(@.id=='" + emAndamento + "')].statusProgresso").value("EM_ANDAMENTO"))
                .andExpect(jsonPath("$[?(@.id=='" + gerando + "')].statusGeracao").value("PENDENTE"))
                .andExpect(jsonPath("$[?(@.id=='" + concluido + "')]").isEmpty())
                .andExpect(jsonPath("$[?(@.id=='" + falhou + "')]").isEmpty());
    }

    @Test
    void naoDeveListarComoEmAbertoOQueEDeOutraPessoa() throws Exception {
        long outroGithubId = githubId + 1;
        UUID outroUsuario = criarUsuario(outroGithubId, "outra");
        UUID analiseDoOutro = criarAnalise(outroUsuario, "repo-do-outro");
        registro.registrarNovo(outroUsuario, analiseDoOutro, TipoDesafio.FEATURE, "ANGULO_X", "CLASSE:X", "p");
        entityManager.flush();

        mockMvc.perform(get("/api/historico/abertos").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void deveListarDoMaisNovoParaOMaisAntigoComRepositorioCodigoEDicas() throws Exception {
        UUID analise = criarAnalise(usuarioId, "api-pagamentos");
        UUID primeiro = criarPronto(analise, TipoDesafio.FEATURE, "A", List.of("REST"));
        UUID segundo = criarPronto(analise, TipoDesafio.BUG, "B", List.of("JPA"));
        progresso.mudar(usuarioId, segundo, StatusProgresso.EM_ANDAMENTO);
        dicas.saveAndFlush(new Dica(usuarioId, segundo, 1, "uma dica", "m"));
        entityManager.flush();

        mockMvc.perform(get("/api/historico").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.pagina").value(0))
                .andExpect(jsonPath("$.tamanho").value(20))
                .andExpect(jsonPath("$.totalPaginas").value(1))
                .andExpect(jsonPath("$.itens[0].codigo").value("DEV-002"))
                .andExpect(jsonPath("$.itens[0].repositorio").value("api-pagamentos"))
                .andExpect(jsonPath("$.itens[0].tipo").value("BUG"))
                .andExpect(jsonPath("$.itens[0].statusProgresso").value("EM_ANDAMENTO"))
                .andExpect(jsonPath("$.itens[0].dicasUsadas").value(1))
                .andExpect(jsonPath("$.itens[1].codigo").value("DEV-001"))
                .andExpect(jsonPath("$.itens[1].dicasUsadas").value(0))
                .andExpect(jsonPath("$.itens[0].conteudo").doesNotExist())
                .andExpect(jsonPath("$.itens[0].modelo").doesNotExist());
        org.assertj.core.api.Assertions.assertThat(primeiro).isNotNull();
    }

    @Test
    void deveFiltrarPorProgressoTipoERepositorio() throws Exception {
        UUID analiseA = criarAnalise(usuarioId, "repo-a");
        UUID analiseB = criarAnalise(usuarioId, "repo-b");
        UUID feature = criarPronto(analiseA, TipoDesafio.FEATURE, "A", List.of("REST"));
        criarPronto(analiseB, TipoDesafio.BUG, "B", List.of("JPA"));
        progresso.mudar(usuarioId, feature, StatusProgresso.EM_ANDAMENTO);
        entityManager.flush();

        mockMvc.perform(get("/api/historico?status=EM_ANDAMENTO").session(sessao))
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.itens[0].codigo").value("DEV-001"));
        mockMvc.perform(get("/api/historico?tipo=BUG").session(sessao))
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.itens[0].repositorio").value("repo-b"));
        mockMvc.perform(get("/api/historico?analiseId=" + analiseA).session(sessao))
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.itens[0].repositorio").value("repo-a"));
        mockMvc.perform(get("/api/historico?status=CONCLUIDO&tipo=FEATURE").session(sessao))
                .andExpect(jsonPath("$.total").value(0))
                .andExpect(jsonPath("$.itens.length()").value(0));
    }

    @Test
    void devePaginarEDevolverOTotalDePaginas() throws Exception {
        UUID analise = criarAnalise(usuarioId, "repo");
        for (int i = 0; i < 5; i++) {
            criarPronto(analise, TipoDesafio.FEATURE, "T" + i, List.of("REST"));
        }

        mockMvc.perform(get("/api/historico?tamanho=2&pagina=0").session(sessao))
                .andExpect(jsonPath("$.itens.length()").value(2))
                .andExpect(jsonPath("$.total").value(5))
                .andExpect(jsonPath("$.totalPaginas").value(3))
                .andExpect(jsonPath("$.itens[0].codigo").value("DEV-005"));
        mockMvc.perform(get("/api/historico?tamanho=2&pagina=2").session(sessao))
                .andExpect(jsonPath("$.itens.length()").value(1))
                .andExpect(jsonPath("$.itens[0].codigo").value("DEV-001"));
        mockMvc.perform(get("/api/historico?tamanho=2&pagina=9").session(sessao))
                .andExpect(jsonPath("$.itens.length()").value(0));
    }

    @Test
    void deveRecusarParametrosInvalidos() throws Exception {
        mockMvc.perform(get("/api/historico?pagina=-1").session(sessao)).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/historico?tamanho=0").session(sessao)).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/historico?tamanho=51").session(sessao)).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/historico?status=INVENTADO").session(sessao)).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/historico?tipo=INVENTADO").session(sessao)).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/historico?analiseId=nao-e-uuid").session(sessao)).andExpect(status().isBadRequest());
    }

    @Test
    void naoDeveVazarTicketsDeOutraPessoa() throws Exception {
        UUID outro = criarUsuario(githubId + 1, "outra");
        UUID analiseDoOutro = criarAnalise(outro, "repo-do-outro");
        UUID desafioDoOutro = registro.registrarNovo(outro, analiseDoOutro, TipoDesafio.FEATURE, "A", "x", "p");
        entityManager.flush();

        mockMvc.perform(get("/api/historico").session(sessao))
                .andExpect(jsonPath("$.total").value(0));
        mockMvc.perform(get("/api/historico?analiseId=" + analiseDoOutro).session(sessao))
                .andExpect(jsonPath("$.total").value(0));
        mockMvc.perform(get("/api/progresso").session(sessao))
                .andExpect(jsonPath("$.naoIniciados").value(0));
        org.assertj.core.api.Assertions.assertThat(desafioDoOutro).isNotNull();
    }

    @Test
    void deveResumirOProgressoComHabilidadesSoDosConcluidos() throws Exception {
        UUID analise = criarAnalise(usuarioId, "repo");
        UUID concluido1 = criarPronto(analise, TipoDesafio.FEATURE, "A", List.of("REST", "JPA"));
        UUID concluido2 = criarPronto(analise, TipoDesafio.BUG, "B", List.of("REST"));
        UUID emAndamento = criarPronto(analise, TipoDesafio.TESTING, "C", List.of("Testes"));
        criarPronto(analise, TipoDesafio.FEATURE, "D", List.of("Docker"));
        for (UUID id : List.of(concluido1, concluido2)) {
            progresso.mudar(usuarioId, id, StatusProgresso.EM_ANDAMENTO);
            progresso.mudar(usuarioId, id, StatusProgresso.CONCLUIDO);
        }
        progresso.mudar(usuarioId, emAndamento, StatusProgresso.EM_ANDAMENTO);
        dicas.saveAndFlush(new Dica(usuarioId, emAndamento, 1, "dica", "m"));
        dicas.saveAndFlush(new Dica(usuarioId, emAndamento, 2, "dica 2", "m"));
        entityManager.flush();

        mockMvc.perform(get("/api/progresso").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.naoIniciados").value(1))
                .andExpect(jsonPath("$.emAndamento").value(1))
                .andExpect(jsonPath("$.concluidos").value(2))
                .andExpect(jsonPath("$.dicasUsadas").value(2))
                .andExpect(jsonPath("$.habilidades.length()").value(2))
                .andExpect(jsonPath("$.habilidades[0].nome").value("REST"))
                .andExpect(jsonPath("$.habilidades[0].total").value(2))
                .andExpect(jsonPath("$.habilidades[1].nome").value("JPA"));
    }

    @Test
    void deveResumirZeradoQuandoNaoHaNada() throws Exception {
        mockMvc.perform(get("/api/progresso").session(sessao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.concluidos").value(0))
                .andExpect(jsonPath("$.dicasUsadas").value(0))
                .andExpect(jsonPath("$.habilidades.length()").value(0));
    }

    private UUID criarPronto(UUID analise, TipoDesafio tipo, String sufixo, List<String> habilidades) {
        UUID id = registro.registrarNovo(usuarioId, analise, tipo, "ANGULO_" + sufixo, "CLASSE:" + sufixo, "p");
        registro.iniciar(id);
        registro.concluir(id, "Título " + sufixo, serializadorConteudo.paraJson(conteudo(sufixo, habilidades)), 1, "m");
        entityManager.flush();
        return id;
    }
}
