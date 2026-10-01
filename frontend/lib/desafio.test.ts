import { describe, expect, it } from "vitest";
import { estaGerando, estiloDoProgresso, rotuloDoNivelDaDica, rotuloDoProgresso, rotuloDoTipo, terminou, TIPOS_DE_DESAFIO } from "./desafio";

describe("desafio", () => {
  it("rotula os tipos e o progresso em português", () => {
    expect(rotuloDoTipo("FEATURE")).toBe("Feature");
    expect(rotuloDoTipo("BUG")).toBe("Bug");
    expect(rotuloDoTipo("TESTING")).toBe("Testing");
    expect(rotuloDoProgresso("NAO_INICIADO")).toBe("Não iniciado");
    expect(rotuloDoProgresso("EM_ANDAMENTO")).toBe("Em andamento");
    expect(rotuloDoProgresso("CONCLUIDO")).toBe("Concluído");
  });

  it("separa geração em aberto de geração terminada", () => {
    expect(estaGerando("PENDENTE")).toBe(true);
    expect(estaGerando("EM_ANDAMENTO")).toBe(true);
    expect(estaGerando("PRONTO")).toBe(false);
    expect(estaGerando("FALHOU")).toBe(false);
    expect(terminou("PRONTO")).toBe(true);
    expect(terminou("FALHOU")).toBe(true);
    expect(terminou("PENDENTE")).toBe(false);
    expect(terminou("EM_ANDAMENTO")).toBe(false);
  });

  it("usa só tokens de cor no selo de progresso, nunca cor fixa", () => {
    for (const status of ["NAO_INICIADO", "EM_ANDAMENTO", "CONCLUIDO"] as const) {
      expect(estiloDoProgresso(status)).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    }
    expect(estiloDoProgresso("CONCLUIDO")).toContain("bg-ok-soft");
    expect(estiloDoProgresso("EM_ANDAMENTO")).toContain("bg-warn-soft");
  });

  it("nomeia os três níveis de dica e tem um nome genérico para os outros", () => {
    expect(rotuloDoNivelDaDica(1)).toBe("Direção");
    expect(rotuloDoNivelDaDica(2)).toBe("Abordagem");
    expect(rotuloDoNivelDaDica(3)).toBe("Conferência");
    expect(rotuloDoNivelDaDica(4)).toBe("Dica 4");
  });

  it("oferece os quatro tipos de pedido, incluindo o aleatório", () => {
    expect(TIPOS_DE_DESAFIO.map((t) => t.valor)).toEqual(["FEATURE", "BUG", "TESTING", "ALEATORIO"]);
  });
});
