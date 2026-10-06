import { describe, expect, it } from "vitest";
import { EVIDENCIAS, evidenciaPorId, filtrarIdeias, IDEIAS, ideiaPorSlug, NIVEIS_DE_PROJETO, ROTULO_DA_AREA } from "./index";
import { itemPorSlug, trilhaPorSlug } from "@/lib/trilhas";

const ROTAS_DO_KODA = ["/ferramentas", "/seguranca", "/redes"];

function ligacaoValida(href: string): boolean {
  if (ROTAS_DO_KODA.includes(href)) return true;
  const partes = href.split("/").filter(Boolean);
  if (partes[0] !== "aprenda") return false;
  const trilha = trilhaPorSlug(partes[1] ?? "");
  if (!trilha) return false;
  return partes.length === 2 || itemPorSlug(trilha, partes[2]) !== undefined;
}

describe("ideias de projetos", () => {
  it("tem identificadores únicos e válidos", () => {
    const slugs = IDEIAS.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(ideiaPorSlug("readme-que-funciona")?.nivel).toBe("Iniciante");
    expect(ideiaPorSlug("nao-existe")).toBeUndefined();
  });

  it("cobre os quatro níveis e todas as áreas, em ordem crescente de nível", () => {
    for (const nivel of NIVEIS_DE_PROJETO) expect(IDEIAS.some((i) => i.nivel === nivel), nivel).toBe(true);
    for (const area of Object.keys(ROTULO_DA_AREA)) expect(IDEIAS.some((i) => i.area === area), area).toBe(true);
    const posicoes = IDEIAS.map((i) => NIVEIS_DE_PROJETO.indexOf(i.nivel));
    expect(posicoes).toEqual([...posicoes].sort((a, b) => a - b));
  });

  it("tem em cada ideia o escopo, o diferencial, o que publicar e como ser visto", () => {
    for (const ideia of IDEIAS) {
      const onde = ideia.slug;
      expect(ideia.titulo.length, onde).toBeGreaterThan(10);
      expect(ideia.gancho.length, onde).toBeGreaterThan(40);
      expect(ideia.problema.length, onde).toBeGreaterThan(200);
      expect(ideia.sinalNaCarreira.length, onde).toBeGreaterThan(150);
      expect(ideia.construir.length, onde).toBeGreaterThanOrEqual(3);
      expect(ideia.diferencial.length, onde).toBeGreaterThanOrEqual(3);
      expect(ideia.entregaveis.length, onde).toBeGreaterThanOrEqual(2);
      expect(ideia.comoSerVisto.length, onde).toBeGreaterThanOrEqual(3);
      expect(ideia.habilidades.length, onde).toBeGreaterThanOrEqual(3);
      expect(ideia.tecnologias.length, onde).toBeGreaterThanOrEqual(1);
      expect(ideia.estudarNoKoda.length, onde).toBeGreaterThanOrEqual(1);
    }
  });

  it("sempre aponta evidências que existem, e ao menos duas por ideia", () => {
    for (const ideia of IDEIAS) {
      expect(ideia.evidencias.length, ideia.slug).toBeGreaterThanOrEqual(2);
      expect(new Set(ideia.evidencias).size, ideia.slug).toBe(ideia.evidencias.length);
      for (const id of ideia.evidencias) expect(evidenciaPorId(id), `${ideia.slug} -> ${id}`).toBeDefined();
    }
  });

  it("só liga a conteúdo do Koda que existe", () => {
    for (const ideia of IDEIAS) {
      for (const ligacao of ideia.estudarNoKoda) expect(ligacaoValida(ligacao.href), `${ideia.slug}: ${ligacao.href}`).toBe(true);
    }
  });

  it("explica o que cada evidência diz e de onde veio, sem esconder o que é só opinião", () => {
    const ids = EVIDENCIAS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const evidencia of EVIDENCIAS) {
      expect(new URL(evidencia.url).protocol, evidencia.id).toBe("https:");
      expect(evidencia.achado.length, evidencia.id).toBeGreaterThan(150);
      expect(["pesquisa", "relatorio", "orientacao"]).toContain(evidencia.forca);
      expect(evidencia.ano, evidencia.id).toBeGreaterThanOrEqual(2021);
    }
    expect(EVIDENCIAS.some((e) => e.forca === "pesquisa")).toBe(true);
    expect(EVIDENCIAS.some((e) => e.forca === "orientacao")).toBe(true);
    for (const e of EVIDENCIAS.filter((x) => x.forca === "orientacao")) {
      expect(e.achado, e.id).toMatch(/orientação|opinião|não é pesquisa/i);
    }
  });

  it("não usa a evidência fraca como estatística", () => {
    const fraca = evidenciaPorId("guias-de-portfolio")!;
    expect(fraca.achado).toContain("não têm fonte confiável");
    for (const ideia of IDEIAS) expect(ideia.sinalNaCarreira, ideia.slug).not.toMatch(/\b84%/);
  });

  it("filtra por nível e por área", () => {
    expect(filtrarIdeias({ nivel: null, area: null })).toHaveLength(IDEIAS.length);
    expect(filtrarIdeias({ nivel: "Avançado", area: null }).every((i) => i.nivel === "Avançado")).toBe(true);
    expect(filtrarIdeias({ nivel: null, area: "seguranca" }).every((i) => i.area === "seguranca")).toBe(true);
    expect(filtrarIdeias({ nivel: "Iniciante", area: "dados-ia" })).toEqual([]);
  });
});
