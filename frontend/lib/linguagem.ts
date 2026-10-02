import type { Linguagem } from "@/lib/api";

type Info = { rotulo: string; cor: string };

/** A cor só enfeita o selo (um ponto): o texto do selo usa as cores do tema e mantém o contraste. */
const LINGUAGENS: Record<Linguagem, Info> = {
  JAVA: { rotulo: "Java", cor: "#e76f00" },
  TYPESCRIPT: { rotulo: "TypeScript", cor: "#3178c6" },
  JAVASCRIPT: { rotulo: "JavaScript", cor: "#d4b800" },
  PYTHON: { rotulo: "Python", cor: "#3776ab" },
};

export const LINGUAGENS_SUPORTADAS: Linguagem[] = ["JAVA", "TYPESCRIPT", "JAVASCRIPT", "PYTHON"];

export function infoDaLinguagem(linguagem: string | null | undefined): Info | null {
  if (!linguagem) return null;
  return LINGUAGENS[linguagem as Linguagem] ?? null;
}

export function rotuloDaLinguagem(linguagem: string | null | undefined): string | null {
  return infoDaLinguagem(linguagem)?.rotulo ?? null;
}
