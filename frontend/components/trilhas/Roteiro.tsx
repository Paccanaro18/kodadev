"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Circle, Clock, Flag, ListChecks, Target, Users } from "lucide-react";
import IconeDeTecnologia from "../IconeDeTecnologia";
import {
  itemConcluido, percentualConcluido, proximoPendente, type ItemParaProgresso, type ProgressoDaTrilha,
} from "@/lib/progressoDeEstudo";
import type { ResumoDeItem, ResumoDeTrilha } from "@/lib/trilhas/tipos";
import { useEstudo } from "@/lib/useEstudo";

export function paraProgresso(item: ResumoDeItem): ItemParaProgresso {
  return { tipo: item.tipo, slug: item.slug, notaMinima: item.notaMinima };
}

export function BarraDeProgresso({ percentual, rotulo }: { percentual: number; rotulo: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-ink-2">
        <span>{rotulo}</span><span>{percentual}%</span>
      </div>
      <div role="progressbar" aria-label={rotulo} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentual}
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-tint">
        <div className="h-full rounded-full bg-koda transition-all duration-500" style={{ width: `${percentual}%` }} />
      </div>
    </div>
  );
}

const GRUPOS: Record<ResumoDeTrilha["grupo"], string> = {
  linguagem: "Trilha de linguagem",
  certificacao: "Preparação para certificação",
  ia: "Trilha de inteligência artificial",
};

function minutosDe(leitura?: string): number {
  const encontrado = leitura ? /\d+/.exec(leitura) : null;
  return encontrado ? Number(encontrado[0]) : 0;
}

function tempoTotal(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

function Dado({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink">
      <span className="text-koda-texto" aria-hidden="true">{icone}</span>{children}
    </li>
  );
}

function CartaoDoItem({ trilha, item, numero, progresso }: { trilha: string; item: ResumoDeItem; numero: number | null; progresso: ProgressoDaTrilha }) {
  const feito = itemConcluido(progresso, paraProgresso(item));
  const ehCheckpoint = item.tipo === "checkpoint";
  return (
    <li className="relative pl-12">
      <span className={`absolute top-4 left-0 grid size-9 place-items-center rounded-full border-2 bg-cream ${feito ? "border-ok text-ok" : ehCheckpoint ? "border-warn text-warn" : "border-line-2 text-ink-3"}`}>
        {feito
          ? <CheckCircle2 className="size-5" aria-label="Concluído" />
          : ehCheckpoint ? <Flag className="size-4" aria-hidden="true" /> : <Circle className="size-4" aria-label="Pendente" />}
      </span>
      <Link href={`/aprenda/${trilha}/${item.slug}`}
        className={`group block rounded-2xl border p-5 text-ink transition duration-200 hover:-translate-y-0.5 hover:border-koda hover:text-ink hover:shadow-soft ${feito ? "border-ok/40 bg-ok-soft" : ehCheckpoint ? "border-warn/50 bg-warn-soft" : "border-line bg-surface"}`}>
        <span className="flex flex-wrap items-center gap-2">
          {ehCheckpoint
            ? <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2.5 py-0.5 text-[11px] font-bold text-warn"><Flag className="size-3" aria-hidden="true" />Checkpoint</span>
            : <span className="text-[11px] font-bold tracking-[0.12em] text-koda-texto uppercase">Módulo {numero}</span>}
          {feito && <span className="rounded-full bg-ok-soft px-2.5 py-0.5 text-[11px] font-bold text-ok">Feito</span>}
        </span>
        <span className="mt-1.5 flex items-start justify-between gap-3">
          <span className="text-lg leading-snug font-bold">{item.titulo}</span>
          <ArrowRight className="mt-1.5 size-4 shrink-0 text-koda-texto transition duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </span>
        <span className="mt-1.5 block text-sm leading-relaxed text-body">{item.resumo}</span>
        <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-ink-2">
          {item.nivel && <span className="rounded-full bg-tint px-2.5 py-0.5 font-bold">{item.nivel}</span>}
          {item.leitura && <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" aria-hidden="true" />{item.leitura} de leitura</span>}
          <span className="inline-flex items-center gap-1.5"><ListChecks className="size-3.5" aria-hidden="true" />{item.questoes} questões</span>
          {ehCheckpoint && item.notaMinima !== undefined && <span>Aprovação com {Math.round(item.notaMinima * 100)}%</span>}
          {!ehCheckpoint && <span className="inline-flex items-center gap-1.5"><Target className="size-3.5" aria-hidden="true" />desafio prático</span>}
        </span>
      </Link>
    </li>
  );
}

/** A página de uma trilha: apresentação, o botão de continuar e o mapa das etapas com o progresso da pessoa. */
export default function Roteiro({ trilha }: { trilha: ResumoDeTrilha }) {
  const { progresso, carregado } = useEstudo(trilha.slug);
  const itens = trilha.etapas.flatMap((etapa) => etapa.itens);
  const paraCalculo = itens.map(paraProgresso);
  const percentual = carregado ? percentualConcluido(progresso, paraCalculo) : 0;
  const pendente = proximoPendente(progresso, paraCalculo);
  const proximo = pendente ? itens.find((item) => item.slug === pendente.slug) ?? null : null;
  const comecou = progresso.licoes.length > 0 || Object.keys(progresso.notas).length > 0;

  const modulos = itens.filter((item) => item.tipo === "modulo");
  const checkpoints = itens.length - modulos.length;
  const questoes = itens.reduce((soma, item) => soma + item.questoes, 0);
  const minutos = modulos.reduce((soma, item) => soma + minutosDe(item.leitura), 0);
  const concluidos = carregado ? itens.filter((item) => itemConcluido(progresso, paraProgresso(item))).length : 0;
  const numeros = new Map(modulos.map((modulo, indice) => [modulo.slug, indice + 1]));

  return (
    <div>
      <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-14 place-items-center rounded-2xl bg-tint"><span className="scale-[2.2]"><IconeDeTecnologia icone={trilha.slug} tamanho="medio" /></span></span>
            <span className="text-xs font-bold tracking-[0.12em] text-koda-texto uppercase">{GRUPOS[trilha.grupo]}</span>
          </div>
          <h1 className="mt-5 max-w-[760px] text-[32px] leading-[1.1] font-extrabold tracking-tight text-balance sm:text-[44px]">{trilha.titulo}</h1>
          <p className="mt-4 max-w-[680px] text-base leading-relaxed text-body sm:text-lg">{trilha.descricao}</p>
          <p className="mt-4 flex max-w-[680px] items-start gap-2.5 text-sm leading-relaxed text-ink-2">
            <Users className="mt-0.5 size-4 shrink-0 text-koda-texto" aria-hidden="true" /><span><strong className="text-ink">Para quem é:</strong> {trilha.publico}</span>
          </p>
          <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Resumo da trilha">
            <Dado icone={<BookOpen className="size-4" />}>{modulos.length} módulos</Dado>
            <Dado icone={<Clock className="size-4" />}>{tempoTotal(minutos)} de leitura</Dado>
            <Dado icone={<ListChecks className="size-4" />}>{questoes} questões</Dado>
            <Dado icone={<Flag className="size-4" />}>{checkpoints === 1 ? "1 prova de checkpoint" : `${checkpoints} provas de checkpoint`}</Dado>
          </ul>
        </div>

        <aside className="rounded-3xl bg-surface p-6 shadow-soft lg:sticky lg:top-28" aria-label="Seu andamento">
          <BarraDeProgresso percentual={percentual} rotulo="Seu progresso nesta trilha" />
          <p className="mt-3 text-sm text-ink-2">{concluidos} de {itens.length} etapas concluídas</p>
          {proximo
            ? (
              <Link href={`/aprenda/${trilha.slug}/${proximo.slug}`}
                className="mt-5 flex h-12 items-center justify-center gap-2 rounded-2xl bg-koda px-6 text-[15px] font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-koda-dark hover:text-white active:scale-[.97]">
                {comecou ? "Continuar de onde parou" : "Começar a trilha"} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            )
            : carregado && itens.length > 0 && <p className="mt-5 rounded-2xl bg-ok-soft px-4 py-3 text-sm font-bold text-ok">Tudo concluído por enquanto. Novos módulos chegam em breve.</p>}
          <p className="mt-4 text-xs leading-relaxed text-ink-2">O progresso fica salvo neste navegador. Um módulo conta como concluído com a lição lida e 60% de acertos no teste.</p>
        </aside>
      </header>

      <div className="mt-14 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Etapas da trilha" className="hidden lg:block">
          <div className="sticky top-28">
            <div className="mb-3 text-xs font-bold tracking-[0.12em] text-ink-2/70 uppercase">Nesta trilha</div>
            <ol className="grid gap-1 border-l border-line text-sm">
              {trilha.etapas.map((etapa, e) => {
                const feitos = carregado ? etapa.itens.filter((item) => itemConcluido(progresso, paraProgresso(item))).length : 0;
                return (
                  <li key={etapa.titulo}>
                    <a href={`#etapa-${e}`} className="-ml-px flex items-start justify-between gap-2 border-l-2 border-transparent py-1.5 pl-4 text-ink-2 hover:border-koda hover:text-koda-texto">
                      <span>{e + 1}. {etapa.titulo}</span>
                      <span className="shrink-0 text-xs tabular-nums">{feitos}/{etapa.itens.length}</span>
                    </a>
                  </li>
                );
              })}
              {trilha.planejados.length > 0 && (
                <li><a href="#proximos" className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-ink-2 hover:border-koda hover:text-koda-texto">Os próximos módulos</a></li>
              )}
            </ol>
          </div>
        </nav>

        <div className="grid gap-12">
          {trilha.etapas.map((etapa, e) => (
            <section key={etapa.titulo} aria-labelledby={`etapa-${e}`} className="scroll-mt-28">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-koda text-sm font-extrabold text-white">{e + 1}</span>
                <div>
                  <h2 id={`etapa-${e}`} className="text-2xl leading-tight font-bold tracking-tight">{etapa.titulo}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-ink-2">{etapa.descricao}</p>
                </div>
              </div>
              <div className="relative mt-6">
                <span className="absolute top-4 bottom-4 left-[17px] w-0.5 bg-line" aria-hidden="true" />
                <ol className="relative grid gap-4">
                  {etapa.itens.map((item) => (
                    <CartaoDoItem key={item.slug} trilha={trilha.slug} item={item} numero={numeros.get(item.slug) ?? null} progresso={progresso} />
                  ))}
                </ol>
              </div>
            </section>
          ))}

          {trilha.planejados.length > 0 && (
            <section aria-labelledby="proximos" className="scroll-mt-28">
              <h2 id="proximos" className="text-2xl font-bold tracking-tight">O que vem a seguir</h2>
              <p className="mt-1 text-sm text-ink-2">O roteiro completo da trilha. Estes módulos estão sendo escritos e liberados aos poucos.</p>
              <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                {trilha.planejados.map((planejado) => (
                  <li key={planejado.titulo} className="rounded-2xl border border-dashed border-line-2 p-4">
                    <span className="rounded-full bg-tint px-2.5 py-0.5 text-[11px] font-bold text-ink-2">Em breve</span>
                    <span className="mt-2 block leading-snug font-bold">{planejado.titulo}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-body">{planejado.resumo}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
