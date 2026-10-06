import { describe, expect, it } from "vitest";
import type { ResumoDeSeguranca } from "@/lib/api";
import { calcularInsignias, proximasInsignias, resumirInsignias, type Insignia } from "./insignias";
import { LABORATORIOS } from "./redes/laboratorios";
import { itensDaTrilha, modulosDaTrilha, trilhaPorSlug } from "./trilhas";
import type { EstadoDeEstudo } from "./progressoDeEstudo";

const SEM_DADOS = { estudo: {} as EstadoDeEstudo, seguranca: null, ticketsConcluidos: null };

function achar(insignias: Insignia[], id: string): Insignia {
  const encontrada = insignias.find((i) => i.id === id);
  if (!encontrada) throw new Error(`insígnia ${id} não existe`);
  return encontrada;
}

function desafio(slug: string, categoria: ResumoDeSeguranca["categoria"], resolvido: boolean, pontos = 100): ResumoDeSeguranca {
  return { slug, titulo: slug, categoria, dificuldade: "FACIL", pontos, resumo: "x", resolvido };
}

describe("insígnias", () => {
  it("tem identificadores únicos e nenhuma conquista para quem ainda não fez nada", () => {
    const todas = calcularInsignias(SEM_DADOS);
    expect(new Set(todas.map((i) => i.id)).size).toBe(todas.length);
    expect(todas.some((i) => i.conquistada)).toBe(false);
    expect(todas.every((i) => i.atual === 0 && i.total > 0)).toBe(true);
    expect(resumirInsignias(todas)).toMatchObject({ conquistadas: 0, total: todas.length });
  });

  it("conta lições lidas só dos módulos que existem", () => {
    const java = modulosDaTrilha(trilhaPorSlug("java")!).map((m) => m.slug);
    const estudo: EstadoDeEstudo = { java: { licoes: [java[0], "modulo-que-nao-existe"], notas: {}, desafios: [] } };
    const todas = calcularInsignias({ ...SEM_DADOS, estudo });
    expect(achar(todas, "primeira-licao").conquistada).toBe(true);
    expect(achar(todas, "dez-licoes").atual).toBe(1);
    expect(achar(todas, "tres-trilhas").atual).toBe(1);
  });

  it("reconhece nota máxima, checkpoint aprovado e três trilhas iniciadas", () => {
    const estudo: EstadoDeEstudo = {};
    for (const slug of ["java", "python", "typescript"]) {
      const trilha = trilhaPorSlug(slug)!;
      estudo[slug] = { licoes: [modulosDaTrilha(trilha)[0].slug], notas: {}, desafios: [] };
    }
    const java = trilhaPorSlug("java")!;
    const checkpoint = itensDaTrilha(java).find((i) => i.tipo === "checkpoint")!;
    estudo.java.notas[modulosDaTrilha(java)[0].slug] = 1;
    estudo.java.notas[checkpoint.slug] = 0.9;
    const todas = calcularInsignias({ ...SEM_DADOS, estudo });
    expect(achar(todas, "nota-maxima").conquistada).toBe(true);
    expect(achar(todas, "checkpoint-aprovado").conquistada).toBe(true);
    expect(achar(todas, "tres-trilhas").conquistada).toBe(true);
  });

  it("dá a insígnia da trilha só quando todos os módulos e checkpoints estão concluídos", () => {
    const trilha = trilhaPorSlug("redes-de-computadores")!;
    const itens = itensDaTrilha(trilha);
    const parcial: EstadoDeEstudo = {
      "redes-de-computadores": {
        licoes: modulosDaTrilha(trilha).map((m) => m.slug), notas: Object.fromEntries(itens.slice(0, 2).map((i) => [i.slug, 1])), desafios: [],
      },
    };
    const emAndamento = achar(calcularInsignias({ ...SEM_DADOS, estudo: parcial }), "trilha-redes-de-computadores");
    expect(emAndamento.conquistada).toBe(false);
    expect(emAndamento.atual).toBeGreaterThan(0);

    const completo: EstadoDeEstudo = {
      "redes-de-computadores": { licoes: modulosDaTrilha(trilha).map((m) => m.slug), notas: Object.fromEntries(itens.map((i) => [i.slug, 1])), desafios: [] },
    };
    expect(achar(calcularInsignias({ ...SEM_DADOS, estudo: completo }), "trilha-redes-de-computadores").conquistada).toBe(true);
  });

  it("conta os laboratórios de redes concluídos, e ignora slugs desconhecidos", () => {
    const estudo: EstadoDeEstudo = { redes: { licoes: [], notas: {}, desafios: ["primeiro-cabo", "vlan-trocada", "lab-que-nao-existe"] } };
    const todas = calcularInsignias({ ...SEM_DADOS, estudo });
    expect(achar(todas, "redes-primeiro-cabo").conquistada).toBe(true);
    expect(achar(todas, "redes-tres-laboratorios").atual).toBe(2);
    expect(achar(todas, "redes-todos").total).toBe(LABORATORIOS.length);

    const tudo: EstadoDeEstudo = { redes: { licoes: [], notas: {}, desafios: LABORATORIOS.map((l) => l.slug) } };
    const completas = calcularInsignias({ ...SEM_DADOS, estudo: tudo });
    for (const id of ["redes-todas-as-aulas", "redes-consertador", "redes-todos"]) expect(achar(completas, id).conquistada, id).toBe(true);
  });

  it("calcula as insígnias de segurança por quantidade, pontos e categoria", () => {
    const lista = [
      desafio("a", "LOGS", true, 500), desafio("b", "LOGS", true, 600), desafio("c", "WEB", true), desafio("d", "WEB", false),
      desafio("e", "CRIPTOGRAFIA", false), desafio("f", "SEGREDOS", false),
    ];
    const todas = calcularInsignias({ ...SEM_DADOS, seguranca: lista });
    expect(achar(todas, "seguranca-primeira-flag").conquistada).toBe(true);
    expect(achar(todas, "seguranca-cinco-flags").atual).toBe(3);
    expect(achar(todas, "seguranca-mil-pontos").conquistada).toBe(true);
    expect(achar(todas, "seguranca-logs").conquistada).toBe(true);
    expect(achar(todas, "seguranca-web")).toMatchObject({ atual: 1, total: 2, conquistada: false });
    expect(achar(todas, "seguranca-todos")).toMatchObject({ atual: 3, total: 6 });
  });

  it("mostra tickets concluídos e limita o progresso ao total", () => {
    const todas = calcularInsignias({ ...SEM_DADOS, ticketsConcluidos: 7 });
    expect(achar(todas, "tickets-primeiro").conquistada).toBe(true);
    expect(achar(todas, "tickets-cinco")).toMatchObject({ atual: 5, conquistada: true });
    expect(achar(todas, "tickets-vinte")).toMatchObject({ atual: 7, conquistada: false });
  });

  it("resume por nível e sugere as mais próximas de serem conquistadas", () => {
    const todas = calcularInsignias({ ...SEM_DADOS, ticketsConcluidos: 4 });
    expect(resumirInsignias(todas).porNivel).toEqual({ bronze: 1, prata: 0, ouro: 0 });
    const proximas = proximasInsignias(todas, 2);
    expect(proximas.map((i) => i.id)).toEqual(["tickets-cinco", "tickets-vinte"]);
  });
});
