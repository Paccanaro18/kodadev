import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PainelDeDicas from "./PainelDeDicas";
import { listarDicas, pedirDica, type Dica, type Dicas } from "@/lib/api";

vi.mock("@/lib/api", () => ({ listarDicas: vi.fn(), pedirDica: vi.fn() }));

const listar = vi.mocked(listarDicas);
const pedir = vi.mocked(pedirDica);

const dica = (nivel: number, texto = `Texto da dica ${nivel}`): Dica => ({ nivel, texto, criadoEm: "2026-10-01T12:00:00Z" });
const estado = (dicas: Dica[] = [], usadasHoje = dicas.length, limiteDiario = 10): Dicas => ({ dicas, maximoPorDesafio: 3, usadasHoje, limiteDiario });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PainelDeDicas", () => {
  it("libera o pedido com o ticket em andamento e mostra os contadores", async () => {
    listar.mockResolvedValue(estado());
    render(<PainelDeDicas desafioId="d1" status="EM_ANDAMENTO" />);

    const botao = await screen.findByRole("button", { name: /Pedir uma dica/ });
    expect(botao).toBeEnabled();
    expect(await screen.findByText(/0 de 3 neste desafio · 0 de 10 hoje/)).toBeInTheDocument();
  });

  it("bloqueia o pedido e explica o motivo quando o ticket não está em andamento", async () => {
    listar.mockResolvedValue(estado());
    const { rerender } = render(<PainelDeDicas desafioId="d1" status="NAO_INICIADO" />);

    expect(await screen.findByRole("button", { name: /Pedir uma dica/ })).toBeDisabled();
    expect(screen.getByText("Comece o desafio para liberar as dicas.")).toBeInTheDocument();

    rerender(<PainelDeDicas desafioId="d1" status="CONCLUIDO" />);
    expect(screen.getByRole("button", { name: /Pedir uma dica/ })).toBeDisabled();
    expect(screen.getByText("Reabra o desafio para pedir mais dicas.")).toBeInTheDocument();
  });

  it("mostra a espera enquanto a dica é escrita, trava o botão e depois exibe a dica com o nível", async () => {
    listar.mockResolvedValue(estado());
    let entregar: (d: Dica) => void = () => {};
    pedir.mockReturnValue(new Promise<Dica>((resolve) => { entregar = resolve; }));
    render(<PainelDeDicas desafioId="d1" status="EM_ANDAMENTO" />);

    await userEvent.click(await screen.findByRole("button", { name: /Pedir uma dica/ }));

    expect(screen.getByRole("status")).toHaveTextContent("Escrevendo a dica");
    expect(screen.getByRole("button", { name: /Pedir uma dica/ })).toBeDisabled();

    entregar(dica(1, "Comece lendo o objetivo."));
    expect(await screen.findByText("Comece lendo o objetivo.")).toBeInTheDocument();
    expect(screen.getByText("Direção")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText(/1 de 3 neste desafio · 1 de 10 hoje/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pedir outra dica/ })).toBeEnabled();
    expect(pedir).toHaveBeenCalledWith("d1");
  });

  it("mostra a mensagem do servidor quando a dica falha e recarrega o estado", async () => {
    listar.mockResolvedValue(estado());
    pedir.mockRejectedValue(new Error("Não conseguimos gerar uma dica agora. Tente novamente em instantes."));
    render(<PainelDeDicas desafioId="d1" status="EM_ANDAMENTO" />);

    await userEvent.click(await screen.findByRole("button", { name: /Pedir uma dica/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não conseguimos gerar uma dica agora");
    await waitFor(() => expect(listar).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("button", { name: /Pedir uma dica/ })).toBeEnabled();
  });

  it("trava no limite de três dicas por desafio", async () => {
    listar.mockResolvedValue(estado([dica(1), dica(2), dica(3)]));
    render(<PainelDeDicas desafioId="d1" status="EM_ANDAMENTO" />);

    expect(await screen.findByText("Conferência")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pedir outra dica/ })).toBeDisabled();
    expect(screen.getByText("Você já usou todas as dicas deste desafio.")).toBeInTheDocument();
  });

  it("trava quando a cota do dia acabou", async () => {
    listar.mockResolvedValue(estado([dica(1)], 10, 10));
    render(<PainelDeDicas desafioId="d1" status="EM_ANDAMENTO" />);

    expect(await screen.findByRole("button", { name: /Pedir outra dica/ })).toBeDisabled();
    expect(screen.getByText(/limite de dicas de hoje/)).toBeInTheDocument();
  });

  it("mostra o erro quando não consegue carregar as dicas", async () => {
    listar.mockRejectedValue(new Error("Sem conexão."));
    render(<PainelDeDicas desafioId="d1" status="EM_ANDAMENTO" />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Sem conexão.");
  });
});
