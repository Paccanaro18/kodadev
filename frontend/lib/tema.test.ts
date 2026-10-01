import { describe, expect, it, vi } from "vitest";
import { aplicarTema, CHAVE_DO_TEMA, ehTema, TEMA_PADRAO, TEMAS, temaAtual } from "./tema";

describe("tema", () => {
  it("tem o preto como padrão e três opções", () => {
    expect(TEMA_PADRAO).toBe("preto");
    expect(TEMAS.map((t) => t.id)).toEqual(["preto", "roxo", "claro"]);
  });

  it("só aceita os três temas conhecidos", () => {
    expect(ehTema("preto")).toBe(true);
    expect(ehTema("roxo")).toBe(true);
    expect(ehTema("claro")).toBe(true);
    expect(ehTema("escuro")).toBe(false);
    expect(ehTema(undefined)).toBe(false);
    expect(ehTema(null)).toBe(false);
  });

  it("volta ao padrão quando o atributo não existe ou é desconhecido", () => {
    expect(temaAtual()).toBe("preto");
    document.documentElement.dataset.tema = "inventado";
    expect(temaAtual()).toBe("preto");
  });

  it("aplica o tema, guarda a escolha e avisa os outros componentes", () => {
    const aviso = vi.fn();
    window.addEventListener("koda-tema", aviso);

    aplicarTema("claro");

    expect(document.documentElement.dataset.tema).toBe("claro");
    expect(localStorage.getItem(CHAVE_DO_TEMA)).toBe("claro");
    expect(temaAtual()).toBe("claro");
    expect(aviso).toHaveBeenCalledTimes(1);
    window.removeEventListener("koda-tema", aviso);
  });

  it("aplica o tema mesmo quando o navegador não deixa guardar", () => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("sem armazenamento");
    };
    try {
      expect(() => aplicarTema("roxo")).not.toThrow();
      expect(document.documentElement.dataset.tema).toBe("roxo");
    } finally {
      Storage.prototype.setItem = original;
    }
  });
});
