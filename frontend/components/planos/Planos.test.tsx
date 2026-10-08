import { render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AvisoDeLimite from "./AvisoDeLimite";
import { ConteudoDePlanos } from "./Planos";
import { ErroApi, limiteDoPlanoAtingido, type SituacaoDoPlano } from "@/lib/api";

vi.mock("../AppShell", () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));

const buscarPlano = vi.fn();
vi.mock("@/lib/api", async (importarOriginal) => {
  const original = await importarOriginal<typeof import("@/lib/api")>();
  return { ...original, buscarPlano: () => buscarPlano() };
});

const GRATIS: SituacaoDoPlano = {
  plano: "GRATIS", nome: "Grátis", ticketsPorMes: 3, ticketsUsados: 2, renovaEm: "2026-11-01T03:00:00Z",
  repositorios: 1, repositoriosUsados: 1,
  planos: [
    { plano: "GRATIS", nome: "Grátis", ticketsPorMes: 3, repositorios: 1 },
    { plano: "PRO", nome: "Pro", ticketsPorMes: 60, repositorios: 20 },
  ],
};

beforeEach(() => {
  buscarPlano.mockReset();
});

describe("página de planos", () => {
  it("mostra o uso dentro do cartão do plano da pessoa, com a data de renovação", async () => {
    buscarPlano.mockResolvedValue(GRATIS);
    render(<ConteudoDePlanos />);

    expect(await screen.findByText("01/11/2026")).toBeInTheDocument();
    const planos = screen.getByRole("list", { name: "Planos" });
    const cartaoGratis = within(planos).getByRole("heading", { name: "Grátis" }).closest("li")!;
    const tickets = within(cartaoGratis).getByRole("progressbar", { name: "Tickets deste mês" });
    expect(tickets).toHaveAttribute("aria-valuenow", "2");
    expect(tickets).toHaveAttribute("aria-valuemax", "3");
    expect(within(cartaoGratis).getByText("Restam 1 ticket.")).toBeInTheDocument();
    expect(within(cartaoGratis).getByText("Você usou todos os repositórios do seu plano.")).toBeInTheDocument();
    expect(within(planos).getAllByRole("progressbar")).toHaveLength(2);
  });

  it("destaca o Pro, marca o plano atual e deixa claro que o pagamento ainda não existe", async () => {
    buscarPlano.mockResolvedValue(GRATIS);
    render(<ConteudoDePlanos />);
    await screen.findByText("01/11/2026");

    const planos = screen.getByRole("list", { name: "Planos" });
    expect(within(planos).getByText("Seu plano")).toBeInTheDocument();
    expect(within(planos).getByText("Mais completo")).toBeInTheDocument();
    const botoes = within(planos).getAllByRole("button", { name: "Em breve" });
    expect(botoes).toHaveLength(2);
    for (const botao of botoes) expect(botao).toBeDisabled();
    expect(within(planos).getAllByText("O pagamento ainda não está disponível.")).toHaveLength(2);
    expect(within(planos).getByRole("link", { name: /Continuar praticando/ })).toHaveAttribute("href", "/desafios");
  });

  it("usa os números do servidor nos cartões e na tabela", async () => {
    buscarPlano.mockResolvedValue(GRATIS);
    render(<ConteudoDePlanos />);
    await screen.findByText("01/11/2026");

    const planos = screen.getByRole("list", { name: "Planos" });
    const cartaoPro = within(planos).getByRole("heading", { name: "Pro" }).closest("li")!;
    expect(within(cartaoPro).getByText("60")).toBeInTheDocument();
    expect(within(cartaoPro).getByText("e até 20 repositórios analisados")).toBeInTheDocument();
    expect(within(cartaoPro).getByText("Cota 20 vezes maior de tickets")).toBeInTheDocument();

    const tabela = screen.getByRole("table");
    const linha = within(tabela).getByRole("row", { name: /Tickets gerados por IA/ });
    expect(within(linha).getByText("3 por mês")).toBeInTheDocument();
    expect(within(linha).getByText("60 por mês")).toBeInTheDocument();
    expect(within(tabela).getByRole("row", { name: /Repositórios analisados/ })).toHaveTextContent("20 repositórios");
  });

  it("agrupa a tabela e marca a coluna do plano atual", async () => {
    buscarPlano.mockResolvedValue(GRATIS);
    render(<ConteudoDePlanos />);
    await screen.findByText("01/11/2026");

    const tabela = screen.getByRole("table");
    for (const grupo of ["Para aprender", "Tickets com IA", "Para turmas e mentores"]) {
      expect(within(tabela).getByRole("columnheader", { name: grupo })).toBeInTheDocument();
    }
    expect(within(tabela).getByRole("columnheader", { name: /Grátis \(você\)/ })).toBeInTheDocument();
  });

  it("avisa que a cota esgotou", async () => {
    buscarPlano.mockResolvedValue({ ...GRATIS, ticketsUsados: 3 });
    render(<ConteudoDePlanos />);

    expect(await screen.findByText("Você usou todos os tickets do seu plano.")).toBeInTheDocument();
  });

  it("usa uma barra contínua quando a cota é grande e mostra o uso no cartão do Pro", async () => {
    buscarPlano.mockResolvedValue({ ...GRATIS, plano: "PRO", nome: "Pro", ticketsPorMes: 60, ticketsUsados: 10, repositorios: 20 });
    render(<ConteudoDePlanos />);

    expect(await screen.findByText("Restam 50 tickets.")).toBeInTheDocument();
    const planos = screen.getByRole("list", { name: "Planos" });
    const cartaoPro = within(planos).getByRole("heading", { name: "Pro" }).closest("li")!;
    expect(within(cartaoPro).getByText("Seu plano")).toBeInTheDocument();
    expect(within(cartaoPro).getByRole("progressbar", { name: "Tickets deste mês" }).querySelectorAll("span")).toHaveLength(0);
  });

  it("responde as dúvidas sobre pagamento, cota e repositórios privados", async () => {
    buscarPlano.mockResolvedValue(GRATIS);
    render(<ConteudoDePlanos />);
    await screen.findByText("01/11/2026");

    expect(screen.getByText("Posso assinar agora?")).toBeInTheDocument();
    expect(screen.getByText(/Ainda não\. O pagamento está em preparação/)).toBeInTheDocument();
    expect(screen.getByText("O que acontece quando a cota acaba?")).toBeInTheDocument();
    expect(screen.getByText(/apenas repositórios públicos da sua própria conta/)).toBeInTheDocument();
  });

  it("continua útil quando o uso não carrega, sem inventar números", async () => {
    buscarPlano.mockRejectedValue(new Error("falhou"));
    render(<ConteudoDePlanos />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar o seu uso agora.");
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Conectar um repositório/ })).toHaveAttribute("href", "/repositorios/adicionar");
    await waitFor(() => expect(screen.queryByText("Carregando o seu uso...")).not.toBeInTheDocument());
  });
});

describe("aviso de limite", () => {
  it("leva para os planos quando o erro é de limite", () => {
    render(<AvisoDeLimite mensagem="Você usou os 3 tickets do plano Grátis neste mês." noLimite />);
    expect(screen.getByRole("alert")).toHaveTextContent("Você usou os 3 tickets do plano Grátis neste mês.");
    expect(screen.getByRole("link", { name: "Ver os planos e o seu uso" })).toHaveAttribute("href", "/planos");
  });

  it("não oferece link em erro comum", () => {
    render(<AvisoDeLimite mensagem="Erro inesperado." noLimite={false} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("reconhece o status 402 como limite do plano", () => {
    expect(limiteDoPlanoAtingido(new ErroApi(402, "x", "COTA_MENSAL"))).toBe(true);
    expect(limiteDoPlanoAtingido(new ErroApi(429, "x"))).toBe(false);
    expect(limiteDoPlanoAtingido(new Error("x"))).toBe(false);
  });
});
