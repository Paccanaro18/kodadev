"use client";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { aplicarTema, TEMA_PADRAO, TEMAS, temaAtual, type Tema } from "@/lib/tema";

/** Escolha do tema em Configurações: cada opção mostra uma prévia das cores e vale na hora. */
export default function EscolhaDeTema() {
  const [tema, setTema] = useState<Tema>(TEMA_PADRAO);

  useEffect(() => {
    setTema(temaAtual());
    const aoMudar = () => setTema(temaAtual());
    window.addEventListener("koda-tema", aoMudar);
    return () => window.removeEventListener("koda-tema", aoMudar);
  }, []);

  return (
    <div role="radiogroup" aria-label="Tema" className="grid gap-3 sm:grid-cols-3">
      {TEMAS.map((t) => {
        const ativo = t.id === tema;
        return (
          <button
            key={t.id}
            role="radio"
            aria-checked={ativo}
            onClick={() => aplicarTema(t.id)}
            className={`group rounded-2xl border p-3 text-left transition duration-200 hover:-translate-y-0.5 active:scale-[.98] ${ativo ? "border-koda bg-koda-soft" : "border-line-2 bg-tint hover:bg-tint-2"}`}
          >
            <div className="relative h-20 overflow-hidden rounded-xl border border-line-2" style={{ background: t.cores[0] }}>
              <div className="absolute top-2.5 left-2.5 h-10 w-16 rounded-lg" style={{ background: t.cores[1] }} />
              <div className="absolute top-2.5 right-2.5 h-4 w-8 rounded-full" style={{ background: t.cores[2] }} />
              <div className="absolute right-2.5 bottom-2.5 h-2 w-12 rounded-full" style={{ background: t.cores[2], opacity: 0.55 }} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-sm font-bold">{t.nome}</span>
              {ativo && <span className="grid size-5 place-items-center rounded-full bg-koda text-white"><Check className="size-3" strokeWidth={3} /></span>}
            </div>
            <p className="mt-0.5 text-xs leading-snug text-ink-2">{t.descricao}</p>
          </button>
        );
      })}
    </div>
  );
}
