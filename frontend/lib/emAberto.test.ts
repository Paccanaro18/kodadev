import { describe, expect, it } from "vitest";
import type { ItemHistorico } from "@/lib/api";
import { agruparEmAberto, repositoriosDe } from "@/lib/emAberto";

function item(extra: Partial<ItemHistorico>): ItemHistorico {
  return {
    id: "1", analiseId: "a", repositorio: "api", numero: 1, codigo: "DEV-001", tipo: "FEATURE",
    statusGeracao: "PRONTO", statusProgresso: "NAO_INICIADO", titulo: "T", dicasUsadas: 0,
    criadoEm: "2026-10-01T12:00:00Z", finalizadoEm: null, ...extra,
  };
}

describe("agruparEmAberto", () => {
  it("separa o que está em andamento, o que falta começar e o que está sendo gerado", () => {
    const grupos = agruparEmAberto([
      item({ id: "a", statusProgresso: "EM_ANDAMENTO" }),
      item({ id: "b", statusProgresso: "NAO_INICIADO" }),
      item({ id: "c", statusGeracao: "PENDENTE", titulo: null }),
      item({ id: "d", statusGeracao: "EM_ANDAMENTO", titulo: null }),
    ]);

    expect(grupos.emAndamento.map((i) => i.id)).toEqual(["a"]);
    expect(grupos.paraComecar.map((i) => i.id)).toEqual(["b"]);
    expect(grupos.gerando.map((i) => i.id)).toEqual(["c", "d"]);
  });

  it("deixa de fora o que falhou e o que já foi concluído", () => {
    const grupos = agruparEmAberto([
      item({ id: "f", statusGeracao: "FALHOU", titulo: null }),
      item({ id: "c", statusProgresso: "CONCLUIDO" }),
    ]);

    expect(grupos).toEqual({ emAndamento: [], paraComecar: [], gerando: [] });
  });
});

describe("repositoriosDe", () => {
  it("lista cada repositório uma vez, em ordem alfabética", () => {
    expect(repositoriosDe([item({ repositorio: "zeta" }), item({ repositorio: "alfa" }), item({ repositorio: "zeta" })]))
      .toEqual(["alfa", "zeta"]);
  });
});
