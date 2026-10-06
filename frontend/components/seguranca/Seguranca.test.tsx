import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DetalheDeSeguranca from "./DetalheDeSeguranca";
import ListaDeSeguranca from "./ListaDeSeguranca";
import * as api from "@/lib/api";

vi.mock("../AppShell", () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
const roteador = { replace: vi.fn(), push: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => roteador }));
vi.mock("@/lib/api", async (importarOriginal) => {
  const original = await importarOriginal<typeof import("@/lib/api")>();
  return {
    ...original,
    listarDesafiosDeSeguranca: vi.fn(),
    buscarDesafioDeSeguranca: vi.fn(),
    buscarPlacarDeSeguranca: vi.fn(),
    enviarFlag: vi.fn(),
  };
});

const listar = vi.mocked(api.listarDesafiosDeSeguranca);
const buscar = vi.mocked(api.buscarDesafioDeSeguranca);
const placar = vi.mocked(api.buscarPlacarDeSeguranca);
const enviar = vi.mocked(api.enviarFlag);

function resumo(extra: Partial<api.ResumoDeSeguranca>): api.ResumoDeSeguranca {
  return { slug: "logs-um", titulo: "Quem bateu à porta", categoria: "LOGS", dificuldade: "FACIL", pontos: 100, resumo: "Descubra quem entrou.", resolvido: false, ...extra };
}

function detalhe(extra: Partial<api.DetalheDeSeguranca>): api.DetalheDeSeguranca {
  return {
    ...resumo({}), enunciado: ["Primeiro parágrafo.", "Segundo parágrafo."], formatoDaFlag: "KODA{ip_usuario}",
    artefatos: [{ nome: "auth.log", linguagem: "text", conteudo: "linha 1\nlinha 2" }],
    dicas: ["Dica A", "Dica B"], solucao: null, ...extra,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  placar.mockResolvedValue({ melhores: [], voce: null });
});

describe("ListaDeSeguranca", () => {
  const desafios = [
    resumo({ slug: "logs-um", titulo: "Quem bateu à porta", resolvido: true }),
    resumo({ slug: "web-um", titulo: "O cookie previsível", categoria: "WEB", dificuldade: "MEDIO", pontos: 200 }),
    resumo({ slug: "cripto-um", titulo: "Camadas de cebola", categoria: "CRIPTOGRAFIA", dificuldade: "DIFICIL", pontos: 300 }),
  ];

  it("mostra o aviso legal, o progresso e os desafios com link", async () => {
    listar.mockResolvedValue(desafios);
    render(<ListaDeSeguranca />);

    expect(await screen.findByText("1 de 3 resolvidos · 100 pontos")).toBeInTheDocument();
    expect(screen.getByText(/fictícios/)).toBeInTheDocument();
    expect(screen.getByText("100", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /O cookie previsível/ })).toHaveAttribute("href", "/seguranca/web-um");
    expect(screen.getByLabelText("Resolvido")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Não resolvido")).toHaveLength(2);
  });

  it("filtra por categoria e por dificuldade e avisa quando nada combina", async () => {
    listar.mockResolvedValue(desafios);
    render(<ListaDeSeguranca />);
    const usuario = userEvent.setup();
    await screen.findByText("Camadas de cebola");

    await usuario.click(within(screen.getByRole("group", { name: "Filtrar por categoria" })).getByRole("button", { name: "Web e APIs" }));
    expect(screen.getAllByRole("link").filter((l) => l.getAttribute("href")?.startsWith("/seguranca/"))).toHaveLength(1);

    await usuario.click(within(screen.getByRole("group", { name: "Filtrar por dificuldade" })).getByRole("button", { name: "Difícil" }));
    expect(screen.getByText("Nenhum desafio com esses filtros.")).toBeInTheDocument();

    await usuario.click(within(screen.getByRole("group", { name: "Filtrar por categoria" })).getByRole("button", { name: "Todos" }));
    expect(screen.getByText("Camadas de cebola")).toBeInTheDocument();
    expect(screen.queryByText("O cookie previsível")).not.toBeInTheDocument();
  });

  it("mostra o placar e a posição de quem está fora dos melhores", async () => {
    listar.mockResolvedValue(desafios);
    placar.mockResolvedValue({
      melhores: [{ posicao: 1, login: "bia", pontos: 600, resolvidos: 3 }, { posicao: 2, login: "caio", pontos: 300, resolvidos: 1 }],
      voce: { posicao: 11, login: "ana", pontos: 100, resolvidos: 1 },
    });
    render(<ListaDeSeguranca />);

    expect(await screen.findByText("bia")).toBeInTheDocument();
    expect(screen.getByLabelText("Primeiro lugar")).toBeInTheDocument();
    expect(screen.getByText("Você está em 11º lugar, com 100 pontos.")).toBeInTheDocument();
  });

  it("avisa quando ninguém pontuou", async () => {
    listar.mockResolvedValue(desafios);
    render(<ListaDeSeguranca />);

    expect(await screen.findByText(/Ninguém pontuou ainda/)).toBeInTheDocument();
  });

  it("mostra o erro e tenta de novo", async () => {
    listar.mockRejectedValueOnce(new Error("falhou")).mockResolvedValue(desafios);
    render(<ListaDeSeguranca />);
    const usuario = userEvent.setup();

    expect(await screen.findByText("falhou")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Tentar de novo" }));

    expect(await screen.findByText("Camadas de cebola")).toBeInTheDocument();
  });

  it("manda para o login quando não há sessão", async () => {
    listar.mockRejectedValue(new api.ErroApi(401, "sem sessão"));
    render(<ListaDeSeguranca />);

    await waitFor(() => expect(roteador.replace).toHaveBeenCalledWith("/"));
  });
});

describe("DetalheDeSeguranca", () => {
  it("mostra o enunciado, o material e o formato da flag, sem a solução", async () => {
    buscar.mockResolvedValue(detalhe({}));
    render(<DetalheDeSeguranca slug="logs-um" />);

    expect(await screen.findByRole("heading", { name: "Quem bateu à porta" })).toBeInTheDocument();
    expect(screen.getByText("Primeiro parágrafo.")).toBeInTheDocument();
    expect(screen.getByText(/linha 1/)).toBeInTheDocument();
    expect(screen.getByText("KODA{ip_usuario}")).toBeInTheDocument();
    expect(screen.queryByText(/Como se resolve/)).not.toBeInTheDocument();
    expect(buscar).toHaveBeenCalledWith("logs-um");
  });

  it("revela uma dica de cada vez", async () => {
    buscar.mockResolvedValue(detalhe({}));
    render(<DetalheDeSeguranca slug="logs-um" />);
    const usuario = userEvent.setup();
    await screen.findByText("Dicas");

    expect(screen.queryByText(/Dica A/)).not.toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Mostrar a dica 1 de 2" }));
    expect(screen.getByText(/Dica A/)).toBeInTheDocument();
    expect(screen.queryByText(/Dica B/)).not.toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Mostrar a dica 2 de 2" }));
    expect(screen.getByText(/Dica B/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Mostrar a dica/ })).not.toBeInTheDocument();
  });

  it("avisa quando a flag está errada e mantém o desafio aberto", async () => {
    buscar.mockResolvedValue(detalhe({}));
    enviar.mockResolvedValue({ correta: false, jaResolvido: false, pontosGanhos: 0 });
    render(<DetalheDeSeguranca slug="logs-um" />);
    const usuario = userEvent.setup();

    await usuario.click(await screen.findByLabelText("Flag"));
    await usuario.paste("KODA{errada}");
    await usuario.click(screen.getByRole("button", { name: "Enviar flag" }));

    expect(await screen.findByText(/Não é essa/)).toBeInTheDocument();
    expect(enviar).toHaveBeenCalledWith("logs-um", "KODA{errada}");
    expect(buscar).toHaveBeenCalledTimes(1);
  });

  it("comemora a flag certa, recarrega o desafio e mostra a solução", async () => {
    buscar.mockResolvedValueOnce(detalhe({})).mockResolvedValueOnce(detalhe({ resolvido: true, solucao: ["Veja o Accepted password."] }));
    enviar.mockResolvedValue({ correta: true, jaResolvido: false, pontosGanhos: 100 });
    render(<DetalheDeSeguranca slug="logs-um" />);
    const usuario = userEvent.setup();

    await usuario.click(await screen.findByLabelText("Flag"));
    await usuario.paste("KODA{certa}");
    await usuario.click(screen.getByRole("button", { name: "Enviar flag" }));

    expect(await screen.findByText("Flag correta! Você ganhou 100 pontos.")).toBeInTheDocument();
    expect(await screen.findByText("Veja o Accepted password.")).toBeInTheDocument();
    expect(screen.getByText("Resolvido")).toBeInTheDocument();
    expect(screen.queryByText("Dicas")).not.toBeInTheDocument();
  });

  it("aceita a flag de um desafio já resolvido sem falar em pontos", async () => {
    buscar.mockResolvedValue(detalhe({ resolvido: true, solucao: ["Resolvido antes."] }));
    enviar.mockResolvedValue({ correta: true, jaResolvido: true, pontosGanhos: 0 });
    render(<DetalheDeSeguranca slug="logs-um" />);
    const usuario = userEvent.setup();

    await usuario.click(await screen.findByLabelText("Flag"));
    await usuario.paste("KODA{certa}");
    await usuario.click(screen.getByRole("button", { name: "Enviar flag" }));

    expect(await screen.findByText("Flag correta!")).toBeInTheDocument();
  });

  it("mostra o limite de tentativas e erros da API", async () => {
    buscar.mockResolvedValue(detalhe({}));
    enviar.mockRejectedValue(new api.ErroApi(429, "Muitas tentativas incorretas."));
    render(<DetalheDeSeguranca slug="logs-um" />);
    const usuario = userEvent.setup();

    await usuario.click(await screen.findByLabelText("Flag"));
    await usuario.paste("KODA{x}");
    await usuario.click(screen.getByRole("button", { name: "Enviar flag" }));

    expect(await screen.findByText("Muitas tentativas incorretas.")).toBeInTheDocument();
  });

  it("não deixa enviar uma flag vazia", async () => {
    buscar.mockResolvedValue(detalhe({}));
    render(<DetalheDeSeguranca slug="logs-um" />);

    await screen.findByLabelText("Flag");
    expect(screen.getByRole("button", { name: "Enviar flag" })).toBeDisabled();
    expect(enviar).not.toHaveBeenCalled();
  });

  it("baixa o artefato como arquivo", async () => {
    buscar.mockResolvedValue(detalhe({}));
    const criar = vi.fn(() => "blob:teste");
    const revogar = vi.fn();
    Object.assign(URL, { createObjectURL: criar, revokeObjectURL: revogar });
    const clique = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    render(<DetalheDeSeguranca slug="logs-um" />);
    const usuario = userEvent.setup();

    await usuario.click(await screen.findByRole("button", { name: "Baixar auth.log" }));

    expect(criar).toHaveBeenCalledTimes(1);
    expect(clique).toHaveBeenCalledTimes(1);
    expect(revogar).toHaveBeenCalledWith("blob:teste");
    clique.mockRestore();
  });

  it("mostra o erro do carregamento com opção de voltar", async () => {
    buscar.mockRejectedValue(new api.ErroApi(404, "Desafio de segurança não encontrado"));
    render(<DetalheDeSeguranca slug="nao-existe" />);

    expect(await screen.findByText("Desafio de segurança não encontrado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar aos desafios" })).toHaveAttribute("href", "/seguranca");
  });
});
