"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";

export type LinhaDoTerminal = { tipo: "entrada" | "saida"; texto: string };

export default function TerminalDeRede({ nome, linhas, aoExecutar }: {
  nome: string;
  linhas: LinhaDoTerminal[];
  aoExecutar: (linha: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const [historico, setHistorico] = useState<string[]>([]);
  const [posicao, setPosicao] = useState<number | null>(null);
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fim.current?.scrollIntoView?.({ block: "nearest" });
  }, [linhas]);

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const linha = texto.trim();
    if (linha !== "") setHistorico((h) => [...h, linha]);
    setPosicao(null);
    setTexto("");
    aoExecutar(texto);
  }

  function navegar(tecla: string) {
    if (historico.length === 0) return;
    if (tecla === "ArrowUp") {
      const nova = posicao === null ? historico.length - 1 : Math.max(0, posicao - 1);
      setPosicao(nova);
      setTexto(historico[nova]);
    } else if (tecla === "ArrowDown" && posicao !== null) {
      const nova = posicao + 1;
      setPosicao(nova >= historico.length ? null : nova);
      setTexto(nova >= historico.length ? "" : historico[nova]);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[#0b0b10] font-mono text-[13px] text-[#e4e4ee]">
      <div role="log" aria-label={`Terminal de ${nome}`} className="h-48 overflow-y-auto px-4 py-3">
        {linhas.length === 0 && <p className="text-[#8b8ba0]">Digite help para ver os comandos.</p>}
        {linhas.map((linha, indice) => (
          <pre key={indice} className={`whitespace-pre-wrap ${linha.tipo === "entrada" ? "text-[#a7a1ff]" : ""}`}>{linha.texto}</pre>
        ))}
        <div ref={fim} />
      </div>
      <form onSubmit={enviar} className="flex items-center gap-2 border-t border-white/10 px-4 py-2.5">
        <label htmlFor={`terminal-${nome}`} className="font-bold text-[#a7a1ff]">{nome}&gt;</label>
        <input id={`terminal-${nome}`} value={texto} onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              e.preventDefault();
              navegar(e.key);
            }
          }}
          autoComplete="off" spellCheck={false} maxLength={120}
          className="min-w-0 flex-1 bg-transparent text-[#e4e4ee] outline-none placeholder:text-[#6b6b80]" placeholder="ping 192.168.0.20" />
      </form>
    </div>
  );
}
