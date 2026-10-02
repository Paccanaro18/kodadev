import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BlocoDeCodigo from "./BlocoDeCodigo";
import BlocosDeConteudo from "./BlocosDeConteudo";
import BotaoDeEntrada from "./BotaoDeEntrada";
import ListaDeAulas from "./ListaDeAulas";
import { buscarPerfil, type Perfil } from "@/lib/api";
import { AULAS } from "@/lib/conteudoAprenda";

vi.mock("@/lib/api", () => ({ buscarPerfil: vi.fn() }));
const perfil = vi.mocked(buscarPerfil);

describe("ListaDeAulas", () => {
  it("mostra todas as aulas e filtra por trilha", async () => {
    render(<ListaDeAulas />);
    const usuario = userEvent.setup();

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(AULAS.length);

    const filtros = screen.getByRole("group", { name: "Filtrar por trilha" });
    await usuario.click(within(filtros).getByRole("button", { name: /^Python/ }));

    const doPython = AULAS.filter((a) => a.trilha === "python");
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(doPython.length);
    expect(screen.getByText("APIs com FastAPI, validação e testes com pytest.")).toBeInTheDocument();

    await usuario.click(within(filtros).getByRole("button", { name: /^Todas/ }));
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(AULAS.length);
  });

  it("leva cada cartão para a página da aula", () => {
    render(<ListaDeAulas />);
    const primeira = AULAS[0];
    expect(screen.getByRole("link", { name: new RegExp(primeira.titulo.slice(0, 20)) }))
      .toHaveAttribute("href", `/aprenda/${primeira.slug}`);
  });
});

describe("BlocosDeConteudo", () => {
  it("desenha cada tipo de bloco", () => {
    const { container } = render(
      <BlocosDeConteudo blocos={[
        { tipo: "h", texto: "Subtítulo" },
        { tipo: "p", texto: "Um parágrafo." },
        { tipo: "lista", itens: ["Item A", "Item B"] },
        { tipo: "codigo", linguagem: "java", texto: "int x = 1;", legenda: "Exemplo.java" },
        { tipo: "dica", titulo: "Atenção", texto: "Leia com calma." },
        { tipo: "h3", texto: "Um detalhe" },
        { tipo: "numerada", itens: ["Passo 1", "Passo 2"] },
        { tipo: "alerta", titulo: "Cuidado", texto: "Isso é perigoso." },
        { tipo: "tabela", legenda: "Uma tabela", cabecalho: ["Nome", "Valor"], linhas: [["A", "1"], ["B", "2"]] },
      ]} />,
    );

    expect(screen.getByRole("heading", { name: "Subtítulo" })).toBeInTheDocument();
    expect(screen.getByText("Um parágrafo.")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByRole("heading", { level: 2, name: "Subtítulo" })).toHaveAttribute("id", "subtitulo");
    expect(screen.getByRole("heading", { level: 3, name: "Um detalhe" })).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent("Isso é perigoso.");
    const tabela = screen.getByRole("table");
    expect(within(tabela).getAllByRole("columnheader").map((c) => c.textContent)).toEqual(["Nome", "Valor"]);
    expect(within(tabela).getByRole("rowheader", { name: "B" })).toBeInTheDocument();
    expect(screen.getByText("Uma tabela")).toBeInTheDocument();
    expect(container.querySelector("pre code")).toHaveTextContent("int x = 1;");
    expect(screen.getByText("Exemplo.java")).toBeInTheDocument();
    expect(screen.getByText("Atenção")).toBeInTheDocument();
  });
});

describe("BlocoDeCodigo", () => {
  afterEach(() => vi.restoreAllMocks());

  it("usa o nome da linguagem quando não há legenda", () => {
    render(<BlocoDeCodigo linguagem="bash" texto="npm test" />);
    expect(screen.getByText("Terminal")).toBeInTheDocument();
    render(<BlocoDeCodigo linguagem="rust" texto="fn main() {}" />);
    expect(screen.getByText("rust")).toBeInTheDocument();
  });

  it("copia o código e avisa", async () => {
    const usuario = userEvent.setup();
    const escrever = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<BlocoDeCodigo linguagem="java" texto="int x = 1;" />);

    await usuario.click(screen.getByRole("button", { name: /Copiar/ }));

    expect(escrever).toHaveBeenCalledWith("int x = 1;");
    expect(await screen.findByText("Copiado")).toBeInTheDocument();
  });

  it("avisa quando não consegue copiar", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("negado"));
    render(<BlocoDeCodigo linguagem="java" texto="int x = 1;" />);

    await usuario.click(screen.getByRole("button", { name: /Copiar/ }));

    expect(await screen.findByText("Não foi possível copiar")).toBeInTheDocument();
  });
});

describe("BotaoDeEntrada", () => {
  beforeEach(() => perfil.mockReset());

  it("mostra Entrar sem sessão", async () => {
    perfil.mockResolvedValue(null);
    render(<BotaoDeEntrada />);

    await waitFor(() => expect(perfil).toHaveBeenCalled());
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/");
  });

  it("mostra Ir para o app com sessão", async () => {
    perfil.mockResolvedValue({ login: "ana" } as Perfil);
    render(<BotaoDeEntrada />);

    expect(await screen.findByRole("link", { name: "Ir para o app" })).toHaveAttribute("href", "/dashboard");
  });
});
