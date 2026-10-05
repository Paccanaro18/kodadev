import { describe, expect, it } from "vitest";
import {
  checkpointsDaTrilha, itemPorSlug, itensDaTrilha, modulosDaTrilha, resumirTrilha, slugsDeTrilha, trilhaPorSlug,
  TRILHAS, vizinhosDoItem, type Questao,
} from "@/lib/trilhas";
import type { Bloco } from "@/lib/aulas/tipos";

const HOSTS_PERMITIDOS = [
  "dev.java", "docs.oracle.com", "www.typescriptlang.org", "developer.mozilla.org", "nodejs.org",
  "docs.python.org", "peps.python.org", "expressjs.com", "docs.aws.amazon.com", "aws.amazon.com", "modelcontextprotocol.io", "docs.anthropic.com", "platform.claude.com", "owasp.org", "fastapi.tiangolo.com", "docs.pydantic.dev", "zod.dev", "mypy.readthedocs.io", "docs.astral.sh", "typing.python.org",
];

function palavrasDe(blocos: Bloco[]): number {
  return blocos
    .flatMap((b) => (b.tipo === "codigo" ? [] : "texto" in b ? [b.texto] : "itens" in b ? b.itens : b.tipo === "tabela" ? b.linhas.flat() : []))
    .join(" ").split(/\s+/).length;
}

function validarQuestao(questao: Questao, onde: string) {
  expect(questao.enunciado.length, onde).toBeGreaterThan(15);
  expect(questao.opcoes.length, onde).toBeGreaterThanOrEqual(3);
  expect(new Set(questao.opcoes).size, `${onde}: opções repetidas`).toBe(questao.opcoes.length);
  expect(Number.isInteger(questao.correta) && questao.correta >= 0 && questao.correta < questao.opcoes.length, `${onde}: índice da resposta`).toBe(true);
  expect(questao.explicacao.length, onde).toBeGreaterThan(40);
}

describe("trilhas de linguagem", () => {
  it("tem uma trilha para cada linguagem, com slug único", () => {
    expect(slugsDeTrilha()).toEqual(["java", "typescript", "python", "aws-cloud-practitioner", "llm-mcp-mvp"]);
    for (const trilha of TRILHAS) expect(trilhaPorSlug(trilha.slug)).toBe(trilha);
    expect(trilhaPorSlug("cobol")).toBeUndefined();
  });

  it("tem slugs únicos dentro de cada trilha e ordem de estudo estável", () => {
    for (const trilha of TRILHAS) {
      const slugs = itensDaTrilha(trilha).map((i) => i.slug);
      expect(new Set(slugs).size, trilha.slug).toBe(slugs.length);
      for (const slug of slugs) expect(slug, slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("tem em cada trilha módulos, ao menos um checkpoint e o roteiro do que vem a seguir", () => {
    for (const trilha of TRILHAS) {
      expect(modulosDaTrilha(trilha).length, trilha.slug).toBeGreaterThanOrEqual(2);
      expect(checkpointsDaTrilha(trilha).length, trilha.slug).toBeGreaterThanOrEqual(1);
      expect(trilha.planejados.length, trilha.slug).toBeGreaterThanOrEqual(5);
    }
  });

  it("tem questões bem formadas em todos os módulos e checkpoints", () => {
    for (const trilha of TRILHAS) {
      for (const modulo of modulosDaTrilha(trilha)) {
        expect(modulo.questoes.length, modulo.slug).toBeGreaterThanOrEqual(7);
        modulo.questoes.forEach((q, i) => validarQuestao(q, `${trilha.slug}/${modulo.slug} #${i + 1}`));
      }
      for (const checkpoint of checkpointsDaTrilha(trilha)) {
        expect(checkpoint.questoes.length, checkpoint.slug).toBeGreaterThanOrEqual(8);
        expect(checkpoint.notaMinima).toBeGreaterThan(0);
        expect(checkpoint.notaMinima).toBeLessThanOrEqual(1);
        checkpoint.questoes.forEach((q, i) => validarQuestao(q, `${trilha.slug}/${checkpoint.slug} #${i + 1}`));
      }
    }
  });

  it("não deixa a resposta certa sempre na mesma posição", () => {
    for (const trilha of TRILHAS) {
      for (const item of itensDaTrilha(trilha)) {
        const posicoes = new Set(item.questoes.map((q) => q.correta));
        expect(posicoes.size, `${trilha.slug}/${item.slug}`).toBeGreaterThan(1);
      }
    }
  });

  it("faz cada checkpoint cobrir módulos que existem e vir depois deles", () => {
    for (const trilha of TRILHAS) {
      const slugs = itensDaTrilha(trilha).map((i) => i.slug);
      for (const checkpoint of checkpointsDaTrilha(trilha)) {
        expect(checkpoint.cobre.length).toBeGreaterThan(0);
        for (const coberto of checkpoint.cobre) {
          expect(itemPorSlug(trilha, coberto)?.tipo, `${checkpoint.slug} cobre ${coberto}`).toBe("modulo");
          expect(slugs.indexOf(coberto), coberto).toBeLessThan(slugs.indexOf(checkpoint.slug));
        }
      }
    }
  });

  it("tem lições aprofundadas, com objetivos, resumo, desafio com critérios e fontes confiáveis", () => {
    for (const trilha of TRILHAS) {
      for (const modulo of modulosDaTrilha(trilha)) {
        const nome = `${trilha.slug}/${modulo.slug}`;
        expect(palavrasDe(modulo.blocos), nome).toBeGreaterThan(1100);
        expect(modulo.blocos.filter((b) => b.tipo === "codigo").length, nome).toBeGreaterThanOrEqual(4);
        expect(modulo.objetivos.length, nome).toBeGreaterThanOrEqual(4);
        expect(modulo.pontosChave.length, nome).toBeGreaterThanOrEqual(4);
        expect(modulo.desafio.requisitos.length, nome).toBeGreaterThanOrEqual(4);
        expect(modulo.desafio.criterios.length, nome).toBeGreaterThanOrEqual(4);
        expect(modulo.desafio.enunciado.length, nome).toBeGreaterThan(60);
        expect(modulo.referencias?.length, nome).toBeGreaterThanOrEqual(2);
        for (const referencia of modulo.referencias ?? []) {
          const url = new URL(referencia.url);
          expect(url.protocol, referencia.url).toBe("https:");
          expect(HOSTS_PERMITIDOS, referencia.url).toContain(url.hostname);
        }
      }
    }
  });

  it("só usa nos códigos as linguagens que o leitor sabe mostrar", () => {
    for (const trilha of TRILHAS) {
      for (const modulo of modulosDaTrilha(trilha)) {
        for (const bloco of modulo.blocos) {
          if (bloco.tipo !== "codigo") continue;
          expect(["java", "typescript", "python", "bash", "text", "json", "sql", "html", "http"], modulo.slug).toContain(bloco.linguagem);
          expect(bloco.texto.trim().length, modulo.slug).toBeGreaterThan(3);
        }
      }
    }
  });

  it("monta o roteiro leve sem o conteúdo das lições", () => {
    const trilha = trilhaPorSlug("java")!;
    const resumo = resumirTrilha(trilha);
    const texto = JSON.stringify(resumo);

    expect(resumo.etapas.flatMap((e) => e.itens).map((i) => i.slug)).toEqual(itensDaTrilha(trilha).map((i) => i.slug));
    expect(texto).not.toContain("blocos");
    expect(texto).not.toContain("explicacao");
    expect(texto.length).toBeLessThan(8000);
    const itens = resumo.etapas.flatMap((e) => e.itens);
    const checkpoint = itens.find((i) => i.tipo === "checkpoint");
    expect(checkpoint?.notaMinima).toBeGreaterThan(0);
    expect(itens.find((i) => i.tipo === "modulo")?.notaMinima).toBeUndefined();
  });

  it("acha o item anterior e o seguinte na ordem da trilha", () => {
    const trilha = trilhaPorSlug("typescript")!;
    const itens = itensDaTrilha(trilha);

    expect(vizinhosDoItem(trilha, itens[0].slug)).toEqual({ anterior: null, proximo: itens[1] });
    expect(vizinhosDoItem(trilha, itens[1].slug)).toEqual({ anterior: itens[0], proximo: itens[2] });
    expect(vizinhosDoItem(trilha, itens[itens.length - 1].slug).proximo).toBeNull();
    expect(vizinhosDoItem(trilha, "nao-existe")).toEqual({ anterior: null, proximo: null });
    expect(itemPorSlug(trilha, "nao-existe")).toBeUndefined();
  });
});
