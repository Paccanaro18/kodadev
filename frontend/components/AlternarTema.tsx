"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Tema = "escuro" | "claro";

function temaAtual(): Tema {
  return document.documentElement.dataset.tema === "claro" ? "claro" : "escuro";
}

/** Alterna entre o tema escuro (padrão) e o claro e guarda a escolha neste navegador. */
export default function AlternarTema() {
  const [tema, setTema] = useState<Tema>("escuro");

  useEffect(() => {
    setTema(temaAtual());
    // Liga a transição só depois da primeira pintura, para não animar o carregamento da página.
    const id = requestAnimationFrame(() => document.documentElement.classList.add("com-transicao"));
    return () => cancelAnimationFrame(id);
  }, []);

  function alternar() {
    const novo: Tema = temaAtual() === "escuro" ? "claro" : "escuro";
    document.documentElement.dataset.tema = novo;
    setTema(novo);
    try {
      localStorage.setItem("koda-tema", novo);
    } catch {
      // Sem armazenamento disponível: o tema vale só até recarregar a página.
    }
  }

  const paraClaro = tema === "escuro";

  return (
    <button
      onClick={alternar}
      aria-label={paraClaro ? "Usar tema claro" : "Usar tema escuro"}
      title={paraClaro ? "Tema claro" : "Tema escuro"}
      className="grid size-11 place-items-center rounded-[14px] border border-line bg-surface transition duration-200 hover:scale-110 hover:bg-tint-2 active:scale-95"
    >
      {paraClaro ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
