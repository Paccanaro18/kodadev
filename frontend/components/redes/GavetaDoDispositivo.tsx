"use client";
import { useEffect, type ReactNode } from "react";
import { Monitor, Network, Router, Server, X } from "lucide-react";
import type { Dispositivo, TipoDeDispositivo } from "@/lib/redes/tipos";

const ICONES: Record<TipoDeDispositivo, typeof Monitor> = { pc: Monitor, servidor: Server, switch: Network, roteador: Router };
const ROTULOS: Record<TipoDeDispositivo, string> = { pc: "Computador", servidor: "Servidor", switch: "Switch", roteador: "Roteador" };

export type AbaDoDispositivo = "config" | "terminal";

export default function GavetaDoDispositivo({ dispositivo, aba, aoMudarAba, aoFechar, children }: {
  dispositivo: Dispositivo;
  aba: AbaDoDispositivo;
  aoMudarAba: (aba: AbaDoDispositivo) => void;
  aoFechar: () => void;
  children: ReactNode;
}) {
  const Icone = ICONES[dispositivo.tipo];

  useEffect(() => {
    const aoApertar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", aoApertar);
    return () => window.removeEventListener("keydown", aoApertar);
  }, [aoFechar]);

  return (
    <aside role="dialog" aria-label={`Dispositivo ${dispositivo.nome}`}
      className="fixed inset-y-0 right-0 z-40 flex w-full flex-col border-l border-line bg-surface shadow-lift sm:w-[480px]">
      <header className="flex items-center gap-3 border-b border-line px-5 py-4">
        <div className="grid size-11 place-items-center rounded-xl bg-koda-soft text-koda-texto"><Icone className="size-5" aria-hidden="true" /></div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-bold text-ink">{dispositivo.nome}</div>
          <div className="text-xs text-ink-2">{ROTULOS[dispositivo.tipo]}</div>
        </div>
        <button type="button" onClick={aoFechar} aria-label="Fechar o painel"
          className="grid size-10 place-items-center rounded-xl text-ink-2 transition duration-200 hover:bg-tint active:scale-95">
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>
      <div role="tablist" aria-label="Painel do dispositivo" className="flex gap-2 px-5 pt-4">
        {(["config", "terminal"] as const).map((valor) => (
          <button key={valor} role="tab" type="button" aria-selected={aba === valor} onClick={() => aoMudarAba(valor)}
            className={`h-9 rounded-xl px-4 text-[13px] font-bold transition duration-200 active:scale-95 ${aba === valor ? "bg-koda text-white" : "bg-tint text-ink"}`}>
            {valor === "config" ? "Configuração" : "Terminal"}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
    </aside>
  );
}
