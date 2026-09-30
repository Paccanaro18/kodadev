import type { StatusGeracao, TipoDesafio, TipoPedido } from "@/lib/api";

export const TIPOS_DE_DESAFIO: { valor: TipoPedido; nome: string; descricao: string }[] = [
  { valor: "FEATURE", nome: "Feature", descricao: "Nova funcionalidade no seu código" },
  { valor: "BUG", nome: "Bug", descricao: "Encontre e corrija um problema" },
  { valor: "TESTING", nome: "Testing", descricao: "Escreva testes para o que existe" },
  { valor: "ALEATORIO", nome: "Aleatório", descricao: "A Koda escolhe por você" },
];

const ROTULOS_DO_TIPO: Record<TipoDesafio, string> = {
  FEATURE: "Feature",
  BUG: "Bug",
  TESTING: "Testing",
};

export function rotuloDoTipo(tipo: TipoDesafio): string {
  return ROTULOS_DO_TIPO[tipo] ?? tipo;
}

export function estaGerando(status: StatusGeracao): boolean {
  return status === "PENDENTE" || status === "EM_ANDAMENTO";
}

export function terminou(status: StatusGeracao): boolean {
  return status === "PRONTO" || status === "FALHOU";
}
