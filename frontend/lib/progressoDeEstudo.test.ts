import { describe, expect, it } from "vitest";
import {
  CHAVE_DO_ESTUDO, ESTADO_VAZIO, checkpointAprovado, gravarEstado, itemConcluido, lerEstado, marcarDesafio, marcarLicao,
  moduloConcluido, percentualConcluido, progressoDa, proximoPendente, registrarNota, sanear,
  type EstadoDeEstudo, type ItemParaProgresso,
} from "@/lib/progressoDeEstudo";

const itens: ItemParaProgresso[] = [
  { tipo: "modulo", slug: "m1" },
  { tipo: "modulo", slug: "m2" },
  { tipo: "checkpoint", slug: "cp", notaMinima: 0.7 },
];

describe("progresso de estudo", () => {
  it("começa vazio para qualquer trilha", () => {
    expect(progressoDa(ESTADO_VAZIO, "java")).toEqual({ licoes: [], notas: {}, desafios: [] });
  });

  it("marca e desmarca a lição sem repetir e sem tocar nas outras trilhas", () => {
    let estado: EstadoDeEstudo = marcarLicao(ESTADO_VAZIO, "java", "m1", true);
    estado = marcarLicao(estado, "java", "m1", true);
    estado = marcarLicao(estado, "python", "m1", true);

    expect(progressoDa(estado, "java").licoes).toEqual(["m1"]);
    expect(progressoDa(estado, "python").licoes).toEqual(["m1"]);

    estado = marcarLicao(estado, "java", "m1", false);
    expect(progressoDa(estado, "java").licoes).toEqual([]);
    expect(progressoDa(estado, "python").licoes).toEqual(["m1"]);
  });

  it("marca e desmarca o desafio", () => {
    const feito = marcarDesafio(ESTADO_VAZIO, "java", "m1", true);
    expect(progressoDa(feito, "java").desafios).toEqual(["m1"]);
    expect(progressoDa(marcarDesafio(feito, "java", "m1", false), "java").desafios).toEqual([]);
  });

  it("guarda só a melhor nota e a mantém entre 0 e 1", () => {
    let estado = registrarNota(ESTADO_VAZIO, "java", "m1", 0.8);
    estado = registrarNota(estado, "java", "m1", 0.4);
    expect(progressoDa(estado, "java").notas.m1).toBe(0.8);

    estado = registrarNota(estado, "java", "m1", 7);
    expect(progressoDa(estado, "java").notas.m1).toBe(1);
    expect(progressoDa(registrarNota(ESTADO_VAZIO, "java", "x", -3), "java").notas.x).toBe(0);
  });

  it("só conclui o módulo com a lição lida e nota de 60% ou mais", () => {
    let estado = registrarNota(ESTADO_VAZIO, "java", "m1", 0.6);
    expect(moduloConcluido(progressoDa(estado, "java"), "m1")).toBe(false);

    estado = marcarLicao(estado, "java", "m1", true);
    expect(moduloConcluido(progressoDa(estado, "java"), "m1")).toBe(true);

    const fraca = marcarLicao(registrarNota(ESTADO_VAZIO, "java", "m1", 0.5), "java", "m1", true);
    expect(moduloConcluido(progressoDa(fraca, "java"), "m1")).toBe(false);
  });

  it("aprova o checkpoint pela nota mínima dele", () => {
    const abaixo = registrarNota(ESTADO_VAZIO, "java", "cp", 0.66);
    const acima = registrarNota(ESTADO_VAZIO, "java", "cp", 0.7);

    expect(checkpointAprovado(progressoDa(abaixo, "java"), "cp", 0.7)).toBe(false);
    expect(checkpointAprovado(progressoDa(acima, "java"), "cp", 0.7)).toBe(true);
    expect(checkpointAprovado(progressoDa(ESTADO_VAZIO, "java"), "cp", 0)).toBe(false);
  });

  it("calcula o percentual e o próximo item pendente", () => {
    let estado = marcarLicao(registrarNota(ESTADO_VAZIO, "java", "m1", 1), "java", "m1", true);
    expect(percentualConcluido(progressoDa(estado, "java"), itens)).toBe(33);
    expect(proximoPendente(progressoDa(estado, "java"), itens)?.slug).toBe("m2");

    estado = marcarLicao(registrarNota(estado, "java", "m2", 1), "java", "m2", true);
    estado = registrarNota(estado, "java", "cp", 0.9);
    expect(percentualConcluido(progressoDa(estado, "java"), itens)).toBe(100);
    expect(proximoPendente(progressoDa(estado, "java"), itens)).toBeNull();
    expect(percentualConcluido(progressoDa(estado, "java"), [])).toBe(0);
  });

  it("usa 60% como nota mínima quando o checkpoint não informa", () => {
    const estado = registrarNota(ESTADO_VAZIO, "java", "cp", 0.6);
    expect(itemConcluido(progressoDa(estado, "java"), { tipo: "checkpoint", slug: "cp" })).toBe(true);
  });
});

describe("armazenamento", () => {
  function memoria(inicial?: string) {
    const dados = new Map<string, string>();
    if (inicial !== undefined) dados.set(CHAVE_DO_ESTUDO, inicial);
    return {
      getItem: (chave: string) => dados.get(chave) ?? null,
      setItem: (chave: string, valor: string) => { dados.set(chave, valor); },
    };
  }

  it("grava e lê de volta o mesmo estado", () => {
    const armazenamento = memoria();
    const estado = marcarLicao(registrarNota(ESTADO_VAZIO, "java", "m1", 0.9), "java", "m1", true);

    expect(gravarEstado(armazenamento, estado)).toBe(true);
    expect(lerEstado(armazenamento)).toEqual(estado);
  });

  it("devolve vazio quando não há nada, não há armazenamento ou o texto está quebrado", () => {
    expect(lerEstado(memoria())).toEqual(ESTADO_VAZIO);
    expect(lerEstado(null)).toEqual(ESTADO_VAZIO);
    expect(lerEstado(memoria("{ quebrado"))).toEqual(ESTADO_VAZIO);
  });

  it("não quebra quando o armazenamento lança erro ou não existe", () => {
    const quebrado = { getItem: () => { throw new Error("bloqueado"); }, setItem: () => { throw new Error("cheio"); } };

    expect(lerEstado(quebrado)).toEqual(ESTADO_VAZIO);
    expect(gravarEstado(quebrado, ESTADO_VAZIO)).toBe(false);
    expect(gravarEstado(null, ESTADO_VAZIO)).toBe(false);
  });

  it("descarta o que não tem o formato esperado e mantém o que tem", () => {
    const estado = sanear({
      java: { licoes: ["m1", 7, null], notas: { m1: 0.5, m2: "alta", m3: 9, m4: -2 }, desafios: "nada" },
      python: "texto",
      ts: null,
    });

    expect(estado).toEqual({ java: { licoes: ["m1"], notas: { m1: 0.5, m3: 1, m4: 0 }, desafios: [] } });
    expect(sanear([])).toEqual(ESTADO_VAZIO);
    expect(sanear(null)).toEqual(ESTADO_VAZIO);
    expect(sanear("x")).toEqual(ESTADO_VAZIO);
    expect(sanear({ java: { licoes: [], notas: [], desafios: [] } })).toEqual({ java: { licoes: [], notas: {}, desafios: [] } });
  });
});
