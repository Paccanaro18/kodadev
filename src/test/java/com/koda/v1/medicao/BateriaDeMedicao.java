package com.koda.v1.medicao;

import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.challenge.ConteudoDesafio;
import com.koda.v1.challenge.ConteudoInvalidoException;
import com.koda.v1.challenge.VerificadorConteudo;
import com.koda.v1.challenge.catalogo.CatalogoAngulos;
import com.koda.v1.challenge.dica.Dica;
import com.koda.v1.challenge.dica.MontadorPromptDica;
import com.koda.v1.challenge.ia.MotivoFalhaIa;
import com.koda.v1.challenge.ia.ProvedorIa;
import com.koda.v1.challenge.ia.ProvedorIaException;
import com.koda.v1.challenge.ia.RespostaIa;
import com.koda.v1.challenge.prompt.MontadorPrompt;
import com.koda.v1.challenge.prompt.Perspectivas;
import com.koda.v1.challenge.prompt.PromptDesafio;
import com.koda.v1.challenge.selecao.SelecaoDeDesafio;
import com.koda.v1.challenge.selecao.SeletorDeDesafio;
import com.koda.v1.challenge.selecao.UsoAnterior;
import com.koda.v1.challenge.similaridade.DetectorSimilaridade;
import com.koda.v1.challenge.validacao.MotivoReprovacao;
import com.koda.v1.challenge.validacao.ValidadorDesafio;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Repete, dentro do processo e sem banco, o que a produção faz com a IA: escolhe ângulo e alvo, monta o prompt,
 * chama o provedor, verifica, compara com os tickets anteriores e valida (até 2 tentativas por texto); depois pede
 * as dicas de cada ticket aprovado. Devolve só números, para comparar modelos e ajustar regras com dados.
 */
public class BateriaDeMedicao {

    static final int MAXIMO_DE_TENTATIVAS = 2;

    private final CatalogoAngulos catalogo = new CatalogoAngulos();
    private final Perspectivas perspectivas = new Perspectivas();
    private final MontadorPrompt montador = new MontadorPrompt(perspectivas);
    private final MontadorPromptDica montadorDeDica = new MontadorPromptDica();
    private final VerificadorConteudo verificador = new VerificadorConteudo();
    private final ValidadorDesafio validador = new ValidadorDesafio();
    private final DetectorSimilaridade detector = new DetectorSimilaridade(0.70);
    private final ProvedorIa provedor;
    private final RelatorioDeMedicao relatorio = new RelatorioDeMedicao();

    public BateriaDeMedicao(ProvedorIa provedor) {
        this.provedor = provedor;
    }

    public RelatorioDeMedicao executar(ContextoProjeto contexto, int tickets, int dicasPorTicket) {
        SeletorDeDesafio seletor = new SeletorDeDesafio(catalogo);
        List<UsoAnterior> historico = new ArrayList<>();
        List<ConteudoDesafio> aprovados = new ArrayList<>();
        List<String> titulos = new ArrayList<>();
        List<String> perspectivasUsadas = new ArrayList<>();

        for (int i = 0; i < tickets; i++) {
            relatorio.ticketsPedidos++;
            SelecaoDeDesafio selecao = seletor.selecionar(contexto, null, historico);
            String perspectiva = perspectivas.escolher(perspectivasUsadas);
            perspectivasUsadas.add(0, perspectiva);

            Optional<ConteudoDesafio> ticket = gerarTicket(selecao, contexto, perspectiva, titulos, aprovados);
            historico.add(0, new UsoAnterior(selecao.angulo().id(), selecao.alvo().chave(), true));
            if (ticket.isEmpty()) {
                continue;
            }
            aprovados.add(0, ticket.get());
            titulos.add(0, ticket.get().titulo());
            relatorio.angulosDistintos.add(selecao.angulo().id());

            List<String> dicas = new ArrayList<>();
            for (int nivel = 1; nivel <= Math.min(dicasPorTicket, Dica.NIVEL_MAXIMO); nivel++) {
                relatorio.dicasPedidas++;
                gerarDica(ticket.get(), contexto, nivel, dicas).ifPresent(dicas::add);
            }
        }
        return relatorio;
    }

    private Optional<ConteudoDesafio> gerarTicket(SelecaoDeDesafio selecao, ContextoProjeto contexto, String perspectiva,
                                                   List<String> titulos, List<ConteudoDesafio> anteriores) {
        List<MotivoReprovacao> correcoes = List.of();

        for (int tentativa = 1; tentativa <= MAXIMO_DE_TENTATIVAS; tentativa++) {
            PromptDesafio prompt = montador.montar(selecao, contexto, perspectiva, titulos, correcoes);
            RespostaIa resposta = chamar(prompt, relatorio.descartesDeTicket);
            correcoes = List.of();
            if (resposta == null) {
                continue;
            }

            ConteudoDesafio conteudo;
            try {
                conteudo = verificador.verificar(resposta.texto());
            } catch (ConteudoInvalidoException e) {
                RelatorioDeMedicao.contar(relatorio.descartesDeTicket, "CONTEUDO_INVALIDO");
                continue;
            }
            if (detector.buscarParecido(conteudo, anteriores).isPresent()) {
                RelatorioDeMedicao.contar(relatorio.descartesDeTicket, "MUITO_PARECIDO");
                continue;
            }
            List<MotivoReprovacao> motivos = validador.validar(conteudo, selecao, contexto);
            if (!motivos.isEmpty()) {
                RelatorioDeMedicao.contar(relatorio.descartesDeTicket, "REPROVADO_NA_VALIDACAO");
                motivos.forEach(m -> RelatorioDeMedicao.contar(relatorio.reprovacoesDeTicket, m.name()));
                correcoes = motivos;
                continue;
            }

            if (tentativa == 1) {
                relatorio.ticketsNaPrimeira++;
            } else {
                relatorio.ticketsNaSegunda++;
            }
            relatorio.maiorSimilaridadePorTicket.add(anteriores.stream()
                    .mapToDouble(anterior -> detector.pontuacao(conteudo, anterior)).max().orElse(0));
            if (resposta.modelo() != null) {
                RelatorioDeMedicao.contar(relatorio.modelos, resposta.modelo());
            }
            return Optional.of(conteudo);
        }
        relatorio.ticketsFalharam++;
        return Optional.empty();
    }

    private Optional<String> gerarDica(ConteudoDesafio ticket, ContextoProjeto contexto, int nivel, List<String> anteriores) {
        List<MotivoReprovacao> correcoes = List.of();

        for (int tentativa = 1; tentativa <= MAXIMO_DE_TENTATIVAS; tentativa++) {
            PromptDesafio prompt = montadorDeDica.montar(ticket, contexto, nivel, anteriores, correcoes);
            RespostaIa resposta = chamar(prompt, relatorio.descartesDeDica);
            correcoes = List.of();
            if (resposta == null) {
                continue;
            }

            String texto;
            try {
                texto = verificador.verificarTexto(resposta.texto(), "dica", 500);
            } catch (ConteudoInvalidoException e) {
                RelatorioDeMedicao.contar(relatorio.descartesDeDica, "CONTEUDO_INVALIDO");
                continue;
            }
            List<MotivoReprovacao> motivos = validador.validarDica(texto, contexto);
            if (!motivos.isEmpty()) {
                RelatorioDeMedicao.contar(relatorio.descartesDeDica, "REPROVADA_NA_VALIDACAO");
                motivos.forEach(m -> RelatorioDeMedicao.contar(relatorio.reprovacoesDeDica, m.name()));
                correcoes = motivos;
                continue;
            }

            if (tentativa == 1) {
                relatorio.dicasNaPrimeira++;
            } else {
                relatorio.dicasNaSegunda++;
            }
            relatorio.tamanhosDasDicas.add(texto.length());
            return Optional.of(texto);
        }
        relatorio.dicasFalharam++;
        return Optional.empty();
    }

    /** Chama o provedor e mede o tempo. Devolve null (e conta o motivo) se ele falhar. */
    private RespostaIa chamar(PromptDesafio prompt, java.util.Map<String, Integer> descartes) {
        long inicio = System.nanoTime();
        try {
            return provedor.gerar(prompt);
        } catch (ProvedorIaException e) {
            RelatorioDeMedicao.contar(descartes, "PROVEDOR_" + (e.getMotivo() == null ? MotivoFalhaIa.INDISPONIVEL : e.getMotivo()).name());
            return null;
        } finally {
            relatorio.duracoesDasChamadasEmMs.add((System.nanoTime() - inicio) / 1_000_000);
        }
    }
}
