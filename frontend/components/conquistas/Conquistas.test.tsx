import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Conquistas from "./Conquistas";
import * as api from "@/lib/api";
import { reiniciarEstudoParaTestes } from "@/lib/estudoStore";
import type { CatalogoDeInsignias } from "@/lib/insignias";
import { CHAVE_DO_ESTUDO } from "@/lib/progressoDeEstudo";
import { IDEIAS } from "@/lib/ideias";
import { AULAS_DE_REDES, DESAFIOS_DE_REDES } from "@/lib/redes/laboratorios";
import { resumirTrilha, TRILHAS } from "@/lib/trilhas";

vi.mock("../AppShell", () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock("@/lib/api", async (importarOriginal) => {
  const original = await importarOriginal<typeof import("@/lib/api")>();
  return { ...original, buscarPerfil: vi.fn().mockResolvedValue(null), listarDesafiosDeSeguranca: vi.fn(), buscarResumoDoProgresso: vi.fn() };
});

const catalogo: CatalogoDeInsignias = {
  trilhas: TRILHAS.map(resumirTrilha),
  laboratoriosDeRedes: { aulas: AULAS_DE_REDES.map((l) => l.slug), desafios: DESAFIOS_DE_REDES.map((l) => l.slug) },
  ideias: IDEIAS.map((i) => ({ slug: i.slug, nivel: i.nivel })),
};

const seguranca = vi.mocked(api.listarDesafiosDeSeguranca);
const resumo = vi.mocked(api.buscarResumoDoProgresso);

function desafio(slug: string, categoria: api.CategoriaDeSeguranca, resolvido: boolean): api.ResumoDeSeguranca {
  return { slug, titulo: slug, categoria, dificuldade: "FACIL", pontos: 100, resumo: "x", resolvido };
}

beforeEach(() => {
  window.localStorage.clear();
  reiniciarEstudoParaTestes();
  vi.resetAllMocks();
  seguranca.mockResolvedValue([desafio("a", "LOGS", true), desafio("b", "WEB", false)]);
  resumo.mockResolvedValue({ naoIniciados: 0, emAndamento: 0, concluidos: 2, dicasUsadas: 0, habilidades: [] });
});

describe("Conquistas", () => {
  it("mostra as conquistas e o progresso vindos do estudo, da segurança e dos tickets", async () => {
    window.localStorage.setItem(CHAVE_DO_ESTUDO, JSON.stringify({ redes: { licoes: [], notas: {}, desafios: ["primeiro-cabo"] } }));
    render(<Conquistas catalogo={catalogo} />);

    await waitFor(() => expect(screen.queryByText("Calculando…")).not.toBeInTheDocument());
    expect(screen.getByText(/4 de \d+ insígnias conquistadas/)).toBeInTheDocument();

    const redes = screen.getByRole("region", { name: "Redes" });
    expect(within(redes).getByText("Primeiro cabo").closest("li")).toHaveAttribute("data-conquistada", "true");
    const segurancaArea = screen.getByRole("region", { name: "Segurança" });
    expect(within(segurancaArea).getByText("Primeira flag").closest("li")).toHaveAttribute("data-conquistada", "true");
    expect(within(segurancaArea).getByText("Caçador de falhas").closest("li")).toHaveAttribute("data-conquistada", "false");
    const tickets = screen.getByRole("region", { name: "Tickets" });
    expect(within(tickets).getByText("Primeiro ticket").closest("li")).toHaveAttribute("data-conquistada", "true");
    expect(within(tickets).getByRole("progressbar", { name: "Progresso de Mão na massa" })).toHaveAttribute("aria-valuenow", "2");
  });

  it("sugere as insígnias mais próximas e filtra por área", async () => {
    render(<Conquistas catalogo={catalogo} />);
    await waitFor(() => expect(screen.queryByText("Calculando…")).not.toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Quase lá" })).toBeInTheDocument();

    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole("button", { name: "Redes" }));
    expect(screen.getByRole("region", { name: "Redes" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Tickets" })).not.toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Todas" }));
    expect(screen.getByRole("region", { name: "Tickets" })).toBeInTheDocument();
  });

  it("avisa quando parte do histórico não carrega, mas mostra o que tem", async () => {
    seguranca.mockRejectedValue(new Error("falhou"));
    resumo.mockRejectedValue(new Error("falhou"));
    render(<Conquistas catalogo={catalogo} />);
    expect(await screen.findByRole("status")).toHaveTextContent("Não foi possível carregar parte do seu histórico");
    expect(screen.getByText(/0 de \d+ insígnias conquistadas/)).toBeInTheDocument();
  });
});
