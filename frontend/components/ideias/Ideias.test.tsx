import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DetalheDaIdeia from "./DetalheDaIdeia";
import ListaDeIdeias from "./ListaDeIdeias";
import { reiniciarEstudoParaTestes } from "@/lib/estudoStore";
import { EVIDENCIAS, IDEIAS } from "@/lib/ideias";
import { CHAVE_DO_ESTUDO } from "@/lib/progressoDeEstudo";

vi.mock("../AppShell", () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock("@/lib/api", async (importarOriginal) => {
  const original = await importarOriginal<typeof import("@/lib/api")>();
  return { ...original, buscarPerfil: vi.fn().mockResolvedValue(null) };
});

beforeEach(() => {
  window.localStorage.clear();
  reiniciarEstudoParaTestes();
});

describe("ListaDeIdeias", () => {
  it("convida quem não tem projeto e mostra todas as ideias com link", () => {
    render(<ListaDeIdeias />);
    expect(screen.getByRole("heading", { name: "Não tem um projeto ainda? Ache ideias aqui" })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${IDEIAS.length} ideias`))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /O README que ninguém testou/ })).toHaveAttribute("href", "/ideias/readme-que-funciona");
  });

  it("explica a pesquisa, com fontes marcadas pela força, e admite o limite", async () => {
    render(<ListaDeIdeias />);
    const usuario = userEvent.setup();
    await usuario.click(screen.getByText(/Como escolhemos estas ideias/));
    expect(screen.getByText(/Não existe estudo que prove/)).toBeInTheDocument();
    const fontes = screen.getByRole("list", { name: "Fontes da pesquisa" });
    expect(within(fontes).getAllByRole("link")).toHaveLength(EVIDENCIAS.length);
    expect(within(fontes).getAllByText("Orientação ou opinião").length).toBeGreaterThan(0);
    expect(within(fontes).getAllByText("Pesquisa com método").length).toBeGreaterThan(0);
  });

  it("filtra por nível e por área e avisa quando não há nada", async () => {
    render(<ListaDeIdeias />);
    const usuario = userEvent.setup();
    await usuario.click(within(screen.getByRole("group", { name: "Filtrar por nível" })).getByRole("button", { name: "Avançado" }));
    expect(screen.queryByRole("link", { name: /O README que ninguém testou/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Migração de banco sem downtime/ })).toBeInTheDocument();

    await usuario.click(within(screen.getByRole("group", { name: "Filtrar por nível" })).getByRole("button", { name: "Iniciante" }));
    await usuario.click(within(screen.getByRole("group", { name: "Filtrar por área" })).getByRole("button", { name: "Dados e IA" }));
    expect(screen.getByText("Nenhuma ideia com esses filtros ainda.")).toBeInTheDocument();
  });

  it("marca as ideias que a pessoa já concluiu", () => {
    window.localStorage.setItem(CHAVE_DO_ESTUDO, JSON.stringify({ ideias: { licoes: [], notas: {}, desafios: ["readme-que-funciona"] } }));
    render(<ListaDeIdeias />);
    expect(screen.getAllByLabelText("Concluída")).toHaveLength(1);
    expect(screen.getByText(/1 concluídas por você/)).toBeInTheDocument();
  });
});

describe("DetalheDaIdeia", () => {
  it("mostra o escopo, o que publicar, como ser visto, o sinal na carreira e as fontes", () => {
    render(<DetalheDaIdeia slug="limitador-de-taxa-quatro-algoritmos" />);
    expect(screen.getByRole("heading", { name: /Limitador de taxa/, level: 1 })).toBeInTheDocument();
    for (const titulo of ["O problema real por trás", "O que construir (escopo mínimo)", "O que publicar", "Como fazer o projeto ser visto", "O que isso sinaliza na carreira"]) {
      expect(screen.getByRole("heading", { name: titulo })).toBeInTheDocument();
    }
    const fontes = screen.getByRole("list", { name: "Fontes" });
    expect(within(fontes).getAllByRole("link").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("link", { name: "Assíncrono em Node" })).toHaveAttribute("href", "/aprenda/typescript/assincrono-em-node");
  });

  it("mostra o cuidado quando a ideia exige", () => {
    render(<DetalheDaIdeia slug="modelo-de-ameacas-e-teste-de-intrusao" />);
    expect(screen.getByRole("note")).toHaveTextContent("Acessar sistemas de terceiros sem permissão é crime");
  });

  it("marca e desmarca como concluída e salva o progresso", async () => {
    render(<DetalheDaIdeia slug="readme-que-funciona" />);
    const usuario = userEvent.setup();
    const botao = await screen.findByRole("button", { name: "Marcar como concluído" });
    await usuario.click(botao);
    expect(screen.getByRole("button", { name: /Concluído \(clique para desfazer\)/ })).toHaveAttribute("aria-pressed", "true");
    expect(JSON.parse(window.localStorage.getItem(CHAVE_DO_ESTUDO)!).ideias.desafios).toContain("readme-que-funciona");

    await usuario.click(screen.getByRole("button", { name: /Concluído/ }));
    expect(screen.getByRole("button", { name: "Marcar como concluído" })).toHaveAttribute("aria-pressed", "false");
  });

  it("avisa quando a ideia não existe", () => {
    render(<DetalheDaIdeia slug="nao-existe" />);
    expect(screen.getByText("Ideia não encontrada.")).toBeInTheDocument();
  });
});
