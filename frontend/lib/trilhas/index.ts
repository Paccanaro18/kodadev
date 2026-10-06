import { TRILHA_AWS } from "./aws";
import { TRILHA_JAVA } from "./java";
import { TRILHA_LLM } from "./llm";
import { TRILHA_REDES } from "./redes";
import { TRILHA_SEGURANCA } from "./seguranca";
import { TRILHA_PYTHON } from "./python";
import { TRILHA_TYPESCRIPT } from "./typescript";
import type { Checkpoint, GrupoDeTrilha, Item, Modulo, ResumoDeTrilha, SlugDeTrilha, Trilha } from "./tipos";

export type { Checkpoint, DesafioPratico, GrupoDeTrilha, Item, Modulo, Questao, ResumoDeItem, ResumoDeTrilha, SlugDeTrilha, Trilha } from "./tipos";

/** Todas as trilhas, na ordem em que aparecem na tela. */
export const TRILHAS: Trilha[] = [TRILHA_JAVA, TRILHA_TYPESCRIPT, TRILHA_PYTHON, TRILHA_AWS, TRILHA_LLM, TRILHA_SEGURANCA, TRILHA_REDES];

export function trilhasDoGrupo(grupo: GrupoDeTrilha): Trilha[] {
  return TRILHAS.filter((trilha) => trilha.grupo === grupo);
}

export function trilhaPorSlug(slug: string): Trilha | undefined {
  return TRILHAS.find((trilha) => trilha.slug === slug);
}

/** Todos os itens da trilha em ordem de estudo, sem a divisão em etapas. */
export function itensDaTrilha(trilha: Trilha): Item[] {
  return trilha.etapas.flatMap((etapa) => etapa.itens);
}

export function itemPorSlug(trilha: Trilha, slug: string): Item | undefined {
  return itensDaTrilha(trilha).find((item) => item.slug === slug);
}

export function modulosDaTrilha(trilha: Trilha): Modulo[] {
  return itensDaTrilha(trilha).filter((item): item is Modulo => item.tipo === "modulo");
}

export function checkpointsDaTrilha(trilha: Trilha): Checkpoint[] {
  return itensDaTrilha(trilha).filter((item): item is Checkpoint => item.tipo === "checkpoint");
}

/** O item anterior e o seguinte na ordem de estudo, para os botões de navegação. */
export function vizinhosDoItem(trilha: Trilha, slug: string): { anterior: Item | null; proximo: Item | null } {
  const itens = itensDaTrilha(trilha);
  const posicao = itens.findIndex((item) => item.slug === slug);
  if (posicao < 0) return { anterior: null, proximo: null };
  return { anterior: itens[posicao - 1] ?? null, proximo: itens[posicao + 1] ?? null };
}

function detalheDe(item: Item): string {
  return item.tipo === "modulo"
    ? `${item.nivel} · ${item.leitura} de leitura · ${item.questoes.length} questões`
    : `Checkpoint · ${item.questoes.length} questões`;
}

/** A versão leve da trilha, segura para mandar ao navegador: títulos e resumos, sem o conteúdo das lições. */
export function resumirTrilha(trilha: Trilha): ResumoDeTrilha {
  return {
    slug: trilha.slug,
    grupo: trilha.grupo,
    titulo: trilha.titulo,
    descricao: trilha.descricao,
    publico: trilha.publico,
    etapas: trilha.etapas.map((etapa) => ({
      titulo: etapa.titulo,
      descricao: etapa.descricao,
      itens: etapa.itens.map((item) => ({
        tipo: item.tipo,
        slug: item.slug,
        titulo: item.titulo,
        resumo: item.resumo,
        detalhe: detalheDe(item),
        questoes: item.questoes.length,
        ...(item.tipo === "modulo" ? { nivel: item.nivel, leitura: item.leitura } : {}),
        ...(item.tipo === "checkpoint" ? { notaMinima: item.notaMinima } : {}),
      })),
    })),
    planejados: trilha.planejados,
  };
}

export function slugsDeTrilha(): SlugDeTrilha[] {
  return TRILHAS.map((trilha) => trilha.slug);
}
