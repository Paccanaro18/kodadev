"use client";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconeDeDispositivo, ROTULO_DO_DISPOSITIVO } from "./IconesDeRede";
import type { Dispositivo } from "@/lib/redes/tipos";

export type AbaDoDispositivo = "config" | "terminal";
export type Ancora = { x: number; y: number };

const LARGURA = 430;
const ALTURA_DA_AREA = 520;
const MARGEM = 8;

function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.max(minimo, Math.min(maximo, valor));
}

export default function JanelaDoDispositivo({ dispositivo, ancora, aba, aoMudarAba, aoFechar, children }: {
  dispositivo: Dispositivo;
  ancora: Ancora;
  aba: AbaDoDispositivo;
  aoMudarAba: (aba: AbaDoDispositivo) => void;
  aoFechar: () => void;
  children: ReactNode;
}) {
  const janela = useRef<HTMLElement>(null);
  const [posicao, setPosicao] = useState<Ancora>({ x: ancora.x - 12, y: ancora.y - 12 });
  const arrasto = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    setPosicao({ x: ancora.x - 12, y: ancora.y - 12 });
  }, [ancora.x, ancora.y, dispositivo.id]);

  useEffect(() => {
    const aoApertar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", aoApertar);
    return () => window.removeEventListener("keydown", aoApertar);
  }, [aoFechar]);

  const area = janela.current?.parentElement;
  const largura = area ? Math.min(LARGURA, area.clientWidth - 2 * MARGEM) : LARGURA;
  const esquerda = limitar(posicao.x, MARGEM, Math.max(MARGEM, (area?.clientWidth ?? LARGURA + 2 * MARGEM) - largura - MARGEM));
  const topo = limitar(posicao.y, MARGEM, ALTURA_DA_AREA - 260);

  function comecar(evento: PointerEvent<HTMLElement>) {
    if ((evento.target as HTMLElement).closest("button")) return;
    arrasto.current = { dx: evento.clientX - esquerda, dy: evento.clientY - topo };
    evento.currentTarget.setPointerCapture(evento.pointerId);
  }

  function mover(evento: PointerEvent<HTMLElement>) {
    if (!arrasto.current) return;
    setPosicao({ x: evento.clientX - arrasto.current.dx, y: evento.clientY - arrasto.current.dy });
  }

  return (
    <section ref={janela} role="dialog" aria-label={`Dispositivo ${dispositivo.nome}`}
      style={{ left: esquerda, top: topo, width: largura, maxHeight: ALTURA_DA_AREA - topo - MARGEM }}
      className="absolute z-30 flex flex-col overflow-hidden rounded-2xl border border-line-2 bg-surface shadow-lift">
      <header onPointerDown={comecar} onPointerMove={mover} onPointerUp={() => { arrasto.current = null; }}
        className="flex cursor-move touch-none items-center gap-3 border-b border-line bg-tint px-4 py-2.5 select-none">
        <div className="grid size-9 place-items-center rounded-lg bg-koda-soft text-koda-texto"><IconeDeDispositivo tipo={dispositivo.tipo} className="size-6" /></div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-ink">{dispositivo.nome}</div>
          <div className="text-[11px] text-ink-2">{ROTULO_DO_DISPOSITIVO[dispositivo.tipo]} · arraste para mover</div>
        </div>
        <button type="button" onClick={aoFechar} aria-label="Fechar o painel"
          className="grid size-8 place-items-center rounded-lg text-ink-2 transition duration-200 hover:bg-line active:scale-95">
          <X className="size-4" aria-hidden="true" />
        </button>
      </header>
      <div role="tablist" aria-label="Painel do dispositivo" className="flex gap-2 px-4 pt-3">
        {(["config", "terminal"] as const).map((valor) => (
          <button key={valor} role="tab" type="button" aria-selected={aba === valor} onClick={() => aoMudarAba(valor)}
            className={`h-8 rounded-lg px-3.5 text-[13px] font-bold transition duration-200 active:scale-95 ${aba === valor ? "bg-koda text-white" : "bg-tint text-ink"}`}>
            {valor === "config" ? "Configuração" : "Terminal"}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">{children}</div>
    </section>
  );
}
