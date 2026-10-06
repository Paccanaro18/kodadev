import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LaboratorioDeRedes from "./LaboratorioDeRedes";
import ListaDeRedes from "./ListaDeRedes";
import type { PropriedadesDoEditor } from "./EditorDeRede";
import { reiniciarEstudoParaTestes } from "@/lib/estudoStore";
import { CHAVE_DO_ESTUDO } from "@/lib/progressoDeEstudo";

vi.mock("../AppShell", () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock("@/lib/api", async (importarOriginal) => {
  const original = await importarOriginal<typeof import("@/lib/api")>();
  return { ...original, buscarPerfil: vi.fn().mockResolvedValue(null) };
});
vi.mock("next/dynamic", () => ({
  default: () => function EditorSimulado(props: PropriedadesDoEditor) {
    return (
      <div data-testid="editor-simulado">
        {props.rede.dispositivos.map((d) => (
          <button key={d.id} type="button" onClick={() => props.aoSelecionarDispositivo(d.id)}>Selecionar {d.nome}</button>
        ))}
        {props.rede.cabos.map((c) => (
          <button key={c.id} type="button" onClick={() => props.aoSelecionarCabo(c.id)}>Cabo {c.id}</button>
        ))}
        <button type="button" onClick={() => props.aoLigar("pc-1", "pc-2")}>Ligar PC1 ao PC2</button>
        <button type="button" onClick={() => props.aoLigar("pc-1", "pc-1")}>Ligar PC1 a si</button>
        <button type="button" onClick={() => props.aoMover("pc-1", { x: 5, y: 5 })}>Mover PC1</button>
        <span data-testid="pacote">{props.passoAtual?.rotulo ?? ""}</span>
      </div>
    );
  },
}));

beforeEach(() => {
  window.localStorage.clear();
  reiniciarEstudoParaTestes();
});

function progressoSalvo() {
  return JSON.parse(window.localStorage.getItem(CHAVE_DO_ESTUDO) ?? "{}");
}

describe("ListaDeRedes", () => {
  it("lista as aulas e os desafios com link para cada laboratório", () => {
    render(<ListaDeRedes />);
    expect(screen.getByRole("heading", { name: "Redes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Seu primeiro cabo/ })).toHaveAttribute("href", "/redes/primeiro-cabo");
    expect(screen.getByRole("link", { name: /A filial sem rota/ })).toHaveAttribute("href", "/redes/filial-sem-rota");
    expect(screen.getAllByLabelText("Não concluído")).toHaveLength(6);
    expect(screen.getByText(/0 de 6 laboratórios concluídos/)).toBeInTheDocument();
  });

  it("marca como concluídos os laboratórios do progresso salvo", () => {
    window.localStorage.setItem(CHAVE_DO_ESTUDO, JSON.stringify({ redes: { licoes: [], notas: {}, desafios: ["primeiro-cabo"] } }));
    render(<ListaDeRedes />);
    expect(screen.getAllByLabelText("Concluído")).toHaveLength(1);
    expect(screen.getByText(/1 de 6 laboratórios concluídos/)).toBeInTheDocument();
  });
});

describe("LaboratorioDeRedes", () => {
  it("avisa quando o laboratório não existe", () => {
    render(<LaboratorioDeRedes slug="nao-existe" />);
    expect(screen.getByText("Laboratório não encontrado.")).toBeInTheDocument();
  });

  it("conclui a primeira aula montando a rede e salva o progresso", async () => {
    render(<LaboratorioDeRedes slug="primeiro-cabo" />);
    const usuario = userEvent.setup();

    expect(screen.getByText("0 de 4")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Ligar PC1 ao PC2" }));
    expect(screen.getByText("1 de 4")).toBeInTheDocument();

    for (const [nome, ip] of [["PC1", "192.168.0.10"], ["PC2", "192.168.0.20"]]) {
      await usuario.click(screen.getByRole("button", { name: `Selecionar ${nome}` }));
      await usuario.type(screen.getByLabelText("Endereço IP"), ip);
      await usuario.type(screen.getByLabelText("Máscara"), "255.255.255.0");
    }

    expect(screen.getByText("4 de 4")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Laboratório concluído");
    expect(progressoSalvo().redes.desafios).toContain("primeiro-cabo");
  });

  it("executa comandos no terminal e mostra os quadros trocados", async () => {
    render(<LaboratorioDeRedes slug="gateway-e-roteador" />);
    const usuario = userEvent.setup();

    await usuario.click(screen.getByRole("button", { name: "Selecionar PC1" }));
    await usuario.click(screen.getByRole("tab", { name: "Terminal" }));
    const entrada = screen.getByLabelText("PC1>");
    await usuario.type(entrada, "ping 10.0.2.10{Enter}");
    const registro = screen.getByRole("log", { name: "Terminal de PC1" });
    expect(within(registro).getAllByText(/Falha geral/, { selector: "pre" })).toHaveLength(4);
    expect(within(registro).getByText(/Diagnóstico: PC1: 10\.0\.2\.10 está fora da rede/)).toBeInTheDocument();

    await usuario.type(entrada, "ipconfig{Enter}");
    expect(within(registro).getByText(/10\.0\.1\.10/, { selector: "pre" })).toBeInTheDocument();
    await usuario.type(entrada, "clear{Enter}");
    expect(within(registro).queryByText(/ipconfig/)).not.toBeInTheDocument();
  });

  it("anima os pacotes e lista cada quadro", async () => {
    render(<LaboratorioDeRedes slug="gateway-e-roteador" />);
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole("button", { name: "Selecionar PC1" }));
    await usuario.click(screen.getByRole("tab", { name: "Configuração" }));
    await usuario.type(screen.getByLabelText("Gateway padrão"), "10.0.1.1");
    await usuario.click(screen.getByRole("tab", { name: "Terminal" }));
    await usuario.type(screen.getByLabelText("PC1>"), "ping 10.0.2.10{Enter}");

    const quadros = screen.getByRole("list", { name: "Quadros enviados" });
    expect(within(quadros).getAllByText("ARP").length).toBeGreaterThan(0);
    expect(screen.getByTestId("pacote").textContent).toContain("ARP");
  });

  it("adiciona dispositivos da paleta e permite removê-los", async () => {
    render(<LaboratorioDeRedes slug="gateway-e-roteador" />);
    const usuario = userEvent.setup();
    await usuario.click(within(screen.getByRole("toolbar", { name: "Adicionar dispositivos" })).getByRole("button", { name: /PC/ }));
    await usuario.click(screen.getByRole("button", { name: "Selecionar PC2" }));
    await usuario.click(screen.getByRole("button", { name: "Remover dispositivo" }));
    expect(screen.queryByRole("button", { name: "Selecionar PC2" })).not.toBeInTheDocument();
  });

  it("configura VLAN de portas do switch e rotas do roteador", async () => {
    render(<LaboratorioDeRedes slug="vlan-trocada" />);
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole("button", { name: "Selecionar Switch1" }));
    const porta = screen.getByLabelText("VLAN da porta Fa0/4");
    expect(porta).toHaveValue(10);
    await usuario.clear(porta);
    await usuario.type(porta, "20");
    expect(screen.getByLabelText("VLAN da porta Fa0/4")).toHaveValue(20);
    expect(screen.getByText("3 de 3")).toBeInTheDocument();
  });

  it("remove cabos e mostra a dica e a solução de um desafio", async () => {
    render(<LaboratorioDeRedes slug="mascara-que-nao-fecha" />);
    const usuario = userEvent.setup();
    expect(screen.queryByText(/máscara 255.255.255.252/)).not.toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: /Ver dicas/ }));
    await usuario.click(screen.getByRole("button", { name: /Ver uma dica/ }));
    expect(screen.getByText(/só enxerga quatro endereços/)).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: /Ver a solução/ }));
    expect(screen.getByText(/PC3: troque o IP para 192.168.1.30/)).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Cabo cabo-1" }));
    await usuario.click(screen.getByRole("button", { name: "Remover cabo" }));
    expect(screen.queryByRole("button", { name: "Cabo cabo-1" })).not.toBeInTheDocument();
  });

  it("recomeça o laboratório do zero", async () => {
    render(<LaboratorioDeRedes slug="primeiro-cabo" />);
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole("button", { name: "Ligar PC1 ao PC2" }));
    expect(screen.getByText("1 de 4")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Recomeçar" }));
    expect(screen.getByText("0 de 4")).toBeInTheDocument();
  });

  it("ignora ligar um dispositivo a ele mesmo e avisa quando não há porta livre", async () => {
    render(<LaboratorioDeRedes slug="primeiro-cabo" />);
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole("button", { name: "Ligar PC1 a si" }));
    expect(screen.getByText("0 de 4")).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Ligar PC1 ao PC2" }));
    await usuario.click(screen.getByRole("button", { name: "Ligar PC1 ao PC2" }));
    expect(screen.getByRole("alert")).toHaveTextContent("PC1 não tem porta livre.");
    await usuario.click(screen.getByRole("button", { name: "Mover PC1" }));
  });
});
