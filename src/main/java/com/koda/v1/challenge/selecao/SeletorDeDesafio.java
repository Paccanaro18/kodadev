package com.koda.v1.challenge.selecao;

import com.koda.v1.analyzer.contexto.ContextoProjeto;
import com.koda.v1.challenge.DesafiosEsgotadosException;
import com.koda.v1.challenge.SemAnguloAplicavelException;
import com.koda.v1.challenge.TipoDesafio;
import com.koda.v1.challenge.catalogo.AlvoDesafio;
import com.koda.v1.challenge.catalogo.AnguloAplicavel;
import com.koda.v1.challenge.catalogo.CatalogoAngulos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.ToIntFunction;
import java.util.random.RandomGenerator;

@Component
public class SeletorDeDesafio {

    private static final int NUNCA_USADO = Integer.MAX_VALUE;

    private final CatalogoAngulos catalogo;
    private final RandomGenerator aleatorio;

    @Autowired
    public SeletorDeDesafio(CatalogoAngulos catalogo) {
        this(catalogo, RandomGenerator.getDefault());
    }

    SeletorDeDesafio(CatalogoAngulos catalogo, RandomGenerator aleatorio) {
        this.catalogo = catalogo;
        this.aleatorio = aleatorio;
    }

    public SelecaoDeDesafio selecionar(ContextoProjeto contexto, TipoDesafio tipoPedido, List<UsoAnterior> historico) {
        List<AnguloAplicavel> aplicaveis = catalogo.aplicaveis(contexto, tipoPedido);
        if (aplicaveis.isEmpty()) {
            throw new SemAnguloAplicavelException();
        }

        List<AnguloAplicavel> disponiveis = semCombinacoesUsadas(aplicaveis, historico);
        if (disponiveis.isEmpty()) {
            throw new DesafiosEsgotadosException();
        }

        TipoDesafio tipo = tipoPedido != null ? tipoPedido : escolherTipo(disponiveis, historico);
        List<AnguloAplicavel> doTipo = disponiveis.stream().filter(a -> a.angulo().tipo() == tipo).toList();

        AnguloAplicavel escolhido = menosRecente(doTipo, aplicavel -> idadeDoAngulo(aplicavel, historico));
        AlvoDesafio alvo = menosRecente(escolhido.alvos(), candidato -> idadeDoAlvo(candidato, historico));

        return new SelecaoDeDesafio(escolhido.angulo(), alvo);
    }

    private List<AnguloAplicavel> semCombinacoesUsadas(List<AnguloAplicavel> aplicaveis, List<UsoAnterior> historico) {
        Set<String> usadas = new HashSet<>();
        for (UsoAnterior uso : historico) {
            if (uso.mesmaAnalise()) {
                usadas.add(uso.combinacao());
            }
        }

        List<AnguloAplicavel> disponiveis = new ArrayList<>();
        for (AnguloAplicavel aplicavel : aplicaveis) {
            List<AlvoDesafio> livres = aplicavel.alvos().stream()
                    .filter(alvo -> !usadas.contains(aplicavel.angulo().id() + "|" + alvo.chave()))
                    .toList();
            if (!livres.isEmpty()) {
                disponiveis.add(new AnguloAplicavel(aplicavel.angulo(), livres));
            }
        }
        return disponiveis;
    }

    private TipoDesafio escolherTipo(List<AnguloAplicavel> disponiveis, List<UsoAnterior> historico) {
        List<TipoDesafio> tipos = disponiveis.stream().map(a -> a.angulo().tipo()).distinct().toList();
        return menosRecente(tipos, tipo -> idadeDoTipo(tipo, historico));
    }

    private int idadeDoAngulo(AnguloAplicavel aplicavel, List<UsoAnterior> historico) {
        for (int i = 0; i < historico.size(); i++) {
            if (historico.get(i).anguloId().equals(aplicavel.angulo().id())) {
                return i;
            }
        }
        return NUNCA_USADO;
    }

    private int idadeDoTipo(TipoDesafio tipo, List<UsoAnterior> historico) {
        for (int i = 0; i < historico.size(); i++) {
            boolean mesmoTipo = catalogo.porId(historico.get(i).anguloId())
                    .map(angulo -> angulo.tipo() == tipo)
                    .orElse(false);
            if (mesmoTipo) {
                return i;
            }
        }
        return NUNCA_USADO;
    }

    private int idadeDoAlvo(AlvoDesafio alvo, List<UsoAnterior> historico) {
        for (int i = 0; i < historico.size(); i++) {
            UsoAnterior uso = historico.get(i);
            if (uso.mesmaAnalise() && uso.alvoChave().equals(alvo.chave())) {
                return i;
            }
        }
        return NUNCA_USADO;
    }

    private <T> T menosRecente(List<T> candidatos, ToIntFunction<T> idadeDoUso) {
        List<T> embaralhados = new ArrayList<>(candidatos);
        Collections.shuffle(embaralhados, aleatorio);

        T escolhido = embaralhados.get(0);
        int maiorIdade = idadeDoUso.applyAsInt(escolhido);
        for (T candidato : embaralhados) {
            int idade = idadeDoUso.applyAsInt(candidato);
            if (idade > maiorIdade) {
                escolhido = candidato;
                maiorIdade = idade;
            }
        }
        return escolhido;
    }
}
