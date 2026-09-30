package com.koda.v1.analyzer;

import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.analyzer.contexto.SerializadorContexto;
import com.koda.v1.analyzer.persistence.AnaliseDetalhe;
import com.koda.v1.analyzer.persistence.AnaliseEmAndamentoException;
import com.koda.v1.analyzer.persistence.ConsultaAnalise;
import com.koda.v1.analyzer.persistence.RegistroAnalise;
import com.koda.v1.analyzer.persistence.StatusAnalise;
import com.koda.v1.github.GithubService;
import com.koda.v1.github.dto.RepositorioResposta;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AnaliseService {

    private final GithubService githubService;
    private final RegistroAnalise registro;
    private final ConsultaAnalise consulta;
    private final IniciadorAnalise iniciador;
    private final SerializadorResultado serializador;
    private final SerializadorContexto serializadorContexto;

    public AnaliseService(GithubService githubService,
                          RegistroAnalise registro,
                          ConsultaAnalise consulta,
                          IniciadorAnalise iniciador,
                          SerializadorResultado serializador,
                          SerializadorContexto serializadorContexto) {
        this.githubService = githubService;
        this.registro = registro;
        this.consulta = consulta;
        this.iniciador = iniciador;
        this.serializador = serializador;
        this.serializadorContexto = serializadorContexto;
    }

    public AnaliseResposta iniciar(UUID usuarioId, String loginDoUsuario, String dono, String nome) {
        RepositorioResposta repositorio = githubService.buscarRepositorio(usuarioId, dono, nome);
        String donoReal = exigirRepositorioPublicoDoUsuario(repositorio, loginDoUsuario);

        UUID analiseId = registrar(usuarioId, repositorio, donoReal);

        try {
            iniciador.disparar(analiseId);
        } catch (FilaDeAnaliseCheiaException e) {
            registro.falhar(analiseId, e.getMessage());
            throw e;
        }
        return new AnaliseResposta(analiseId, StatusAnalise.PENDENTE);
    }

    public List<AnaliseResumoResposta> listar(UUID usuarioId) {
        return consulta.listarUltimasDoUsuario(usuarioId).stream()
                .map(this::resumir)
                .toList();
    }

    public AnaliseDetalheResposta consultar(UUID usuarioId, UUID analiseId) {
        AnaliseDetalhe detalhe = consulta.buscarDoUsuario(usuarioId, analiseId);

        ResultadoAnalise resultado = detalhe.resultadoJson() == null
                ? null
                : serializador.deJson(detalhe.resultadoJson());
        ContextoProjeto contexto = detalhe.contextoJson() == null
                ? null
                : serializadorContexto.deJson(detalhe.contextoJson());

        return new AnaliseDetalheResposta(
                detalhe.id(),
                detalhe.status(),
                detalhe.dono(),
                detalhe.nome(),
                resultado,
                contexto,
                detalhe.mensagemErro(),
                detalhe.criadoEm(),
                detalhe.concluidaEm());
    }

    private AnaliseResumoResposta resumir(AnaliseDetalhe detalhe) {
        ResultadoAnalise resultado = detalhe.resultadoJson() == null
                ? null
                : serializador.deJson(detalhe.resultadoJson());

        return new AnaliseResumoResposta(
                detalhe.id(),
                detalhe.status(),
                detalhe.dono(),
                detalhe.nome(),
                resultado != null && resultado.springBoot(),
                resultado == null ? null : resultado.versaoJava(),
                resultado == null ? List.of() : resultado.tecnologias(),
                resultado != null && resultado.parcial(),
                detalhe.mensagemErro(),
                detalhe.criadoEm(),
                detalhe.concluidaEm());
    }

    private UUID registrar(UUID usuarioId, RepositorioResposta repositorio, String donoReal) {
        try {
            return registro.registrarNovaAnalise(
                    usuarioId, repositorio.id(), donoReal, repositorio.nome(), repositorio.branchPadrao());
        } catch (DataIntegrityViolationException e) {
            throw new AnaliseEmAndamentoException();
        }
    }

    private String exigirRepositorioPublicoDoUsuario(RepositorioResposta repositorio, String loginDoUsuario) {
        if (repositorio.privado()) {
            throw new RepositorioNaoAnalisavelException("Só é possível analisar repositórios públicos.");
        }
        String nomeCompleto = repositorio.nomeCompleto();
        int barra = nomeCompleto == null ? -1 : nomeCompleto.indexOf('/');
        String dono = barra < 0 ? null : nomeCompleto.substring(0, barra);

        if (dono == null || !dono.equalsIgnoreCase(loginDoUsuario)) {
            throw new RepositorioNaoAnalisavelException(
                    "Só é possível analisar repositórios da sua própria conta.");
        }
        return dono;
    }
}
