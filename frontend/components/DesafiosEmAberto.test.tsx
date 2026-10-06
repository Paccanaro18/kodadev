import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import DesafiosEmAberto from "./DesafiosEmAberto";
import type { ItemHistorico } from "@/lib/api";
import { useDesafiosEmAberto } from "@/lib/useDesafiosEmAberto";

vi.mock("./AppShell", () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock("@/lib/useDesafiosEmAberto", () => ({ useDesafiosEmAberto: vi.fn() }));

const usar = vi.mocked(useDesafiosEmAberto);

function item(extra: Partial<ItemHistorico>): ItemHistorico {
  return {
    id: "1", analiseId: "a", repositorio: "api", numero: 1, codigo: "DEV-001", tipo: "FEATURE",
    statusGeracao: "PRONTO", statusProgresso: "NAO_INICIADO", titulo: "Adicionar paginação", dicasUsadas: 0,
    criadoEm: new Date().toISOString(), finalizadoEm: null, ...extra,
  };
}

function exibir(itens: ItemHistorico[] | null, erro: string | null = null, tentarDeNovo = vi.fn()) {
  usar.mockReturnValue({ itens, erro, tentarDeNovo });
  return render(<DesafiosEmAberto />);
}

describe("DesafiosEmAberto", () => {
  it("mostra os desafios em aberto agrupados", () => {
    exibir([
      item({ id: "1", codigo: "DEV-001", titulo: "Primeiro", statusProgresso: "EM_ANDAMENTO", dicasUsadas: 2 }),
      item({ id: "2", codigo: "DEV-002", titulo: "Segundo" }),
      item({ id: "3", codigo: "DEV-003", titulo: null, statusGeracao: "PENDENTE" }),
    ]);

    expect(screen.getByText("3 desafios em aberto, de todos os seus projetos.")).toBeInTheDocument();
    expect(screen.getByText("Em andamento (1)")).toBeInTheDocument();
    expect(screen.getByText("Para começar (1)")).toBeInTheDocument();
    expect(screen.getByText("Sendo gerados (1)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Primeiro/ })).toHaveAttribute("href", "/desafio/1");
    expect(screen.getByRole("link", { name: /Gerando o ticket/ })).toHaveAttribute("href", "/desafio/gerando?desafio=3");
    expect(screen.getByTitle("Dicas usadas")).toHaveTextContent("2");
  });

  it("usa o singular quando há um só", () => {
    exibir([item({})]);
    expect(screen.getByText("1 desafio em aberto, de todos os seus projetos.")).toBeInTheDocument();
  });

  it("filtra por projeto quando há mais de um", async () => {
    exibir([
      item({ id: "1", titulo: "Do alfa", repositorio: "alfa" }),
      item({ id: "2", titulo: "Do beta", repositorio: "beta" }),
    ]);
    const usuario = userEvent.setup();
    const filtros = screen.getByRole("group", { name: "Filtrar por projeto" });

    await usuario.click(within(filtros).getByRole("button", { name: "beta" }));

    expect(screen.queryByText("Do alfa")).not.toBeInTheDocument();
    expect(screen.getByText("Do beta")).toBeInTheDocument();

    await usuario.click(within(filtros).getByRole("button", { name: "Todos os projetos" }));
    expect(screen.getByText("Do alfa")).toBeInTheDocument();
  });

  it("não mostra filtro com um projeto só", () => {
    exibir([item({})]);
    expect(screen.queryByRole("group", { name: "Filtrar por projeto" })).not.toBeInTheDocument();
  });

  it("explica quando não há desafio em aberto", () => {
    exibir([]);
    expect(screen.getByText("Você não tem desafios em aberto.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Desafios" })).toHaveAttribute("href", "/desafios");
  });

  it("mostra o carregamento enquanto busca", () => {
    const { container } = exibir(null);
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("mostra o erro e deixa tentar de novo", async () => {
    const tentarDeNovo = vi.fn();
    exibir(null, "Falhou ao carregar", tentarDeNovo);

    expect(screen.getByRole("alert")).toHaveTextContent("Falhou ao carregar");
    await userEvent.setup().click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(tentarDeNovo).toHaveBeenCalled();
  });
});
