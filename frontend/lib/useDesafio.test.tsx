import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buscarDesafio, ErroApi, type DesafioDetalhe, type StatusGeracao } from "@/lib/api";
import { useDesafio } from "./useDesafio";

// O useRouter do Next devolve sempre o mesmo objeto; o mock também, senão o efeito do hook rodaria a cada render.
const { trocarRota, roteador } = vi.hoisted(() => {
  const trocarRota = vi.fn();
  return { trocarRota, roteador: { replace: trocarRota } };
});

vi.mock("next/navigation", () => ({ useRouter: () => roteador }));
vi.mock("@/lib/api", async (original) => {
  const real = await original<typeof import("@/lib/api")>();
  return { ...real, buscarDesafio: vi.fn() };
});

const buscar = vi.mocked(buscarDesafio);

const com = (statusGeracao: StatusGeracao): DesafioDetalhe => ({
  id: "d1", analiseId: "a1", numero: 1, codigo: "DEV-001", tipo: "FEATURE", nivel: "JUNIOR", statusGeracao,
  titulo: null, conteudo: null, mensagemErro: null, criadoEm: "2026-10-01T12:00:00Z", concluidoEm: null,
  statusProgresso: "NAO_INICIADO", iniciadoEm: null, finalizadoEm: null,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDesafio", () => {
  it("não busca nada sem id", async () => {
    renderHook(() => useDesafio(null));
    await act(async () => { await vi.advanceTimersByTimeAsync(5000); });

    expect(buscar).not.toHaveBeenCalled();
  });

  it("consulta de novo a cada 1,5 s enquanto gera e para quando termina", async () => {
    buscar.mockResolvedValueOnce(com("PENDENTE")).mockResolvedValueOnce(com("EM_ANDAMENTO")).mockResolvedValue(com("PRONTO"));
    const { result } = renderHook(() => useDesafio("d1"));

    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(result.current.desafio?.statusGeracao).toBe("PENDENTE");

    await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
    expect(result.current.desafio?.statusGeracao).toBe("EM_ANDAMENTO");

    await act(async () => { await vi.advanceTimersByTimeAsync(1500); });
    expect(result.current.desafio?.statusGeracao).toBe("PRONTO");
    expect(buscar).toHaveBeenCalledTimes(3);

    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(buscar).toHaveBeenCalledTimes(3);
  });

  it("para na primeira consulta quando o ticket já está pronto", async () => {
    buscar.mockResolvedValue(com("FALHOU"));
    renderHook(() => useDesafio("d1"));

    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });

    expect(buscar).toHaveBeenCalledTimes(1);
  });

  it("manda para o login quando a sessão expirou", async () => {
    buscar.mockRejectedValue(new ErroApi(401, "Não autenticado."));
    renderHook(() => useDesafio("d1"));

    await act(async () => { await vi.advanceTimersByTimeAsync(0); });

    expect(trocarRota).toHaveBeenCalledWith("/");
  });

  it("devolve a mensagem de erro de qualquer outra falha", async () => {
    buscar.mockRejectedValue(new ErroApi(404, "Desafio não encontrado."));
    const { result } = renderHook(() => useDesafio("d1"));

    await act(async () => { await vi.advanceTimersByTimeAsync(0); });

    expect(result.current.erro).toBe("Desafio não encontrado.");
    expect(trocarRota).not.toHaveBeenCalled();
  });

  it("desiste depois de quatro minutos esperando e avisa", async () => {
    buscar.mockResolvedValue(com("EM_ANDAMENTO"));
    const { result } = renderHook(() => useDesafio("d1"));

    await act(async () => { await vi.advanceTimersByTimeAsync(4 * 60 * 1000 + 3000); });

    expect(result.current.erro).toContain("demorando mais que o normal");
  });
});
