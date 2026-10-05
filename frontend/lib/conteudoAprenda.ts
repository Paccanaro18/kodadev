/**
 * Artigos de estudo da aba "Aprenda aqui". Para acrescentar um artigo, inclua um item na lista do arquivo da trilha em
 * lib/aulas/: a lista, o filtro por trilha, a página de leitura, o índice e a próxima leitura se montam sozinhos.
 */
import { AULAS_INICIAIS } from "./aulas/iniciais";
import { AULAS_DE_SEGURANCA } from "./aulas/seguranca";
import type { Aula, Bloco, Trilha } from "./aulas/tipos";

export type { Aula, Bloco, Referencia, Trilha } from "./aulas/tipos";

export const TRILHAS: Record<Trilha, { rotulo: string; descricao: string }> = {
  java: { rotulo: "Java", descricao: "Spring Boot, testes e boas práticas de backend." },
  typescript: { rotulo: "TypeScript", descricao: "Servidores Node com Express, NestJS e afins." },
  python: { rotulo: "Python", descricao: "APIs com FastAPI, validação e testes com pytest." },
  seguranca: { rotulo: "Segurança", descricao: "Como escrever código seguro: injeção, autenticação, navegador, segredos e dependências." },
  carreira: { rotulo: "Carreira", descricao: "Como trabalhar em time: tickets, código dos outros e HTTP." },
};

export const ORDEM_DAS_TRILHAS: Trilha[] = ["java", "typescript", "python", "seguranca", "carreira"];

export const AULAS: Aula[] = [...AULAS_INICIAIS, ...AULAS_DE_SEGURANCA];

export function aulaPorSlug(slug: string): Aula | undefined {
  return AULAS.find((aula) => aula.slug === slug);
}

export function aulasDaTrilha(trilha: Trilha | undefined): Aula[] {
  return trilha ? AULAS.filter((aula) => aula.trilha === trilha) : AULAS;
}

/** Até duas leituras para seguir: primeiro da mesma trilha, depois as que sobrarem. */
export function proximasLeituras(aula: Aula, maximo = 2): Aula[] {
  const outras = AULAS.filter((a) => a.slug !== aula.slug);
  const mesmaTrilha = outras.filter((a) => a.trilha === aula.trilha);
  const demais = outras.filter((a) => a.trilha !== aula.trilha);
  return [...mesmaTrilha, ...demais].slice(0, maximo);
}

/** Os subtítulos de nível 2 do artigo, com o identificador usado no link do índice. */
export function indiceDaAula(aula: Aula): { id: string; titulo: string }[] {
  return indiceDosBlocos(aula.blocos);
}

export function indiceDosBlocos(blocos: Bloco[]): { id: string; titulo: string }[] {
  return blocos.flatMap((bloco) => (bloco.tipo === "h" ? [{ id: idDoTitulo(bloco.texto), titulo: bloco.texto }] : []));
}

/** "O caminho de uma requisição" vira "o-caminho-de-uma-requisicao". */
export function idDoTitulo(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
