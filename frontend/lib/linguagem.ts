import type { Linguagem } from "@/lib/api";

type Info = { rotulo: string };

const LINGUAGENS: Record<Linguagem, Info> = {
  JAVA: { rotulo: "Java" },
  TYPESCRIPT: { rotulo: "TypeScript" },
  JAVASCRIPT: { rotulo: "JavaScript" },
  PYTHON: { rotulo: "Python" },
};

export const LINGUAGENS_SUPORTADAS: Linguagem[] = ["JAVA", "TYPESCRIPT", "JAVASCRIPT", "PYTHON"];

export function infoDaLinguagem(linguagem: string | null | undefined): Info | null {
  if (!linguagem) return null;
  return LINGUAGENS[linguagem as Linguagem] ?? null;
}

export function rotuloDaLinguagem(linguagem: string | null | undefined): string | null {
  return infoDaLinguagem(linguagem)?.rotulo ?? null;
}
