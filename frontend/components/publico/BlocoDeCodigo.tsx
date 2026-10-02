"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

const ROTULOS: Record<string, string> = {
  java: "Java",
  typescript: "TypeScript",
  python: "Python",
  bash: "Terminal",
};

/** Um trecho de código com legenda e botão de copiar. Sem acesso à área de transferência, o botão avisa e o texto segue selecionável. */
export default function BlocoDeCodigo({ linguagem, texto, legenda }: { linguagem: string; texto: string; legenda?: string }) {
  const [estado, setEstado] = useState<"parado" | "copiado" | "falhou">("parado");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("copiado");
    } catch {
      setEstado("falhou");
    }
    setTimeout(() => setEstado("parado"), 2000);
  }

  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-tint">
      <figcaption className="flex items-center justify-between gap-3 border-b border-line px-4 py-2 text-xs text-ink-2">
        <span className="truncate font-semibold">{legenda ?? ROTULOS[linguagem] ?? linguagem}</span>
        <button type="button" onClick={copiar} aria-live="polite"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 font-semibold text-ink transition duration-200 hover:bg-tint-2 active:scale-95">
          {estado === "copiado" ? <Check className="size-3.5 text-ok" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          {estado === "copiado" ? "Copiado" : estado === "falhou" ? "Não foi possível copiar" : "Copiar"}
        </button>
      </figcaption>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-ink"><code>{texto}</code></pre>
    </figure>
  );
}
