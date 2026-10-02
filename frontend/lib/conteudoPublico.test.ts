import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DOCUMENTOS_LEGAIS, PAGINAS_PUBLICAS } from "@/lib/contato";
import {
  ARTIGOS, PERGUNTAS_FREQUENTES, POLITICA_DE_PRIVACIDADE, RECURSOS, TERMOS_DE_USO, type SecaoDeDocumento,
} from "@/lib/conteudoPublico";

const textoDe = (secoes: SecaoDeDocumento[]) => secoes.flatMap((s) => [s.titulo, ...s.paragrafos, ...(s.itens ?? [])]).join(" ");

describe("páginas públicas", () => {
  it("tem uma página para cada link do menu e do rodapé", () => {
    for (const { href } of [...PAGINAS_PUBLICAS, ...DOCUMENTOS_LEGAIS]) {
      expect(existsSync(join(process.cwd(), "app", "(publico)", href, "page.tsx")), href).toBe(true);
    }
  });

  it("tem página de leitura para os artigos do blog", () => {
    expect(existsSync(join(process.cwd(), "app", "(publico)", "blog", "[slug]", "page.tsx"))).toBe(true);
  });
});

describe("conteúdo", () => {
  it("numera as seções dos documentos legais em sequência", () => {
    for (const secoes of [TERMOS_DE_USO, POLITICA_DE_PRIVACIDADE]) {
      secoes.forEach((secao, i) => expect(secao.titulo.startsWith(`${i + 1}. `), secao.titulo).toBe(true));
    }
  });

  it("não deixa texto provisório nos documentos", () => {
    const tudo = textoDe(TERMOS_DE_USO) + textoDe(POLITICA_DE_PRIVACIDADE);
    expect(tudo).not.toMatch(/lorem|xxx|\[.*preencher.*\]/i);
    expect(tudo).not.toMatch(/TODO/);
  });

  it("diz na política só o que o produto faz: login com read:user, token criptografado e IA com resumo", () => {
    const politica = textoDe(POLITICA_DE_PRIVACIDADE);
    expect(politica).toContain("permissão de ler o seu perfil público");
    expect(politica).toContain("criptografado");
    expect(politica).toContain("Não enviamos o código-fonte completo");
    expect(politica).toContain("ainda não tem um botão de exclusão de conta");
  });

  it("usa slugs únicos e legíveis nos artigos", () => {
    const slugs = ARTIGOS.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    for (const artigo of ARTIGOS) expect(artigo.paragrafos.length).toBeGreaterThan(2);
  });

  it("tem perguntas respondidas em todos os grupos da ajuda", () => {
    expect(PERGUNTAS_FREQUENTES.length).toBeGreaterThan(0);
    for (const grupo of PERGUNTAS_FREQUENTES) {
      expect(grupo.perguntas.length).toBeGreaterThan(0);
      for (const item of grupo.perguntas) expect(item.resposta.length).toBeGreaterThan(20);
    }
  });

  it("não repete título de recurso", () => {
    const titulos = RECURSOS.map((r) => r.titulo);
    expect(new Set(titulos).size).toBe(titulos.length);
  });
});
