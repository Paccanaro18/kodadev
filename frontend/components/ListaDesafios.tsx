"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, Eyebrow } from "./ui";
import { listarDesafios, type DesafioResumo } from "@/lib/api";
import { estaGerando, rotuloDoTipo } from "@/lib/desafio";

function Situacao({ d }: { d: DesafioResumo }) {
  const [texto, cor] = d.statusGeracao === "PRONTO" ? ["Pronto", "bg-[#e6f7ee] text-[#137a45]"]
    : d.statusGeracao === "FALHOU" ? ["Falhou", "bg-[#fdeaea] text-[#b3261e]"]
    : ["Gerando", "bg-koda-soft text-koda"];

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cor}`}>{texto}</span>;
}

function destino(d: DesafioResumo): string {
  return estaGerando(d.statusGeracao) ? `/desafio/gerando?desafio=${encodeURIComponent(d.id)}` : `/desafio/${encodeURIComponent(d.id)}`;
}

export default function ListaDesafios({ analiseId }: { analiseId: string }) {
  const [lista, setLista] = useState<DesafioResumo[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    listarDesafios(analiseId)
      .then((l) => { if (vivo) setLista(l); })
      .catch((e: unknown) => { if (vivo) setErro(e instanceof Error ? e.message : "Erro inesperado."); });
    return () => { vivo = false; };
  }, [analiseId]);

  return (
    <Card className="mt-6">
      <Eyebrow>Desafios</Eyebrow>
      {erro && <p role="alert" className="text-sm text-ink-2">{erro}</p>}
      {!erro && !lista && <div className="h-20 animate-pulse rounded-2xl bg-[#f4f1fa]" />}
      {lista && lista.length === 0 && (
        <p className="text-sm text-ink-2">Nenhum desafio ainda. Use o botão “Novo desafio” para gerar o primeiro.</p>
      )}
      {lista && lista.length > 0 && (
        <ul>
          {lista.map((d) => (
            <li key={d.id} className="border-b border-[#f4f1fa] last:border-0">
              <Link href={destino(d)} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4 text-ink transition duration-200 hover:translate-x-2 hover:bg-[#faf9ff] hover:text-ink active:translate-x-1">
                <span className="rounded-[10px] bg-koda-soft px-3 py-1 text-[13px] font-bold text-koda">{d.codigo}</span>
                <span className="min-w-[200px] flex-1 font-semibold">{d.titulo ?? (d.statusGeracao === "FALHOU" ? "Geração sem sucesso" : "Gerando o ticket…")}</span>
                <span className="text-xs text-ink-2">{rotuloDoTipo(d.tipo)} · Júnior</span>
                <Situacao d={d} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
