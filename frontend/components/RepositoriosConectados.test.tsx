import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RepositoriosConectados from "./RepositoriosConectados";
import { ErroApi, type AnaliseResumo } from "@/lib/api";

const roteador = { push: vi.fn(), replace: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => roteador }));

const listarAnalises = vi.fn();
const arquivarRepositorio = vi.fn();
vi.mock("@/lib/api", async (importarOriginal) => {
  const original = await importarOriginal<typeof import("@/lib/api")>();
  return { ...original, listarAnalises: () => listarAnalises(), arquivarRepositorio: (id: string) => arquivarRepositorio(id) };
});

function analise(id: string, nome: string): AnaliseResumo {
  return {
    id, status: "CONCLUIDA", dono: "artur", nome, linguagem: "JAVA", framework: "Spring Boot", versaoLinguagem: "21",
    tecnologias: [], parcial: false, mensagemErro: null, criadoEm: "2026-10-01T10:00:00Z", concluidaEm: "2026-10-01T10:05:00Z",
  };
}

beforeEach(() => {
  listarAnalises.mockReset();
  arquivarRepositorio.mockReset();
  roteador.replace.mockReset();
});

describe("repositórios conectados", () => {
  it("lista os repositórios com link para o projeto", async () => {
    listarAnalises.mockResolvedValue([analise("a1", "koda"), analise("a2", "triply")]);
    render(<RepositoriosConectados />);

    expect(await screen.findByText("triply")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /koda|triply/ }).some((l) => l.getAttribute("href") === "/projeto?analise=a1")).toBe(true);
  });

  it("pede confirmação, explica o que acontece e só então arquiva", async () => {
    listarAnalises.mockResolvedValue([analise("a1", "koda"), analise("a2", "triply")]);
    arquivarRepositorio.mockResolvedValue(undefined);
    const usuario = userEvent.setup();
    render(<RepositoriosConectados />);

    await usuario.click(await screen.findByRole("button", { name: "Arquivar koda" }));
    const confirmacao = screen.getByRole("group", { name: "Arquivar koda" });
    expect(within(confirmacao).getByText(/a cota do mês não volta/)).toBeInTheDocument();
    expect(arquivarRepositorio).not.toHaveBeenCalled();

    await usuario.click(within(confirmacao).getByRole("button", { name: "Arquivar" }));

    await waitFor(() => expect(arquivarRepositorio).toHaveBeenCalledWith("a1"));
    await waitFor(() => expect(screen.queryByText("koda")).not.toBeInTheDocument());
    expect(screen.getByText("triply")).toBeInTheDocument();
  });

  it("cancela sem arquivar", async () => {
    listarAnalises.mockResolvedValue([analise("a1", "koda")]);
    const usuario = userEvent.setup();
    render(<RepositoriosConectados />);

    await usuario.click(await screen.findByRole("button", { name: "Arquivar koda" }));
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(arquivarRepositorio).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Arquivar koda" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Arquivar koda" })).not.toBeInTheDocument();
  });

  it("mantém o repositório na lista e mostra o erro quando o arquivamento falha", async () => {
    listarAnalises.mockResolvedValue([analise("a1", "koda")]);
    arquivarRepositorio.mockRejectedValue(new ErroApi(409, "Já existe uma análise em andamento para este repositório."));
    const usuario = userEvent.setup();
    render(<RepositoriosConectados />);

    await usuario.click(await screen.findByRole("button", { name: "Arquivar koda" }));
    await usuario.click(within(screen.getByRole("group", { name: "Arquivar koda" })).getByRole("button", { name: "Arquivar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Já existe uma análise em andamento para este repositório.");
    expect(screen.getAllByText("koda").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Você ainda não conectou nenhum repositório/)).not.toBeInTheDocument();
  });

  it("volta ao início quando a sessão expirou", async () => {
    listarAnalises.mockResolvedValue([analise("a1", "koda")]);
    arquivarRepositorio.mockRejectedValue(new ErroApi(401, "Não autenticado."));
    const usuario = userEvent.setup();
    render(<RepositoriosConectados />);

    await usuario.click(await screen.findByRole("button", { name: "Arquivar koda" }));
    await usuario.click(within(screen.getByRole("group", { name: "Arquivar koda" })).getByRole("button", { name: "Arquivar" }));

    await waitFor(() => expect(roteador.replace).toHaveBeenCalledWith("/"));
  });

  it("mostra o convite quando não sobra nenhum repositório", async () => {
    listarAnalises.mockResolvedValue([analise("a1", "koda")]);
    arquivarRepositorio.mockResolvedValue(undefined);
    const usuario = userEvent.setup();
    render(<RepositoriosConectados />);

    await usuario.click(await screen.findByRole("button", { name: "Arquivar koda" }));
    await usuario.click(within(screen.getByRole("group", { name: "Arquivar koda" })).getByRole("button", { name: "Arquivar" }));

    expect(await screen.findByText(/Você ainda não conectou nenhum repositório/)).toBeInTheDocument();
  });
});
