import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AULAS, aulaPorSlug, aulasDaTrilha, ORDEM_DAS_TRILHAS, proximasLeituras, TRILHAS } from "@/lib/conteudoAprenda";

describe("aulas", () => {
  it("tem slugs únicos e legíveis", () => {
    const slugs = AULAS.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("tem ao menos uma aula em cada trilha", () => {
    expect(Object.keys(TRILHAS).sort()).toEqual([...ORDEM_DAS_TRILHAS].sort());
    for (const trilha of ORDEM_DAS_TRILHAS) expect(aulasDaTrilha(trilha).length, trilha).toBeGreaterThan(0);
  });

  it("tem conteúdo de verdade em cada aula", () => {
    for (const aula of AULAS) {
      expect(aula.titulo.length, aula.slug).toBeGreaterThan(10);
      expect(aula.resumo.length, aula.slug).toBeGreaterThan(30);
      expect(aula.blocos.filter((b) => b.tipo === "h").length, aula.slug).toBeGreaterThan(1);
      expect(aula.blocos.some((b) => b.tipo === "p"), aula.slug).toBe(true);
    }
  });

  it("não deixa bloco de código vazio e nomeia a linguagem de cada um", () => {
    for (const aula of AULAS) {
      for (const bloco of aula.blocos) {
        if (bloco.tipo === "codigo") {
          expect(bloco.texto.trim().length, aula.slug).toBeGreaterThan(5);
          expect(["java", "typescript", "python", "bash"], aula.slug).toContain(bloco.linguagem);
        }
      }
    }
  });

  it("não deixa texto provisório", () => {
    const tudo = JSON.stringify(AULAS);
    expect(/lorem ipsum|xxx/i.test(tudo)).toBe(false);
    expect(/\bTODO\b/.test(tudo)).toBe(false);
  });

  it("busca por slug e devolve nada para o que não existe", () => {
    expect(aulaPorSlug(AULAS[0].slug)).toBe(AULAS[0]);
    expect(aulaPorSlug("nao-existe")).toBeUndefined();
  });

  it("devolve todas sem filtro e só as da trilha com filtro", () => {
    expect(aulasDaTrilha(undefined)).toHaveLength(AULAS.length);
    expect(aulasDaTrilha("java").every((a) => a.trilha === "java")).toBe(true);
  });

  it("sugere leituras da mesma trilha primeiro, sem repetir a atual", () => {
    const java = AULAS.find((a) => a.trilha === "java")!;
    const proximas = proximasLeituras(java);

    expect(proximas).toHaveLength(2);
    expect(proximas.map((a) => a.slug)).not.toContain(java.slug);
    expect(proximas[0].trilha).toBe("java");
    expect(proximasLeituras(java, 1)).toHaveLength(1);
  });

  it("tem a página de leitura das aulas", () => {
    expect(existsSync(join(process.cwd(), "app", "(publico)", "aprenda", "[slug]", "page.tsx"))).toBe(true);
  });
});
