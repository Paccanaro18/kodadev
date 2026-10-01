import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import AlternarTema from "./AlternarTema";
import EscolhaDeTema from "./EscolhaDeTema";

describe("EscolhaDeTema", () => {
  it("mostra os três temas com o preto marcado por padrão", () => {
    render(<EscolhaDeTema />);

    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: /^Preto/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /^Roxo escuro/ })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: /^Claro/ })).toHaveAttribute("aria-checked", "false");
  });

  it("aplica o tema escolhido na hora, guarda a escolha e atualiza a marcação", async () => {
    render(<EscolhaDeTema />);

    await userEvent.click(screen.getByRole("radio", { name: /^Roxo escuro/ }));

    expect(document.documentElement.dataset.tema).toBe("roxo");
    expect(localStorage.getItem("koda-tema")).toBe("roxo");
    expect(screen.getByRole("radio", { name: /^Roxo escuro/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /^Preto/ })).toHaveAttribute("aria-checked", "false");
  });

  it("começa marcando o tema que já estava aplicado na página", () => {
    document.documentElement.dataset.tema = "claro";
    render(<EscolhaDeTema />);

    expect(screen.getByRole("radio", { name: /^Claro/ })).toHaveAttribute("aria-checked", "true");
  });
});

describe("AlternarTema", () => {
  it("passa pelos três temas em sequência e volta ao primeiro", async () => {
    render(<AlternarTema />);

    expect(screen.getByRole("button", { name: "Trocar para o tema Roxo escuro" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button"));
    expect(document.documentElement.dataset.tema).toBe("roxo");

    await userEvent.click(screen.getByRole("button", { name: "Trocar para o tema Claro" }));
    expect(document.documentElement.dataset.tema).toBe("claro");

    await userEvent.click(screen.getByRole("button", { name: "Trocar para o tema Preto" }));
    expect(document.documentElement.dataset.tema).toBe("preto");
  });

  it("acompanha a escolha feita em outro componente da tela", async () => {
    render(
      <>
        <AlternarTema />
        <EscolhaDeTema />
      </>,
    );

    await userEvent.click(screen.getByRole("radio", { name: /^Claro/ }));

    expect(screen.getByRole("button", { name: "Trocar para o tema Preto" })).toBeInTheDocument();
  });
});
