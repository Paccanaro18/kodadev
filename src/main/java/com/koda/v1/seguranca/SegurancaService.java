package com.koda.v1.seguranca;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SegurancaService {

    static final int LIMITE_DE_ERROS_NA_JANELA = 15;
    static final Duration JANELA_DE_TENTATIVAS = Duration.ofMinutes(10);
    static final int TAMANHO_MAXIMO_DA_FLAG = 200;
    static final int TAMANHO_DO_PLACAR = 10;

    private final CatalogoDeSeguranca catalogo;
    private final ResolucaoDeSegurancaRepository resolucoes;
    private final TentativaDeSegurancaRepository tentativas;

    public SegurancaService(CatalogoDeSeguranca catalogo,
                            ResolucaoDeSegurancaRepository resolucoes,
                            TentativaDeSegurancaRepository tentativas) {
        this.catalogo = catalogo;
        this.resolucoes = resolucoes;
        this.tentativas = tentativas;
    }

    @Transactional(readOnly = true)
    public List<ResumoDeDesafioDeSeguranca> listar(UUID usuarioId) {
        Set<String> resolvidos = resolucoes.findByUsuarioId(usuarioId).stream()
                .map(ResolucaoDeSeguranca::getDesafioSlug)
                .collect(Collectors.toSet());

        return catalogo.todos().stream()
                .map(desafio -> ResumoDeDesafioDeSeguranca.de(desafio, resolvidos.contains(desafio.slug())))
                .toList();
    }

    @Transactional(readOnly = true)
    public DetalheDeDesafioDeSeguranca detalhar(UUID usuarioId, String slug) {
        DefinicaoDeDesafio desafio = buscar(slug);
        boolean resolvido = resolucoes.existsByUsuarioIdAndDesafioSlug(usuarioId, slug);

        return DetalheDeDesafioDeSeguranca.de(desafio, resolvido);
    }

    @Transactional
    public ResultadoDaFlag enviar(UUID usuarioId, String slug, EnvioDeFlag envio) {
        DefinicaoDeDesafio desafio = buscar(slug);
        String flag = normalizar(envio);
        boolean jaResolvido = resolucoes.existsByUsuarioIdAndDesafioSlug(usuarioId, slug);

        if (jaResolvido) {
            return new ResultadoDaFlag(confere(flag, desafio), true, 0);
        }
        exigirLimite(usuarioId);

        boolean correta = confere(flag, desafio);
        tentativas.save(new TentativaDeSeguranca(usuarioId, slug, correta));
        if (!correta) {
            return new ResultadoDaFlag(false, false, 0);
        }

        boolean inseriu = resolucoes.inserirSeNova(usuarioId, slug, desafio.pontos()) == 1;
        return new ResultadoDaFlag(true, !inseriu, inseriu ? desafio.pontos() : 0);
    }

    @Transactional(readOnly = true)
    public PlacarDeSeguranca placar(UUID usuarioId) {
        List<ResolucaoDeSegurancaRepository.LinhaDoPlacar> linhas = resolucoes.placar();
        List<PosicaoNoPlacar> posicoes = new ArrayList<>();
        PosicaoNoPlacar voce = null;
        for (int indice = 0; indice < linhas.size(); indice++) {
            ResolucaoDeSegurancaRepository.LinhaDoPlacar linha = linhas.get(indice);
            PosicaoNoPlacar posicao = new PosicaoNoPlacar(indice + 1, linha.getLogin(), linha.getPontos(), linha.getResolvidos());
            posicoes.add(posicao);
            if (linha.getUsuarioId().equals(usuarioId)) {
                voce = posicao;
            }
        }

        return new PlacarDeSeguranca(posicoes.stream().limit(TAMANHO_DO_PLACAR).toList(), voce);
    }

    private DefinicaoDeDesafio buscar(String slug) {
        return catalogo.buscar(slug).orElseThrow(DesafioDeSegurancaNaoEncontradoException::new);
    }

    private String normalizar(EnvioDeFlag envio) {
        String flag = envio == null || envio.flag() == null ? "" : envio.flag().strip();
        if (flag.isEmpty()) {
            throw new FlagInvalidaException("Informe a flag");
        }
        if (flag.length() > TAMANHO_MAXIMO_DA_FLAG) {
            throw new FlagInvalidaException("A flag é grande demais");
        }
        return flag;
    }

    private void exigirLimite(UUID usuarioId) {
        Instant desde = Instant.now().minus(JANELA_DE_TENTATIVAS);
        if (tentativas.countByUsuarioIdAndCorretaFalseAndCriadoEmAfter(usuarioId, desde) >= LIMITE_DE_ERROS_NA_JANELA) {
            throw new TentativasDemaisException();
        }
    }

    private boolean confere(String flag, DefinicaoDeDesafio desafio) {
        byte[] calculado = resumir(flag).getBytes(StandardCharsets.UTF_8);
        byte[] esperado = desafio.flagHash().getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(calculado, esperado);
    }

    private String resumir(String flag) {
        try {
            byte[] resumo = MessageDigest.getInstance("SHA-256").digest(flag.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(resumo);
        } catch (NoSuchAlgorithmException excecao) {
            throw new IllegalStateException("SHA-256 indisponível", excecao);
        }
    }
}
