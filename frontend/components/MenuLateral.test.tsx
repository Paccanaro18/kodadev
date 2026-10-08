import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MenuLateral from "./MenuLateral";
import { CHAVE_DO_MENU, grupoAtivo, itemAtivo, lerGruposAbertos, MENU } from "@/lib/menu";

beforeEach(() => window.localStorage.clear());

describe("regras do menu", () => {
  it("marca um só item por rota, pelo prefixo mais específico", () => {
    expect(itemAtivo("/desafios")?.rotulo).toBe("Meus desafios");
    expect(itemAtivo("/desafio/123")?.rotulo).toBe("Meus desafios");
    expect(itemAtivo("/projeto")?.rotulo).toBe("Meus desafios");
    expect(itemAtivo("/repositorios/adicionar")?.rotulo).toBe("Repositórios");
    expect(itemAtivo("/aprenda/redes-de-computadores/dhcp-e-dns")?.rotulo).toBe("Aprenda aqui");
    expect(itemAtivo("/redes/vlan-trocada")?.rotulo).toBe("Redes");
    expect(itemAtivo("/planos")?.rotulo).toBe("Planos");
    expect(itemAtivo("/dashboard")?.rotulo).toBe("Home");
    expect(itemAtivo("/rota-desconhecida")).toBeNull();
  });

  it("diz qual grupo contém a rota", () => {
    expect(grupoAtivo("/seguranca/logs-um")).toBe("desafios");
    expect(grupoAtivo("/ferramentas")).toBe("aprender");
    expect(grupoAtivo("/conquistas")).toBe("comunidade");
    expect(grupoAtivo("/dashboard")).toBeNull();
    expect(grupoAtivo("/configuracoes")).toBeNull();
  });

  it("todo link do menu aparece uma única vez", () => {
    const hrefs = MENU.flatMap((e) => (e.tipo === "link" ? [e.item.href] : e.itens.map((i) => i.href)));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("lê só ids de grupos válidos do armazenamento", () => {
    expect(lerGruposAbertos(null)).toEqual([]);
    expect(lerGruposAbertos("lixo")).toEqual([]);
    expect(lerGruposAbertos('{"a":1}')).toEqual([]);
    expect(lerGruposAbertos('["desafios","inexistente",3]')).toEqual(["desafios"]);
  });
});

describe("MenuLateral", () => {
  it("abre sozinho o grupo da página atual e marca o item", () => {
    render(<MenuLateral caminho="/seguranca" aoNavegar={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Desafios" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Aprender" })).toHaveAttribute("aria-expanded", "false");
    const submenu = document.getElementById("submenu-desafios")!;
    expect(within(submenu).getByRole("link", { name: "Segurança" })).toHaveAttribute("aria-current", "page");
    expect(within(submenu).getByRole("link", { name: "Repositórios" })).toHaveAttribute("href", "/repositorios/adicionar");
  });

  it("expande e recolhe pela seta, e lembra a escolha", async () => {
    const usuario = userEvent.setup();
    render(<MenuLateral caminho="/dashboard" aoNavegar={vi.fn()} />);
    const aprender = screen.getByRole("button", { name: "Aprender" });
    expect(aprender).toHaveAttribute("aria-expanded", "false");

    await usuario.click(aprender);
    expect(aprender).toHaveAttribute("aria-expanded", "true");
    expect(within(document.getElementById("submenu-aprender")!).getByRole("link", { name: "Ferramentas" })).toHaveAttribute("href", "/ferramentas");
    expect(JSON.parse(window.localStorage.getItem(CHAVE_DO_MENU)!)).toEqual(["aprender"]);

    await usuario.click(aprender);
    expect(aprender).toHaveAttribute("aria-expanded", "false");
    expect(JSON.parse(window.localStorage.getItem(CHAVE_DO_MENU)!)).toEqual([]);
  });

  it("começa com os grupos que a pessoa deixou abertos", () => {
    window.localStorage.setItem(CHAVE_DO_MENU, JSON.stringify(["comunidade"]));
    render(<MenuLateral caminho="/dashboard" aoNavegar={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Comunidade" })).toHaveAttribute("aria-expanded", "true");
  });

  it("mantém Planos como link direto e fora dos grupos", () => {
    render(<MenuLateral caminho="/planos" aoNavegar={vi.fn()} />);
    expect(screen.getByRole("link", { name: "Planos" })).toHaveAttribute("aria-current", "page");
    expect(grupoAtivo("/planos")).toBeNull();
  });

  it("mantém Home e Configurações como links diretos e avisa ao navegar", async () => {
    const aoNavegar = vi.fn();
    const usuario = userEvent.setup();
    render(<MenuLateral caminho="/dashboard" aoNavegar={aoNavegar} />);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    await usuario.click(screen.getByRole("link", { name: "Configurações" }));
    expect(aoNavegar).toHaveBeenCalled();
  });
});
