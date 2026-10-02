"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import IconeDeTecnologia from "../IconeDeTecnologia";
import { AULAS, aulasDaTrilha, ORDEM_DAS_TRILHAS, TRILHAS, type Trilha } from "@/lib/conteudoAprenda";

const chip = "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition duration-200 hover:-translate-y-0.5 active:scale-95";

export function iconeDaTrilha(trilha: Trilha): string | null {
  return trilha === "carreira" ? null : trilha;
}

export default function ListaDeAulas() {
  const [trilha, setTrilha] = useState<Trilha | undefined>(undefined);
  const aulas = aulasDaTrilha(trilha);

  return (
    <>
      <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filtrar por trilha">
        <button type="button" onClick={() => setTrilha(undefined)} aria-pressed={!trilha}
          className={`${chip} ${!trilha ? "bg-koda text-white" : "bg-tint text-ink"}`}>Todas ({AULAS.length})</button>
        {ORDEM_DAS_TRILHAS.map((t) => (
          <button key={t} type="button" onClick={() => setTrilha(t)} aria-pressed={trilha === t}
            className={`${chip} ${trilha === t ? "bg-koda text-white" : "bg-tint text-ink"}`}>
            {TRILHAS[t].rotulo} ({aulasDaTrilha(t).length})
          </button>
        ))}
      </div>
      {trilha && <p className="mt-4 text-sm text-ink-2">{TRILHAS[trilha].descricao}</p>}

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {aulas.map((aula) => {
          const icone = iconeDaTrilha(aula.trilha);
          return (
            <li key={aula.slug}>
              <Link href={`/aprenda/${aula.slug}`} className="flex h-full flex-col rounded-[24px] bg-surface p-6 text-ink shadow-soft transition duration-200 hover:-translate-y-1 hover:text-ink hover:shadow-lift">
                <div className="flex items-center gap-2.5 text-xs font-bold tracking-[0.1em] text-koda-texto uppercase">
                  {icone ? <IconeDeTecnologia icone={icone} /> : <BookOpen className="size-4" aria-hidden="true" />}
                  {TRILHAS[aula.trilha].rotulo}
                </div>
                <h2 className="mt-3 text-lg leading-snug font-bold">{aula.titulo}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-body">{aula.resumo}</p>
                <div className="mt-5 flex items-center justify-between text-xs text-ink-2">
                  <span>{aula.nivel} · {aula.leitura} de leitura</span>
                  <ArrowRight className="size-4 text-koda-texto" aria-hidden="true" />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
