"use client";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

/** Sino do topo. Ainda não há notificações reais, então não finge que há: abre um aviso honesto e sem ponto vermelho. */
export default function Notificacoes() {
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e: MouseEvent) {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  return (
    <div ref={caixa} className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        aria-label="Notificações"
        aria-expanded={aberto}
        className="grid size-11 place-items-center rounded-[14px] border border-[#efecf7] bg-white transition duration-200 hover:scale-110 hover:-rotate-6 hover:bg-[#f3f1ff] active:scale-95"
      >
        <Bell className="size-5" />
      </button>
      {aberto && (
        <div role="dialog" aria-label="Notificações" className="absolute top-14 right-0 z-30 w-72 rounded-2xl border border-[#efecf7] bg-white p-5 text-center shadow-soft">
          <div className="text-sm font-bold">Nenhuma notificação</div>
          <p className="mt-1.5 text-[13px] leading-snug text-ink-2">Avisos sobre os seus desafios vão aparecer aqui em breve.</p>
        </div>
      )}
    </div>
  );
}
