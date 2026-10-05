import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AULAS, aulaPorSlug, aulasDaTrilha, idDoTitulo, indiceDaAula, ORDEM_DAS_TRILHAS, proximasLeituras, TRILHAS } from "@/lib/conteudoAprenda";

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
          expect(["java", "typescript", "python", "bash", "sql", "html", "http", "json"], aula.slug).toContain(bloco.linguagem);
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
    expect(existsSync(join(process.cwd(), "app", "(publico)", "aprenda", "temas", "[slug]", "page.tsx"))).toBe(true);
  });

  it("gera identificadores de subtítulo legíveis", () => {
    expect(idDoTitulo("O caminho de uma requisição")).toBe("o-caminho-de-uma-requisicao");
    expect(idDoTitulo("  CSRF: o navegador (sem querer)!  ")).toBe("csrf-o-navegador-sem-querer");
  });

  it("monta o índice só com os subtítulos de nível 2, sem repetir identificador", () => {
    for (const aula of AULAS) {
      const indice = indiceDaAula(aula);
      const ids = indice.map((item) => item.id);
      expect(new Set(ids).size, aula.slug).toBe(ids.length);
      expect(indice.length, aula.slug).toBe(aula.blocos.filter((b) => b.tipo === "h").length);
    }
  });
});

describe("trilha de segurança", () => {
  const seguranca = aulasDaTrilha("seguranca");

  it("tem os artigos aprofundados, com pontos-chave, exercícios e referências", () => {
    expect(seguranca.length).toBeGreaterThanOrEqual(5);
    for (const aula of seguranca) {
      expect(aula.pontosChave?.length, aula.slug).toBeGreaterThanOrEqual(4);
      expect(aula.exercicios?.length, aula.slug).toBeGreaterThanOrEqual(4);
      expect(aula.referencias?.length, aula.slug).toBeGreaterThanOrEqual(3);
      expect(aula.preRequisitos?.length, aula.slug).toBeGreaterThan(0);
    }
  });

  it("é longa de verdade: ao menos 1.500 palavras e vários trechos de código", () => {
    for (const aula of seguranca) {
      const palavras = aula.blocos
        .flatMap((b) => ("texto" in b && b.tipo !== "codigo" ? [b.texto] : "itens" in b ? b.itens : []))
        .join(" ").split(/\s+/).length;
      expect(palavras, aula.slug).toBeGreaterThan(1500);
      expect(aula.blocos.filter((b) => b.tipo === "codigo").length, aula.slug).toBeGreaterThanOrEqual(2);
    }
  });

  it("só aponta para fontes seguras e conhecidas", () => {
    for (const aula of seguranca) {
      for (const referencia of aula.referencias ?? []) {
        const url = new URL(referencia.url);
        expect(url.protocol, referencia.url).toBe("https:");
        expect(["owasp.org", "cheatsheetseries.owasp.org", "developer.mozilla.org", "pages.nist.gov", "docs.github.com"], referencia.url)
          .toContain(url.hostname);
      }
    }
  });

  it("não deixa exemplos de segredo reais nos códigos", () => {
    const tudo = JSON.stringify(seguranca);
    expect(/gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,}/.test(tudo)).toBe(false);
  });
});
