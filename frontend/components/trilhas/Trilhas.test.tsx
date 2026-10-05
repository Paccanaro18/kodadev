import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AcoesDoModulo from "./AcoesDoModulo";
import CartaoDaTrilha from "./CartaoDaTrilha";
import CheckpointDaTrilha from "./CheckpointDaTrilha";
import Questionario from "./Questionario";
import Roteiro from "./Roteiro";
import { reiniciarEstudoParaTestes } from "@/lib/estudoStore";
import { CHAVE_DO_ESTUDO } from "@/lib/progressoDeEstudo";
import { itensDaTrilha, modulosDaTrilha, resumirTrilha, trilhaPorSlug, type Questao } from "@/lib/trilhas";

vi.mock("@/lib/api", async (importarOriginal) => {
  const original = await importarOriginal<typeof import("@/lib/api")>();
  return { ...original, buscarPerfil: vi.fn().mockResolvedValue(null) };
});

const questoes: Questao[] = [
  { enunciado: "Quanto é 1 + 1?", opcoes: ["1", "2", "3"], correta: 1, explicacao: "Um mais um dá dois, e isso não muda." },
  { enunciado: "Qual a saída?\n\nprint(2 * 3)", opcoes: ["5", "6", "7"], correta: 1, explicacao: "Dois vezes três é seis, sem surpresa nenhuma." },
];

const java = trilhaPorSlug("java")!;
const resumoJava = resumirTrilha(java);
const itensDoJava = itensDaTrilha(java);
const primeiroModulo = itensDoJava[0];

beforeEach(() => {
  window.localStorage.clear();
  reiniciarEstudoParaTestes();
});

describe("Questionario", () => {
  it("mostra a explicação, marca certo e errado e calcula a nota", async () => {
    const aoFinalizar = vi.fn();
    render(<Questionario questoes={questoes} notaMinima={0.6} aoFinalizar={aoFinalizar} />);
    const usuario = userEvent.setup();

    expect(screen.getByText("0 de 2 respondidas")).toBeInTheDocument();
    expect(screen.getByText("print(2 * 3)")).toBeInTheDocument();

    const primeira = screen.getByRole("radiogroup", { name: "Opções da questão 1" });
    await usuario.click(within(primeira).getByRole("radio", { name: /^A/ }));
    expect(screen.getByText(/Não foi dessa vez/)).toBeInTheDocument();
    expect(within(primeira).getByLabelText("Resposta certa")).toBeInTheDocument();
    expect(within(primeira).getByLabelText("Sua resposta, errada")).toBeInTheDocument();
    expect(aoFinalizar).not.toHaveBeenCalled();

    const segunda = screen.getByRole("radiogroup", { name: "Opções da questão 2" });
    await usuario.click(within(segunda).getByRole("radio", { name: /^B/ }));

    expect(aoFinalizar).toHaveBeenCalledTimes(1);
    expect(aoFinalizar).toHaveBeenCalledWith(0.5);
    expect(screen.getByRole("heading", { name: /Você acertou 1 de 2 \(50%\)/ })).toBeInTheDocument();
    expect(screen.getByText(/o mínimo é 60%/)).toBeInTheDocument();
  });

  it("não deixa mudar a resposta depois de dada", async () => {
    const aoFinalizar = vi.fn();
    render(<Questionario questoes={questoes} notaMinima={0.6} aoFinalizar={aoFinalizar} />);
    const usuario = userEvent.setup();
    const primeira = screen.getByRole("radiogroup", { name: "Opções da questão 1" });

    await usuario.click(within(primeira).getByRole("radio", { name: /^A/ }));

    for (const opcao of within(primeira).getAllByRole("radio")) expect(opcao).toBeDisabled();
    expect(screen.getByText("1 de 2 respondidas")).toBeInTheDocument();
  });

  it("aprova com a nota mínima e deixa refazer do zero", async () => {
    const aoFinalizar = vi.fn();
    render(<Questionario questoes={questoes} notaMinima={0.6} aoFinalizar={aoFinalizar} melhorNota={0.5} />);
    const usuario = userEvent.setup();

    expect(screen.getByText("Melhor nota: 50%")).toBeInTheDocument();
    await usuario.click(within(screen.getByRole("radiogroup", { name: "Opções da questão 1" })).getByRole("radio", { name: /^B/ }));
    await usuario.click(within(screen.getByRole("radiogroup", { name: "Opções da questão 2" })).getByRole("radio", { name: /^B/ }));

    expect(aoFinalizar).toHaveBeenCalledWith(1);
    expect(screen.getByText("Muito bem: esta etapa está concluída.")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Refazer" }));
    expect(screen.getByText("0 de 2 respondidas")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Você acertou/ })).not.toBeInTheDocument();
  });
});

describe("Roteiro", () => {
  it("convida a começar e mostra as etapas, os checkpoints e o que vem a seguir", () => {
    render(<Roteiro trilha={resumoJava} />);

    expect(screen.getByRole("link", { name: /Começar a trilha/ })).toHaveAttribute("href", `/aprenda/java/${primeiroModulo.slug}`);
    expect(screen.getByRole("progressbar", { name: "Seu progresso nesta trilha" })).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getAllByText("Checkpoint")).toHaveLength(itensDoJava.filter((item) => item.tipo === "checkpoint").length);
    expect(screen.getAllByText("Em breve").length).toBe(resumoJava.planejados.length);
  });

  it("continua do primeiro item pendente e mostra o progresso guardado", async () => {
    window.localStorage.setItem(CHAVE_DO_ESTUDO, JSON.stringify({
      java: { licoes: [primeiroModulo.slug], notas: { [primeiroModulo.slug]: 1 }, desafios: [] },
    }));
    render(<Roteiro trilha={resumoJava} />);

    const continuar = await screen.findByRole("link", { name: /Continuar de onde parou/ });
    expect(continuar).toHaveAttribute("href", `/aprenda/java/${itensDoJava[1].slug}`);
    expect(screen.getByRole("progressbar", { name: "Seu progresso nesta trilha" })).toHaveAttribute("aria-valuenow", String(Math.round(100 / itensDoJava.length)));
    expect(screen.getAllByLabelText("Concluído")).toHaveLength(1);
  });
});

describe("CartaoDaTrilha", () => {
  it("mostra a trilha, o tamanho dela e o progresso", async () => {
    window.localStorage.setItem(CHAVE_DO_ESTUDO, JSON.stringify({
      java: { licoes: [primeiroModulo.slug], notas: { [primeiroModulo.slug]: 1 }, desafios: [] },
    }));
    render(<CartaoDaTrilha trilha={resumoJava} />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/aprenda/java");
    expect(screen.getByRole("heading", { name: resumoJava.titulo })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${modulosDaTrilha(java).length} módulos prontos`))).toBeInTheDocument();
    expect(await screen.findByRole("progressbar", { name: "Seu progresso" })).toHaveAttribute("aria-valuenow", String(Math.round(100 / itensDoJava.length)));
  });
});

describe("AcoesDoModulo", () => {
  const desafio = {
    titulo: "Recibo",
    enunciado: "Escreva um programa.",
    requisitos: ["Faça A", "Faça B"],
    criterios: ["Compila", "Roda"],
    dica: "Comece pequeno.",
  };

  it("marca a lição, registra o teste e conclui o módulo", async () => {
    render(<AcoesDoModulo trilha="java" modulo="m1" questoes={questoes} desafio={desafio} />);
    const usuario = userEvent.setup();

    await usuario.click(screen.getByRole("button", { name: "Marcar como lida" }));
    expect(screen.getByRole("button", { name: "Lição lida" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText(/Módulo concluído/)).not.toBeInTheDocument();

    await usuario.click(within(screen.getByRole("radiogroup", { name: "Opções da questão 1" })).getByRole("radio", { name: /^B/ }));
    await usuario.click(within(screen.getByRole("radiogroup", { name: "Opções da questão 2" })).getByRole("radio", { name: /^B/ }));

    expect(screen.getByText(/Módulo concluído/)).toBeInTheDocument();
    const guardado = JSON.parse(window.localStorage.getItem(CHAVE_DO_ESTUDO) ?? "{}");
    expect(guardado.java.licoes).toEqual(["m1"]);
    expect(guardado.java.notas.m1).toBe(1);
  });

  it("só libera declarar o desafio concluído com todos os critérios marcados", async () => {
    render(<AcoesDoModulo trilha="java" modulo="m1" questoes={questoes} desafio={desafio} />);
    const usuario = userEvent.setup();
    const declarar = screen.getByRole("button", { name: "Declarar desafio concluído" });

    expect(declarar).toBeDisabled();
    expect(screen.getByText("Marque todos os critérios para liberar.")).toBeInTheDocument();
    expect(screen.getByText("Comece pequeno.")).toBeInTheDocument();

    await usuario.click(screen.getByRole("checkbox", { name: "Compila" }));
    expect(declarar).toBeDisabled();
    await usuario.click(screen.getByRole("checkbox", { name: "Roda" }));
    expect(declarar).toBeEnabled();

    await usuario.click(declarar);
    expect(screen.getByRole("button", { name: "Desafio concluído" })).toHaveAttribute("aria-pressed", "true");
    expect(JSON.parse(window.localStorage.getItem(CHAVE_DO_ESTUDO) ?? "{}").java.desafios).toEqual(["m1"]);
  });

  it("carrega do navegador o que a pessoa já tinha feito", async () => {
    window.localStorage.setItem(CHAVE_DO_ESTUDO, JSON.stringify({ java: { licoes: ["m1"], notas: { m1: 0.9 }, desafios: ["m1"] } }));
    render(<AcoesDoModulo trilha="java" modulo="m1" questoes={questoes} desafio={desafio} />);

    expect(await screen.findByRole("button", { name: "Lição lida" })).toBeInTheDocument();
    expect(screen.getByText("Melhor nota: 90%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Desafio concluído" })).toBeEnabled();
    expect(screen.getByText(/Módulo concluído/)).toBeInTheDocument();
  });
});

describe("CheckpointDaTrilha", () => {
  it("guarda a nota e avisa quando a pessoa já foi aprovada antes", async () => {
    window.localStorage.setItem(CHAVE_DO_ESTUDO, JSON.stringify({ java: { licoes: [], notas: { cp: 0.8 }, desafios: [] } }));
    render(<CheckpointDaTrilha trilha="java" slug="cp" questoes={questoes} notaMinima={0.7} />);

    expect(await screen.findByText(/Você já foi aprovado neste checkpoint/)).toBeInTheDocument();
    const usuario = userEvent.setup();
    await usuario.click(within(screen.getByRole("radiogroup", { name: "Opções da questão 1" })).getByRole("radio", { name: /^B/ }));
    await usuario.click(within(screen.getByRole("radiogroup", { name: "Opções da questão 2" })).getByRole("radio", { name: /^B/ }));

    expect(JSON.parse(window.localStorage.getItem(CHAVE_DO_ESTUDO) ?? "{}").java.notas.cp).toBe(1);
  });

  it("não mostra aprovação para quem nunca fez", () => {
    render(<CheckpointDaTrilha trilha="java" slug="cp" questoes={questoes} notaMinima={0.7} />);
    expect(screen.queryByText(/Você já foi aprovado/)).not.toBeInTheDocument();
  });
});
