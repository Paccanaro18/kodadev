import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Notificacoes from "./Notificacoes";
import { listarNotificacoes, marcarComoLida, marcarTodasComoLidas, type Notificacao, type Notificacoes as Dados } from "@/lib/api";

const empurrar = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: empurrar }) }));
vi.mock("@/lib/api", () => ({ listarNotificacoes: vi.fn(), marcarComoLida: vi.fn(), marcarTodasComoLidas: vi.fn() }));

const listar = vi.mocked(listarNotificacoes);
const marcar = vi.mocked(marcarComoLida);
const marcarTodas = vi.mocked(marcarTodasComoLidas);

const notificacao = (extra: Partial<Notificacao>): Notificacao => ({
  id: "n1", tipo: "DESAFIO_PRONTO", desafioId: "d1", codigo: "DEV-001", titulo: "Paginação", lida: false,
  criadoEm: new Date().toISOString(), ...extra,
});

const dados = (itens: Notificacao[], naoLidas = itens.filter((n) => !n.lida).length): Dados => ({ naoLidas, itens });

beforeEach(() => {
  vi.clearAllMocks();
  marcar.mockResolvedValue(undefined);
  marcarTodas.mockResolvedValue(undefined);
});

describe("Notificacoes", () => {
  it("mostra o contador de não lidas no sino", async () => {
    listar.mockResolvedValue(dados([notificacao({}), notificacao({ id: "n2" }), notificacao({ id: "n3", lida: true })]));
    render(<Notificacoes />);

    expect(await screen.findByRole("button", { name: "Notificações (2 não lidas)" })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("usa 9+ quando há mais de nove e some o contador quando tudo foi lido", async () => {
    listar.mockResolvedValue(dados([], 12));
    const { unmount } = render(<Notificacoes />);
    expect(await screen.findByText("9+")).toBeInTheDocument();
    unmount();

    listar.mockResolvedValue(dados([notificacao({ lida: true })]));
    render(<Notificacoes />);
    expect(await screen.findByRole("button", { name: "Notificações" })).toBeInTheDocument();
    expect(screen.queryByText("9+")).not.toBeInTheDocument();
  });

  it("escreve a mensagem de cada tipo de notificação", async () => {
    listar.mockResolvedValue(dados([
      notificacao({ id: "a", tipo: "DESAFIO_PRONTO", codigo: "DEV-001", titulo: "Paginação" }),
      notificacao({ id: "b", tipo: "DESAFIO_FALHOU", codigo: "DEV-002", titulo: null }),
      notificacao({ id: "c", tipo: "PROGRESSO_CONCLUIDO", codigo: "DEV-003", titulo: "Filtro" }),
    ]));
    render(<Notificacoes />);
    await userEvent.click(await screen.findByRole("button", { name: /Notificações/ }));

    expect(screen.getByText("O DEV-001 está pronto: Paginação")).toBeInTheDocument();
    expect(screen.getByText("A geração do DEV-002 não deu certo")).toBeInTheDocument();
    expect(screen.getByText("Você concluiu o DEV-003: Filtro")).toBeInTheDocument();
  });

  it("marca como lida e leva ao ticket ao abrir uma notificação", async () => {
    listar.mockResolvedValue(dados([notificacao({ id: "n1", desafioId: "d9" }), notificacao({ id: "n2", lida: true })]));
    render(<Notificacoes />);
    await userEvent.click(await screen.findByRole("button", { name: /Notificações/ }));

    await userEvent.click(screen.getAllByText(/O DEV-001 está pronto/)[0]);

    expect(marcar).toHaveBeenCalledWith("n1");
    expect(empurrar).toHaveBeenCalledWith("/desafio/d9");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("não chama a API ao abrir uma notificação que já estava lida", async () => {
    listar.mockResolvedValue(dados([notificacao({ id: "n2", lida: true, desafioId: "d2" })]));
    render(<Notificacoes />);
    await userEvent.click(await screen.findByRole("button", { name: /Notificações/ }));

    await userEvent.click(screen.getByText(/O DEV-001 está pronto/));

    expect(marcar).not.toHaveBeenCalled();
    expect(empurrar).toHaveBeenCalledWith("/desafio/d2");
  });

  it("marca todas como lidas e tira o contador", async () => {
    listar.mockResolvedValue(dados([notificacao({ id: "n1" }), notificacao({ id: "n2" })]));
    render(<Notificacoes />);
    await userEvent.click(await screen.findByRole("button", { name: /Notificações/ }));

    await userEvent.click(screen.getByRole("button", { name: "Marcar todas como lidas" }));

    expect(marcarTodas).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByRole("button", { name: "Notificações" })).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "Marcar todas como lidas" })).not.toBeInTheDocument();
  });

  it("fecha o painel com Esc", async () => {
    listar.mockResolvedValue(dados([notificacao({})]));
    render(<Notificacoes />);
    await userEvent.click(await screen.findByRole("button", { name: /Notificações/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("avisa quando não há nenhuma notificação", async () => {
    listar.mockResolvedValue(dados([]));
    render(<Notificacoes />);
    await userEvent.click(await screen.findByRole("button", { name: /Notificações/ }));

    expect(await screen.findByText("Nenhuma notificação por enquanto.")).toBeInTheDocument();
  });

  it("avisa quando não consegue carregar", async () => {
    listar.mockRejectedValue(new Error("fora do ar"));
    render(<Notificacoes />);
    await userEvent.click(await screen.findByRole("button", { name: /Notificações/ }));

    expect(await screen.findByText("Não foi possível carregar agora.")).toBeInTheDocument();
  });
});
