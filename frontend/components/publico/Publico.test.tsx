import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Documento from "./Documento";
import NavegacaoPublica from "./NavegacaoPublica";
import PaginaPublica from "./PaginaPublica";

const caminho = vi.hoisted(() => ({ atual: "/produto" }));
vi.mock("next/navigation", () => ({ usePathname: () => caminho.atual }));
vi.mock("@/lib/api", () => ({ buscarPerfil: vi.fn().mockResolvedValue(null) }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("NavegacaoPublica", () => {
  it("lista as cinco páginas e marca a atual", () => {
    caminho.atual = "/blog/como-a-koda-escreve-um-ticket";
    render(<NavegacaoPublica />);

    const menu = screen.getByRole("navigation", { name: "Principal" });
    expect(within(menu).getAllByRole("link").map((l) => l.textContent)).toEqual(["Produto", "Recursos", "Aprenda aqui", "Blog", "Ajuda"]);
    expect(within(menu).getByRole("link", { name: "Blog" })).toHaveAttribute("aria-current", "page");
    expect(within(menu).getByRole("link", { name: "Produto" })).not.toHaveAttribute("aria-current");
  });
});

describe("PaginaPublica", () => {
  it("mostra cabeçalho, conteúdo e rodapé com os documentos legais", () => {
    caminho.atual = "/ajuda";
    render(<PaginaPublica><p>Conteúdo</p></PaginaPublica>);

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Conteúdo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Termos de Uso" })).toHaveAttribute("href", "/termos");
    expect(screen.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute("href", "/privacidade");
    expect(screen.getByText(/Todos os direitos reservados/)).toBeInTheDocument();
  });
});

describe("Documento", () => {
  const secoes = [
    { titulo: "1. Primeira", paragrafos: ["Texto um."], itens: ["Item A", "Item B"] },
    { titulo: "2. Segunda", paragrafos: ["Texto dois."] },
  ];

  it("renderiza as seções com índice que aponta para cada uma", () => {
    render(<Documento titulo="Termos" introducao="Intro" secoes={secoes} />);

    const indice = screen.getByRole("navigation", { name: "Neste documento" });
    expect(within(indice).getByRole("link", { name: "2. Segunda" })).toHaveAttribute("href", "#secao-2");
    expect(screen.getByRole("heading", { level: 1, name: "Termos" })).toBeInTheDocument();
    expect(screen.getByText("Item B")).toBeInTheDocument();
    expect(screen.getByText(/Última atualização:/)).toBeInTheDocument();
    expect(screen.queryByText("Contato")).not.toBeInTheDocument();
  });

  it("sem e-mail configurado, avisa que o canal será divulgado", () => {
    render(<Documento titulo="Privacidade" introducao="Intro" secoes={secoes} comContato />);
    expect(screen.getByText(/será divulgado nesta página/)).toBeInTheDocument();
  });

  it("com e-mail configurado, mostra o endereço como link", async () => {
    vi.stubEnv("NEXT_PUBLIC_EMAIL_DE_CONTATO", "contato@exemplo.com");
    vi.resetModules();
    const { default: DocumentoComContato } = await import("./Documento");

    render(<DocumentoComContato titulo="Privacidade" introducao="Intro" secoes={secoes} comContato />);

    expect(screen.getByRole("link", { name: "contato@exemplo.com" })).toHaveAttribute("href", "mailto:contato@exemplo.com");
  });
});
