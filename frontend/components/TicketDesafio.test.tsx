import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TicketDesafio from "./TicketDesafio";
import { listarDicas, mudarProgresso, type DesafioDetalhe } from "@/lib/api";
import { useDesafio } from "@/lib/useDesafio";

vi.mock("./AppShell", () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock("@/lib/useDesafio", () => ({ useDesafio: vi.fn() }));
vi.mock("@/lib/api", () => ({ listarDicas: vi.fn(), pedirDica: vi.fn(), mudarProgresso: vi.fn() }));

const usar = vi.mocked(useDesafio);
const mudar = vi.mocked(mudarProgresso);

const detalhe = (extra: Partial<DesafioDetalhe> = {}): DesafioDetalhe => ({
  id: "d1",
  analiseId: "a1",
  numero: 1,
  codigo: "DEV-001",
  tipo: "FEATURE",
  nivel: "JUNIOR",
  statusGeracao: "PRONTO",
  titulo: "Adicionar paginação",
  conteudo: {
    titulo: "Adicionar paginação",
    contexto: "Contexto do time financeiro.",
    cenarioAtual: "Hoje tudo vem de uma vez.",
    objetivo: "Permitir paginar os pagamentos.",
    regrasDeNegocio: ["Regra A", "Regra B"],
    requisitosTecnicos: ["Requisito A"],
    criteriosDeAceite: ["Critério A", "Critério B"],
    testesEsperados: ["Teste A"],
    restricoes: ["Restrição A"],
    habilidades: ["Paginação", "REST"],
  },
  mensagemErro: null,
  criadoEm: "2026-10-01T12:00:00Z",
  concluidoEm: "2026-10-01T12:00:05Z",
  statusProgresso: "NAO_INICIADO",
  iniciadoEm: null,
  finalizadoEm: null,
  ...extra,
});

function exibir(desafio: DesafioDetalhe | null, erro: string | null = null) {
  usar.mockReturnValue({ desafio, erro });
  return render(<TicketDesafio id="d1" />);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listarDicas).mockResolvedValue({ dicas: [], maximoPorDesafio: 3, usadasHoje: 0, limiteDiario: 10 });
});

describe("TicketDesafio", () => {
  it("mostra o cabeçalho com código, tipo, nível, progresso e título", () => {
    exibir(detalhe());

    expect(screen.getByRole("heading", { level: 1, name: "Adicionar paginação" })).toBeInTheDocument();
    expect(screen.getByText("DEV-001")).toBeInTheDocument();
    expect(screen.getByText("Feature")).toBeInTheDocument();
    expect(screen.getByText("Júnior")).toBeInTheDocument();
    expect(screen.getAllByText("Não iniciado").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Outro desafio/ })).toHaveAttribute("href", "/desafio/novo?analise=a1");
    expect(screen.getByRole("link", { name: /Projeto/ })).toHaveAttribute("href", "/projeto?analise=a1");
  });

  it("organiza o conteúdo em abas com contadores e começa pelo resumo", () => {
    exibir(detalhe());

    const abas = screen.getAllByRole("tab");
    expect(abas.map((a) => a.textContent)).toEqual(["Resumo", "O que fazer4", "Como validar3"]);
    expect(abas[0]).toHaveAttribute("aria-selected", "true");
    const painel = screen.getByRole("tabpanel");
    expect(within(painel).getByText("Permitir paginar os pagamentos.")).toBeInTheDocument();
    expect(within(painel).getByText("Contexto do time financeiro.")).toBeInTheDocument();
    expect(within(painel).getByText("Hoje tudo vem de uma vez.")).toBeInTheDocument();
    expect(within(painel).queryByText("Regra A")).not.toBeInTheDocument();
  });

  it("troca de aba ao clicar e mostra o conteúdo de cada uma", async () => {
    exibir(detalhe());

    await userEvent.click(screen.getByRole("tab", { name: /O que fazer/ }));
    let painel = screen.getByRole("tabpanel");
    for (const texto of ["Regra A", "Regra B", "Requisito A", "Restrição A"]) {
      expect(within(painel).getByText(texto)).toBeInTheDocument();
    }

    await userEvent.click(screen.getByRole("tab", { name: /Como validar/ }));
    painel = screen.getByRole("tabpanel");
    for (const texto of ["Critério A", "Critério B", "Teste A", "Paginação", "REST"]) {
      expect(within(painel).getByText(texto)).toBeInTheDocument();
    }
    expect(screen.getByRole("tab", { name: /Como validar/ })).toHaveAttribute("aria-selected", "true");
  });

  it("troca de aba pelas setas do teclado, move o foco e volta ao início depois da última", async () => {
    exibir(detalhe());
    const [resumo, fazer, validar] = screen.getAllByRole("tab");

    resumo.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(fazer).toHaveAttribute("aria-selected", "true");
    expect(fazer).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(validar).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowRight}");
    expect(resumo).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowLeft}");
    expect(validar).toHaveAttribute("aria-selected", "true");
    expect(validar).toHaveFocus();
  });

  it("deixa só a aba ativa na ordem do Tab e liga cada aba ao seu painel", () => {
    exibir(detalhe());
    const abas = screen.getAllByRole("tab");

    expect(abas.map((a) => a.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
    expect(screen.getByRole("tablist")).toHaveAccessibleName("Partes do ticket");
    expect(abas[0].getAttribute("aria-controls")).toBe(screen.getByRole("tabpanel").id);
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", abas[0].id);
  });

  it("começa o desafio pelo botão do cabeçalho e passa a oferecer concluir", async () => {
    mudar.mockResolvedValue({ statusProgresso: "EM_ANDAMENTO", iniciadoEm: new Date().toISOString(), finalizadoEm: null });
    exibir(detalhe());

    await userEvent.click(screen.getByRole("button", { name: /Começar desafio/ }));

    expect(mudar).toHaveBeenCalledWith("d1", "EM_ANDAMENTO");
    expect(await screen.findByRole("button", { name: /Marcar como concluído/ })).toBeInTheDocument();
    expect(screen.getAllByText("Em andamento").length).toBeGreaterThan(0);
    expect(screen.getByText(/A Koda não lê o seu código/)).toBeInTheDocument();
  });

  it("oferece reabrir quando o ticket já foi concluído", () => {
    exibir(detalhe({ statusProgresso: "CONCLUIDO", iniciadoEm: "2026-10-01T10:00:00Z", finalizadoEm: "2026-10-01T11:00:00Z" }));

    expect(screen.getByRole("button", { name: /Reabrir desafio/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Começar desafio/ })).not.toBeInTheDocument();
  });

  it("mostra o erro do servidor se a mudança de progresso falhar e mantém o estado", async () => {
    mudar.mockRejectedValue(new Error("Não é possível mudar o progresso deste desafio para esse status."));
    exibir(detalhe());

    await userEvent.click(screen.getByRole("button", { name: /Começar desafio/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Não é possível mudar o progresso");
    expect(screen.getByRole("button", { name: /Começar desafio/ })).toBeEnabled();
  });

  it("mostra a falha da geração com o caminho para tentar de novo", () => {
    exibir(detalhe({ statusGeracao: "FALHOU", conteudo: null, mensagemErro: "A IA devolveu um desafio fora do formato." }));

    expect(screen.getByRole("heading", { name: "A geração falhou" })).toBeInTheDocument();
    expect(screen.getByText("A IA devolveu um desafio fora do formato.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tentar de novo" })).toHaveAttribute("href", "/desafio/novo?analise=a1");
  });

  it("mostra que ainda está gerando, o carregamento e o erro de carga", () => {
    const gerando = exibir(detalhe({ statusGeracao: "EM_ANDAMENTO", conteudo: null }));
    expect(screen.getByRole("heading", { name: "Desafio em geração" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Acompanhar" })).toHaveAttribute("href", "/desafio/gerando?desafio=d1");
    gerando.unmount();

    const carregando = exibir(null);
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    carregando.unmount();

    exibir(null, "Sem conexão.");
    expect(screen.getByRole("heading", { name: "Não foi possível carregar" })).toBeInTheDocument();
    expect(screen.getByText("Sem conexão.")).toBeInTheDocument();
  });
});
