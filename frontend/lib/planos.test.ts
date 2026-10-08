import { describe, expect, it } from "vitest";
import type { LimiteDoPlano, SituacaoDoPlano } from "./api";
import { agruparLinhas, dataDeRenovacao, limiteDe, linhasDaComparacao, PERGUNTAS, nivelDeUso, percentualDeUso, plural, restantes, resumoDoUso } from "./planos";

const PLANOS: LimiteDoPlano[] = [
  { plano: "GRATIS", nome: "Grátis", ticketsPorMes: 3, repositorios: 1 },
  { plano: "PRO", nome: "Pro", ticketsPorMes: 60, repositorios: 20 },
];

const SITUACAO: SituacaoDoPlano = {
  plano: "GRATIS", nome: "Grátis", ticketsPorMes: 3, ticketsUsados: 2, renovaEm: "2026-11-01T03:00:00Z",
  repositorios: 1, repositoriosUsados: 1, planos: PLANOS,
};

describe("uso do plano", () => {
  it("calcula o percentual sem passar de 100 e sem dividir por zero", () => {
    expect(percentualDeUso(1, 4)).toBe(25);
    expect(percentualDeUso(2, 3)).toBe(67);
    expect(percentualDeUso(9, 3)).toBe(100);
    expect(percentualDeUso(1, 0)).toBe(0);
  });

  it("classifica o nível de uso: folga, atenção a partir de 80% e esgotado no limite", () => {
    expect(nivelDeUso(0, 3)).toBe("folga");
    expect(nivelDeUso(2, 3)).toBe("folga");
    expect(nivelDeUso(8, 10)).toBe("atencao");
    expect(nivelDeUso(3, 3)).toBe("esgotado");
    expect(nivelDeUso(5, 3)).toBe("esgotado");
    expect(nivelDeUso(0, 0)).toBe("folga");
  });

  it("nunca devolve restantes negativos", () => {
    expect(restantes(1, 3)).toBe(2);
    expect(restantes(7, 3)).toBe(0);
  });

  it("resume o uso de tickets e repositórios", () => {
    const resumo = resumoDoUso(SITUACAO);
    expect(resumo.tickets).toMatchObject({ usados: 2, limite: 3, restantes: 1, nivel: "folga", percentual: 67 });
    expect(resumo.repositorios).toMatchObject({ usados: 1, limite: 1, restantes: 0, nivel: "esgotado", percentual: 100 });
  });
});

describe("textos", () => {
  it("formata a renovação no fuso de São Paulo", () => {
    expect(dataDeRenovacao("2026-11-01T03:00:00Z")).toBe("01/11/2026");
    expect(dataDeRenovacao("2026-11-01T02:59:00Z")).toBe("31/10/2026");
    expect(dataDeRenovacao("lixo")).toBe("");
  });

  it("concorda o plural", () => {
    expect(plural(1, "ticket", "tickets")).toBe("1 ticket");
    expect(plural(3, "ticket", "tickets")).toBe("3 tickets");
    expect(plural(0, "ticket", "tickets")).toBe("0 tickets");
  });
});

describe("comparação de planos", () => {
  it("busca o limite de cada plano", () => {
    expect(limiteDe(PLANOS, "PRO")?.ticketsPorMes).toBe(60);
    expect(limiteDe(undefined, "PRO")).toBeUndefined();
  });

  it("usa os números do servidor e marca como 'em breve' o que ainda não existe", () => {
    const linhas = linhasDaComparacao(PLANOS);
    const tickets = linhas.find((l) => l.id === "tickets");
    expect(tickets?.gratis).toBe("3 por mês");
    expect(tickets?.pro).toBe("60 por mês");
    expect(linhas.find((l) => l.id === "repositorios")?.gratis).toBe("1 repositório");
    expect(linhas.find((l) => l.id === "repositorios")?.pro).toBe("20 repositórios");
    expect(linhas.find((l) => l.id === "revisao")?.pro).toEqual({ texto: "Em breve", emBreve: true });
    expect(linhas.find((l) => l.id === "painel")?.equipe).toEqual({ texto: "Em breve", emBreve: true });
  });

  it("não inventa número quando o servidor ainda não respondeu", () => {
    const linhas = linhasDaComparacao(undefined);
    expect(linhas.find((l) => l.id === "tickets")?.gratis).toBe("—");
    expect(linhas.find((l) => l.id === "repositorios")?.pro).toBe("—");
  });

  it("deixa o conteúdo de estudo incluído em todos os planos", () => {
    for (const id of ["trilhas", "redes", "conquistas"]) {
      const linha = linhasDaComparacao(PLANOS).find((l) => l.id === id);
      expect([linha?.gratis, linha?.pro, linha?.equipe]).toEqual(["Incluído", "Incluído", "Incluído"]);
    }
  });

  it("agrupa as linhas na ordem aprender, IA e turmas, sem perder nenhuma", () => {
    const linhas = linhasDaComparacao(PLANOS);
    const grupos = agruparLinhas(linhas);
    expect(grupos.map((g) => g.grupo)).toEqual(["aprender", "ia", "turmas"]);
    expect(grupos.flatMap((g) => g.linhas)).toHaveLength(linhas.length);
    expect(grupos.find((g) => g.grupo === "ia")?.linhas.map((l) => l.id)).toEqual(["tickets", "repositorios", "revisao"]);
  });

  it("tem perguntas com resposta e sem repetição", () => {
    expect(PERGUNTAS.length).toBeGreaterThanOrEqual(5);
    expect(new Set(PERGUNTAS.map((p) => p.pergunta)).size).toBe(PERGUNTAS.length);
    for (const p of PERGUNTAS) expect(p.resposta.length).toBeGreaterThan(20);
  });
});
