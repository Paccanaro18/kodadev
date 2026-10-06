"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, Lightbulb } from "lucide-react";
import AppShell from "../AppShell";
import { Card, Mascot } from "../ui";
import { CartaoDeEvidencia, SeloDeNivel } from "./IdeiasEmComum";
import {
  EVIDENCIAS, filtrarIdeias, IDEIAS, NIVEIS_DE_PROJETO, ROTULO_DA_AREA, TRILHA_DE_IDEIAS,
  type AreaDeProjeto, type NivelDeProjeto,
} from "@/lib/ideias";
import { useEstudo } from "@/lib/useEstudo";

const chip = "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition duration-200 hover:-translate-y-0.5 active:scale-95";

function Filtro<T extends string>({ rotulo, opcoes, valor, aoMudar }: {
  rotulo: string; opcoes: { valor: T; rotulo: string }[]; valor: T | null; aoMudar: (novo: T | null) => void;
}) {
  return (
    <div role="group" aria-label={rotulo} className="flex flex-wrap items-center gap-2">
      <button type="button" aria-pressed={valor === null} onClick={() => aoMudar(null)} className={`${chip} ${valor === null ? "bg-koda text-white" : "bg-tint text-ink"}`}>Todos</button>
      {opcoes.map((o) => (
        <button key={o.valor} type="button" aria-pressed={valor === o.valor} onClick={() => aoMudar(o.valor)} className={`${chip} ${valor === o.valor ? "bg-koda text-white" : "bg-tint text-ink"}`}>{o.rotulo}</button>
      ))}
    </div>
  );
}

export function ConteudoDeIdeias() {
  const [nivel, setNivel] = useState<NivelDeProjeto | null>(null);
  const [area, setArea] = useState<AreaDeProjeto | null>(null);
  const { progresso } = useEstudo(TRILHA_DE_IDEIAS);
  const visiveis = useMemo(() => filtrarIdeias({ nivel, area }), [nivel, area]);
  const concluidas = IDEIAS.filter((i) => progresso.desafios.includes(i.slug)).length;
  const areas = (Object.keys(ROTULO_DA_AREA) as AreaDeProjeto[]).map((valor) => ({ valor, rotulo: ROTULO_DA_AREA[valor] }));

  return (
    <>
      <section className="rounded-[32px] bg-koda-soft p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-6">
          <Mascot name="pensando" className="h-28 shrink-0 sm:h-36" />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-koda-texto uppercase"><Lightbulb className="size-4" aria-hidden="true" />Ideias de projetos</span>
            <h1 className="mt-1 text-[30px] leading-tight font-bold tracking-tight sm:text-4xl">Não tem um projeto ainda? Ache ideias aqui</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-body">
              Nada de lista de tarefas ou clone de rede social. Cada ideia resolve uma dor real, diz o que publicar para uma pessoa que não te conhece conseguir avaliar, como ser visto e o que aquilo sinaliza para quem contrata, com a pesquisa que sustenta cada afirmação.
            </p>
            <p className="mt-3 text-sm font-semibold text-ink">{IDEIAS.length} ideias · {concluidas} concluídas por você</p>
          </div>
        </div>
      </section>

      <Card className="mt-6">
        <details>
          <summary className="cursor-pointer text-[17px] font-bold">Como escolhemos estas ideias, e o que a pesquisa diz de verdade</summary>
          <div className="mt-4 max-w-3xl space-y-3 text-[15px] leading-relaxed text-body">
            <p>Não existe estudo que prove que um projeto específico leva a um emprego específico, e desconfie de quem diga o contrário. O que dá para fazer é cruzar sinais: o que quem contrata diz priorizar, onde existe uma lacuna real no mercado, o que a engenharia mede e onde há demanda.</p>
            <p>Por isso cada ideia traz um <strong className="text-ink">sinal na carreira</strong> ligado às fontes abaixo, e cada fonte vem marcada pela força: pesquisa com método, relatório do setor ou apenas orientação e opinião. Onde o dado é fraco, dizemos.</p>
            <p>Os três critérios: o projeto resolve um problema que existe fora do tutorial, produz algo que outra pessoa consegue verificar, e dá o que contar numa entrevista.</p>
          </div>
          <ul className="mt-5 grid gap-3 md:grid-cols-2" aria-label="Fontes da pesquisa">
            {EVIDENCIAS.map((e) => <CartaoDeEvidencia key={e.id} evidencia={e} />)}
          </ul>
        </details>
      </Card>

      <div className="mt-8 grid gap-3">
        <Filtro rotulo="Filtrar por nível" opcoes={NIVEIS_DE_PROJETO.map((n) => ({ valor: n, rotulo: n }))} valor={nivel} aoMudar={setNivel} />
        <Filtro rotulo="Filtrar por área" opcoes={areas} valor={area} aoMudar={setArea} />
      </div>

      {visiveis.length === 0
        ? <p className="mt-8 text-ink-2">Nenhuma ideia com esses filtros ainda.</p>
        : (
          <ul className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visiveis.map((ideia) => {
              const feita = progresso.desafios.includes(ideia.slug);
              return (
                <li key={ideia.slug}>
                  <Link href={`/ideias/${ideia.slug}`}
                    className={`group flex h-full flex-col rounded-[24px] border p-5 text-ink transition duration-200 hover:-translate-y-1 hover:text-ink hover:shadow-lift ${feita ? "border-ok/40 bg-ok-soft" : "border-line bg-surface"}`}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2"><SeloDeNivel nivel={ideia.nivel} /><span className="text-[11px] font-bold tracking-[0.1em] text-ink-2 uppercase">{ROTULO_DA_AREA[ideia.area]}</span></span>
                      {feita && <CheckCircle2 className="size-5 text-ok" aria-label="Concluída" />}
                    </span>
                    <span className="mt-3 text-lg leading-snug font-bold">{ideia.titulo}</span>
                    <span className="mt-1.5 flex-1 text-sm leading-relaxed text-body">{ideia.gancho}</span>
                    <span className="mt-3 flex flex-wrap gap-1.5">
                      {ideia.habilidades.slice(0, 3).map((h) => <span key={h} className="rounded-full bg-tint px-2.5 py-0.5 text-[11px] font-semibold text-ink-2">{h}</span>)}
                    </span>
                    <span className="mt-4 flex items-center justify-between text-xs font-bold text-ink-2">
                      <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{ideia.tempo}</span>
                      <span className="inline-flex items-center gap-1.5 text-koda-texto">Ver a ideia<ArrowRight className="size-4 transition duration-200 group-hover:translate-x-1" aria-hidden="true" /></span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
    </>
  );
}

export default function ListaDeIdeias() {
  return <AppShell><ConteudoDeIdeias /></AppShell>;
}
