import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Lê as cores direto do app/globals.css e confere, em cada tema, o contraste dos pares texto e fundo usados nas telas.
 * O mínimo é 4,5:1 (WCAG AA para texto normal). Se uma cor nova ficar abaixo disso, este teste falha.
 */
const css = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf-8");

type Cor = [number, number, number];

const TEMAS: { nome: string; seletor: string }[] = [
  { nome: "preto", seletor: '[data-tema="preto"], :root {' },
  { nome: "roxo", seletor: '[data-tema="roxo"] {' },
  { nome: "claro", seletor: '[data-tema="claro"] {' },
];

const MINIMO = 4.5;

function variaveisDe(seletor: string): Record<string, string> {
  const inicio = css.indexOf(seletor);
  if (inicio < 0) throw new Error(`Tema não encontrado no CSS: ${seletor}`);
  const bloco = css.slice(inicio, css.indexOf("}", inicio));
  return Object.fromEntries([...bloco.matchAll(/--c-([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

function lerCor(valor: string, base?: Cor): Cor {
  const hex = valor.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)) as Cor;

  const rgb = valor.match(/^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/);
  if (rgb) {
    const cor = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
    const alfa = rgb[4] === undefined ? 1 : Number(rgb[4]);
    if (alfa < 1 && !base) throw new Error(`Cor com transparência precisa de um fundo: ${valor}`);
    return cor.map((c, i) => Math.round(alfa * c + (1 - alfa) * (base?.[i] ?? c))) as Cor;
  }
  throw new Error(`Formato de cor não reconhecido: ${valor}`);
}

function luminancia([r, g, b]: Cor): number {
  const canal = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function contraste(a: Cor, b: Cor): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}

const BRANCO: Cor = [255, 255, 255];

describe.each(TEMAS)("contraste do tema $nome", ({ seletor }) => {
  const v = variaveisDe(seletor);
  const cor = (nome: string, base?: Cor) => lerCor(v[nome], base);
  const superficie = cor("surface");

  const pares: [string, Cor, Cor][] = [
    ["texto principal no fundo da página", cor("ink"), cor("cream")],
    ["texto principal no cartão", cor("ink"), superficie],
    ["texto principal em área suave", cor("ink"), cor("tint")],
    ["texto secundário no cartão", cor("ink-2"), superficie],
    ["texto secundário em área suave", cor("ink-2"), cor("tint")],
    ["texto discreto no cartão", cor("ink-3"), superficie],
    ["texto discreto no fundo da página", cor("ink-3"), cor("cream")],
    ["texto de corpo no cartão", cor("body"), superficie],
    ["texto roxo no cartão", cor("koda-texto"), superficie],
    ["texto roxo no fundo da página", cor("koda-texto"), cor("cream")],
    ["texto roxo em área suave", cor("koda-texto"), cor("tint")],
    ["texto roxo na etiqueta roxa suave", cor("koda-texto"), cor("koda-soft", superficie)],
    ["texto branco no botão roxo", BRANCO, cor("koda")],
    ["texto branco no botão roxo ao passar o mouse", BRANCO, cor("koda-dark")],
    ["sucesso na etiqueta verde", cor("ok"), cor("ok-soft", superficie)],
    ["alerta na etiqueta amarela", cor("warn"), cor("warn-soft", superficie)],
    ["erro na etiqueta vermelha", cor("bad"), cor("bad-soft", superficie)],
    ["sucesso no cartão", cor("ok"), superficie],
    ["erro no cartão", cor("bad"), superficie],
  ];

  it.each(pares)("%s tem pelo menos 4,5:1", (_descricao, texto, fundo) => {
    expect(contraste(texto, fundo)).toBeGreaterThanOrEqual(MINIMO);
  });
});

describe("tokens de cor", () => {
  it("define o mesmo conjunto de tokens nos três temas", () => {
    const [primeiro, ...outros] = TEMAS.map((t) => Object.keys(variaveisDe(t.seletor)).sort());
    for (const demais of outros) expect(demais).toEqual(primeiro);
  });

  it("calcula o contraste certo em dois casos conhecidos", () => {
    expect(contraste([0, 0, 0], BRANCO)).toBeCloseTo(21, 0);
    expect(contraste(BRANCO, BRANCO)).toBeCloseTo(1, 5);
  });
});
