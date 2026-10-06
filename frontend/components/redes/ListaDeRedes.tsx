"use client";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Circle, Clock, Play, RotateCcw, Swords } from "lucide-react";
import AppShell from "../AppShell";
import { Mascot } from "../ui";
import PreviaDaTopologia from "./PreviaDaTopologia";
import { AULAS_DE_REDES, DESAFIOS_DE_REDES, TRILHA_DE_REDES, type Laboratorio } from "@/lib/redes/laboratorios";
import { useEstudo } from "@/lib/useEstudo";

function Previa({ lab, feito }: { lab: Laboratorio; feito: boolean }) {
  return (
    <div className={`relative h-full min-h-[150px] overflow-hidden rounded-2xl p-3 ${feito ? "bg-ok-soft" : "bg-tint"}`}>
      <PreviaDaTopologia rede={lab.redeInicial} />
      {feito && (
        <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-ok px-2.5 py-1 text-[11px] font-bold text-white">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />Feito
        </span>
      )}
    </div>
  );
}

function Estado({ feito }: { feito: boolean }) {
  return feito
    ? <CheckCircle2 className="size-5 text-ok" aria-label="Concluído" />
    : <Circle className="size-5 text-ink-3" aria-label="Não concluído" />;
}

function PassoDaAula({ lab, numero, feito, ultimo }: { lab: Laboratorio; numero: number; feito: boolean; ultimo: boolean }) {
  return (
    <li className="relative flex gap-4 sm:gap-5">
      <div className="flex flex-col items-center">
        <span className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-extrabold ${feito ? "bg-ok text-white" : "bg-koda text-white"}`}>
          {feito ? <CheckCircle2 className="size-5" aria-hidden="true" /> : numero}
        </span>
        {!ultimo && <span className="mt-1 w-0.5 flex-1 rounded-full bg-line-2" aria-hidden="true" />}
      </div>
      <Link href={`/redes/${lab.slug}`}
        className={`group mb-5 grid flex-1 gap-4 rounded-[24px] border p-4 text-ink transition duration-200 hover:-translate-y-1 hover:text-ink hover:shadow-lift sm:grid-cols-[240px_minmax(0,1fr)] ${feito ? "border-ok/40" : "border-line"} bg-surface`}>
        <Previa lab={lab} feito={false} />
        <div className="flex flex-col py-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold tracking-[0.12em] text-koda-texto uppercase">Aula {numero} · {lab.nivel}</span>
            <Estado feito={feito} />
          </div>
          <h3 className="mt-1.5 text-lg leading-snug font-bold">{lab.titulo}</h3>
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-body">{lab.resumo}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {lab.conceitos.map((conceito) => <span key={conceito} className="rounded-full bg-tint px-2.5 py-0.5 text-[11px] font-semibold text-ink-2">{conceito}</span>)}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-ink-2">
            <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{lab.minutos} min</span>
            <span className="inline-flex items-center gap-1.5 text-koda-texto">{feito ? "Revisar" : "Começar"}<ArrowRight className="size-4 transition duration-200 group-hover:translate-x-1" aria-hidden="true" /></span>
          </div>
        </div>
      </Link>
    </li>
  );
}

function CartaoDoDesafio({ lab, feito }: { lab: Laboratorio; feito: boolean }) {
  return (
    <li>
      <Link href={`/redes/${lab.slug}`}
        className={`group flex h-full flex-col rounded-[24px] border bg-surface p-4 text-ink transition duration-200 hover:-translate-y-1 hover:text-ink hover:shadow-lift ${feito ? "border-ok/40" : "border-line"}`}>
        <div className="h-40"><Previa lab={lab} feito={feito} /></div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-warn uppercase"><Swords className="size-3.5" aria-hidden="true" />Desafio · {lab.nivel}</span>
          <Estado feito={feito} />
        </div>
        <h3 className="mt-1.5 text-lg leading-snug font-bold">{lab.titulo}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-body">{lab.resumo}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {lab.conceitos.map((conceito) => <span key={conceito} className="rounded-full bg-tint px-2.5 py-0.5 text-[11px] font-semibold text-ink-2">{conceito}</span>)}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs font-bold text-ink-2">
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{lab.minutos} min</span>
          <span className="inline-flex items-center gap-1.5 text-koda-texto">{feito ? "Refazer" : "Resolver"}<ArrowRight className="size-4 transition duration-200 group-hover:translate-x-1" aria-hidden="true" /></span>
        </div>
      </Link>
    </li>
  );
}

export function ConteudoDaListaDeRedes() {
  const { progresso } = useEstudo(TRILHA_DE_REDES);
  const todos = [...AULAS_DE_REDES, ...DESAFIOS_DE_REDES];
  const feitos = todos.filter((l) => progresso.desafios.includes(l.slug)).length;
  const proximo = todos.find((l) => !progresso.desafios.includes(l.slug));
  const percentual = Math.round((feitos / todos.length) * 100);

  return (
    <>
      <section className="relative overflow-hidden rounded-[32px] bg-koda-soft p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-6">
          <Mascot name="prancheta" className="h-28 shrink-0 sm:h-36" />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold tracking-[0.14em] text-koda-texto uppercase">Laboratório de redes</span>
            <h1 className="mt-1 text-[30px] leading-tight font-bold tracking-tight sm:text-4xl">Redes</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-body">
              Monte redes de verdade no navegador: arraste computadores, switches e roteadores, ligue os cabos, configure endereços e dê <strong>ping</strong>.
              Os pacotes andam pela tela e você vê o ARP, a tabela do switch e o TTL funcionando.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              {proximo && (
                <Link href={`/redes/${proximo.slug}`} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-koda px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-koda-dark hover:text-white active:scale-95">
                  {feitos === 0 ? <Play className="size-4" aria-hidden="true" /> : <RotateCcw className="size-4" aria-hidden="true" />}
                  {feitos === 0 ? "Começar pela primeira aula" : "Continuar de onde parou"}
                </Link>
              )}
              <div className="min-w-[200px] flex-1 sm:max-w-xs">
                <p className="text-sm font-semibold text-ink">{feitos} de {todos.length} laboratórios concluídos</p>
                <div role="progressbar" aria-label="Progresso em Redes" aria-valuemin={0} aria-valuemax={todos.length} aria-valuenow={feitos} className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-koda transition-all duration-500" style={{ width: `${percentual}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Link href="/aprenda/redes-de-computadores" className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-koda-soft px-5 py-4 text-sm font-semibold text-koda-texto transition duration-200 hover:-translate-y-0.5 hover:text-koda-texto">
        <span className="flex items-center gap-3"><BookOpen className="size-5" aria-hidden="true" />A teoria de cada laboratório está na trilha Redes de computadores, em Aprenda aqui.</span>
        <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
      </Link>

      <section className="mt-10" aria-labelledby="aulas">
        <h2 id="aulas" className="text-xl font-bold">Aulas interativas</h2>
        <p className="mt-1 mb-6 text-sm text-ink-2">Em ordem: cada aula guia você passo a passo, com objetivos que o simulador confere sozinho.</p>
        <ol>
          {AULAS_DE_REDES.map((lab, indice) => (
            <PassoDaAula key={lab.slug} lab={lab} numero={indice + 1} feito={progresso.desafios.includes(lab.slug)} ultimo={indice === AULAS_DE_REDES.length - 1} />
          ))}
        </ol>
      </section>

      <section className="mt-8" aria-labelledby="desafios">
        <h2 id="desafios" className="text-xl font-bold">Desafios</h2>
        <p className="mt-1 text-sm text-ink-2">A rede já vem montada, mas algo está errado. Descubra o quê e conserte.</p>
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {DESAFIOS_DE_REDES.map((lab) => <CartaoDoDesafio key={lab.slug} lab={lab} feito={progresso.desafios.includes(lab.slug)} />)}
        </ul>
      </section>
    </>
  );
}

export default function ListaDeRedes() {
  return <AppShell><ConteudoDaListaDeRedes /></AppShell>;
}
