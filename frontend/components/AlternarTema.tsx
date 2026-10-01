"use client";
import { useEffect, useState } from "react";
import { Moon, Palette, Sun } from "lucide-react";
import { aplicarTema, TEMA_PADRAO, TEMAS, temaAtual, type Tema } from "@/lib/tema";

/** Botão do topo: passa para o próximo tema (preto, roxo, claro). Todos ficam em Configurações. */
export default function AlternarTema() {
  const [tema, setTema] = useState<Tema>(TEMA_PADRAO);

  useEffect(() => {
    setTema(temaAtual());
    const aoMudar = () => setTema(temaAtual());
    window.addEventListener("koda-tema", aoMudar);
    // Liga a transição só depois da primeira pintura, para não animar o carregamento da página.
    const id = requestAnimationFrame(() => document.documentElement.classList.add("com-transicao"));
    return () => {
      window.removeEventListener("koda-tema", aoMudar);
      cancelAnimationFrame(id);
    };
  }, []);

  const indice = TEMAS.findIndex((t) => t.id === tema);
  const proximo = TEMAS[(indice + 1) % TEMAS.length];
  const Icone = tema === "claro" ? Sun : tema === "roxo" ? Palette : Moon;

  return (
    <button
      onClick={() => aplicarTema(proximo.id)}
      aria-label={`Trocar para o tema ${proximo.nome}`}
      title={`Tema atual: ${TEMAS[indice]?.nome}. Clique para ${proximo.nome}.`}
      className="grid size-11 place-items-center rounded-[14px] border border-line bg-surface transition duration-200 hover:scale-110 hover:bg-tint-2 active:scale-95"
    >
      <Icone className="size-5" />
    </button>
  );
}
