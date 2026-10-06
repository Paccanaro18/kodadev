import type { CategoriaDeSeguranca, DificuldadeDeSeguranca, ResumoDeSeguranca } from "@/lib/api";

export const CATEGORIAS: { valor: CategoriaDeSeguranca; rotulo: string; descricao: string }[] = [
  { valor: "LOGS", rotulo: "Análise de logs", descricao: "Ache o ataque no meio do registro do servidor." },
  { valor: "CRIPTOGRAFIA", rotulo: "Criptografia", descricao: "Hashes fracos, tokens e codificações que não protegem nada." },
  { valor: "SEGREDOS", rotulo: "Segredos vazados", descricao: "Chaves esquecidas em commits, imagens e no código do site." },
  { valor: "WEB", rotulo: "Web e APIs", descricao: "Falhas de sessão, controle de acesso e CORS." },
];

export const DIFICULDADES: { valor: DificuldadeDeSeguranca; rotulo: string }[] = [
  { valor: "FACIL", rotulo: "Fácil" },
  { valor: "MEDIO", rotulo: "Médio" },
  { valor: "DIFICIL", rotulo: "Difícil" },
];

export function rotuloDaCategoria(categoria: CategoriaDeSeguranca): string {
  return CATEGORIAS.find((item) => item.valor === categoria)?.rotulo ?? categoria;
}

export function rotuloDaDificuldade(dificuldade: DificuldadeDeSeguranca): string {
  return DIFICULDADES.find((item) => item.valor === dificuldade)?.rotulo ?? dificuldade;
}

export function estiloDaDificuldade(dificuldade: DificuldadeDeSeguranca): string {
  switch (dificuldade) {
    case "FACIL": return "bg-ok-soft text-ok";
    case "MEDIO": return "bg-warn-soft text-warn";
    case "DIFICIL": return "bg-bad-soft text-bad";
  }
}

export type FiltrosDeSeguranca = { categoria: CategoriaDeSeguranca | null; dificuldade: DificuldadeDeSeguranca | null };

export function filtrar(desafios: ResumoDeSeguranca[], filtros: FiltrosDeSeguranca): ResumoDeSeguranca[] {
  return desafios.filter((desafio) =>
    (filtros.categoria === null || desafio.categoria === filtros.categoria)
    && (filtros.dificuldade === null || desafio.dificuldade === filtros.dificuldade));
}

export type ResumoDaPessoa = { pontos: number; pontosPossiveis: number; resolvidos: number; total: number };

export function resumirPessoa(desafios: ResumoDeSeguranca[]): ResumoDaPessoa {
  return {
    pontos: desafios.filter((d) => d.resolvido).reduce((soma, d) => soma + d.pontos, 0),
    pontosPossiveis: desafios.reduce((soma, d) => soma + d.pontos, 0),
    resolvidos: desafios.filter((d) => d.resolvido).length,
    total: desafios.length,
  };
}

export function progressoPorCategoria(desafios: ResumoDeSeguranca[]): { categoria: CategoriaDeSeguranca; resolvidos: number; total: number }[] {
  return CATEGORIAS.map(({ valor }) => {
    const daCategoria = desafios.filter((d) => d.categoria === valor);
    return { categoria: valor, resolvidos: daCategoria.filter((d) => d.resolvido).length, total: daCategoria.length };
  });
}
