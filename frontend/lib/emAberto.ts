import type { ItemHistorico } from "@/lib/api";
import { estaGerando } from "@/lib/desafio";

export type DesafiosAgrupados = {
  emAndamento: ItemHistorico[];
  paraComecar: ItemHistorico[];
  gerando: ItemHistorico[];
};

/** Separa os desafios em aberto no que a pessoa já está fazendo, no que ainda não começou e no que está sendo gerado. */
export function agruparEmAberto(itens: ItemHistorico[]): DesafiosAgrupados {
  const grupos: DesafiosAgrupados = { emAndamento: [], paraComecar: [], gerando: [] };
  for (const item of itens) {
    if (estaGerando(item.statusGeracao)) grupos.gerando.push(item);
    else if (item.statusGeracao !== "PRONTO" || item.statusProgresso === "CONCLUIDO") continue;
    else if (item.statusProgresso === "EM_ANDAMENTO") grupos.emAndamento.push(item);
    else grupos.paraComecar.push(item);
  }
  return grupos;
}

/** Os nomes dos repositórios que têm desafio em aberto, em ordem alfabética e sem repetir. */
export function repositoriosDe(itens: ItemHistorico[]): string[] {
  return [...new Set(itens.map((item) => item.repositorio))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}
