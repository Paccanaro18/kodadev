import type { StatusGeracao, StatusProgresso, TipoDesafio, TipoPedido } from "@/lib/api";

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

const ROTULOS_DO_PROGRESSO: Record<StatusProgresso, string> = {
  NAO_INICIADO: "Não iniciado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

export function rotuloDoProgresso(status: StatusProgresso): string {
  return ROTULOS_DO_PROGRESSO[status] ?? status;
}

/** Cores do selo de progresso, no mesmo vocabulário visual do resto do app. */
export function estiloDoProgresso(status: StatusProgresso): string {
  switch (status) {
    case "CONCLUIDO":
      return "bg-[#dff5e6] text-[#1d7a3c]";
    case "EM_ANDAMENTO":
      return "bg-[#fff4d6] text-[#8a5a00]";
    default:
      return "bg-[#f1eefb] text-ink-2";
  }
}

const ROTULOS_DO_NIVEL_DA_DICA = ["Direção", "Abordagem", "Conferência"];

export function rotuloDoNivelDaDica(nivel: number): string {
  return ROTULOS_DO_NIVEL_DA_DICA[nivel - 1] ?? `Dica ${nivel}`;
}
