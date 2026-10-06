import { describe, expect, it } from "vitest";
import type { ResumoDeSeguranca } from "@/lib/api";
import {
  CATEGORIAS, estiloDaDificuldade, filtrar, progressoPorCategoria, resumirPessoa, rotuloDaCategoria, rotuloDaDificuldade,
} from "@/lib/seguranca";

function desafio(extra: Partial<ResumoDeSeguranca>): ResumoDeSeguranca {
  return { slug: "x", titulo: "X", categoria: "LOGS", dificuldade: "FACIL", pontos: 100, resumo: "r", resolvido: false, ...extra };
}

const exemplos = [
  desafio({ slug: "a", categoria: "LOGS", dificuldade: "FACIL", pontos: 100, resolvido: true }),
  desafio({ slug: "b", categoria: "LOGS", dificuldade: "DIFICIL", pontos: 300 }),
  desafio({ slug: "c", categoria: "WEB", dificuldade: "MEDIO", pontos: 200, resolvido: true }),
  desafio({ slug: "d", categoria: "CRIPTOGRAFIA", dificuldade: "MEDIO", pontos: 200 }),
];

describe("segurança: rótulos", () => {
  it("traduz categorias e dificuldades e mantém o valor desconhecido", () => {
    expect(rotuloDaCategoria("LOGS")).toBe("Análise de logs");
    expect(rotuloDaCategoria("WEB")).toBe("Web e APIs");
    expect(rotuloDaCategoria("OUTRA" as never)).toBe("OUTRA");
    expect(rotuloDaDificuldade("MEDIO")).toBe("Médio");
    expect(rotuloDaDificuldade("X" as never)).toBe("X");
  });

  it("dá um estilo a cada dificuldade", () => {
    expect(estiloDaDificuldade("FACIL")).toContain("ok");
    expect(estiloDaDificuldade("MEDIO")).toContain("warn");
    expect(estiloDaDificuldade("DIFICIL")).toContain("bad");
  });
});

describe("segurança: filtros e resumo", () => {
  it("filtra por categoria, por dificuldade e pelos dois", () => {
    expect(filtrar(exemplos, { categoria: null, dificuldade: null })).toHaveLength(4);
    expect(filtrar(exemplos, { categoria: "LOGS", dificuldade: null }).map((d) => d.slug)).toEqual(["a", "b"]);
    expect(filtrar(exemplos, { categoria: null, dificuldade: "MEDIO" }).map((d) => d.slug)).toEqual(["c", "d"]);
    expect(filtrar(exemplos, { categoria: "LOGS", dificuldade: "MEDIO" })).toEqual([]);
  });

  it("soma os pontos ganhos e os possíveis", () => {
    expect(resumirPessoa(exemplos)).toEqual({ pontos: 300, pontosPossiveis: 800, resolvidos: 2, total: 4 });
    expect(resumirPessoa([])).toEqual({ pontos: 0, pontosPossiveis: 0, resolvidos: 0, total: 0 });
  });

  it("conta o progresso em todas as categorias, até nas vazias", () => {
    const progresso = progressoPorCategoria(exemplos);

    expect(progresso).toHaveLength(CATEGORIAS.length);
    expect(progresso.find((p) => p.categoria === "LOGS")).toEqual({ categoria: "LOGS", resolvidos: 1, total: 2 });
    expect(progresso.find((p) => p.categoria === "SEGREDOS")).toEqual({ categoria: "SEGREDOS", resolvidos: 0, total: 0 });
  });
});
