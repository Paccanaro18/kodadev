export type Tema = "preto" | "roxo" | "claro";

export const TEMA_PADRAO: Tema = "preto";
export const CHAVE_DO_TEMA = "koda-tema";

export const TEMAS: { id: Tema; nome: string; descricao: string; cores: [string, string, string] }[] = [
  { id: "preto", nome: "Preto", descricao: "Fundo bem escuro, com detalhes em roxo.", cores: ["#050507", "#0e0e13", "#7468ff"] },
  { id: "roxo", nome: "Roxo escuro", descricao: "Fundo azul-arroxeado, mais suave.", cores: ["#0d0f1f", "#171a31", "#7468ff"] },
  { id: "claro", nome: "Claro", descricao: "Fundo claro, como no início.", cores: ["#fdfbf8", "#ffffff", "#665cff"] },
];

export function ehTema(valor: unknown): valor is Tema {
  return valor === "preto" || valor === "roxo" || valor === "claro";
}

/** Tema que está valendo na página agora. */
export function temaAtual(): Tema {
  const valor = document.documentElement.dataset.tema;
  return ehTema(valor) ? valor : TEMA_PADRAO;
}

/** Aplica o tema, guarda a escolha neste navegador e avisa os outros componentes. */
export function aplicarTema(tema: Tema): void {
  document.documentElement.dataset.tema = tema;
  try {
    localStorage.setItem(CHAVE_DO_TEMA, tema);
  } catch {
    // Sem armazenamento disponível: o tema vale só até recarregar a página.
  }
  window.dispatchEvent(new CustomEvent("koda-tema", { detail: tema }));
}
