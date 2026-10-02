import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { infoDaLinguagem, LINGUAGENS_SUPORTADAS, rotuloDaLinguagem } from "@/lib/linguagem";
import SeloDeLinguagem from "./SeloDeLinguagem";

describe("SeloDeLinguagem", () => {
  it("mostra o nome de cada linguagem suportada", () => {
    for (const linguagem of LINGUAGENS_SUPORTADAS) {
      const { unmount } = render(<SeloDeLinguagem linguagem={linguagem} />);
      expect(screen.getByText(rotuloDaLinguagem(linguagem)!)).toBeInTheDocument();
      unmount();
    }
  });

  it("explica o selo ao passar o mouse", () => {
    render(<SeloDeLinguagem linguagem="PYTHON" />);
    expect(screen.getByTitle("Linguagem do projeto: Python")).toBeInTheDocument();
  });

  it("mostra o logo da linguagem, sem repetir o nome para leitores de tela", () => {
    const { container } = render(<SeloDeLinguagem linguagem="JAVA" />);
    const logo = container.querySelector("img");
    expect(logo).toHaveAttribute("src", "/tecnologias/java.svg");
    expect(logo).toHaveAttribute("alt", "");
  });

  it("aceita o tamanho médio", () => {
    render(<SeloDeLinguagem linguagem="TYPESCRIPT" tamanho="medio" />);
    expect(screen.getByText("TypeScript").className).toContain("text-[13px]");
  });

  it("não mostra nada sem linguagem ou com linguagem desconhecida", () => {
    const { container, rerender } = render(<SeloDeLinguagem linguagem={null} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<SeloDeLinguagem linguagem={undefined} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<SeloDeLinguagem linguagem="COBOL" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("lib/linguagem", () => {
  it("devolve nulo para linguagem desconhecida", () => {
    expect(infoDaLinguagem("COBOL")).toBeNull();
    expect(rotuloDaLinguagem(null)).toBeNull();
    expect(rotuloDaLinguagem("JAVASCRIPT")).toBe("JavaScript");
  });
});
