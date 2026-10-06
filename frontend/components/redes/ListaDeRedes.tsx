"use client";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Clock } from "lucide-react";
import AppShell from "../AppShell";
import { Card, PageHeader } from "../ui";
import { AULAS_DE_REDES, DESAFIOS_DE_REDES, TRILHA_DE_REDES, type Laboratorio } from "@/lib/redes/laboratorios";
import { useEstudo } from "@/lib/useEstudo";

function Cartao({ lab, feito }: { lab: Laboratorio; feito: boolean }) {
  return (
    <li>
      <Link href={`/redes/${lab.slug}`}
        className={`group flex h-full flex-col rounded-[24px] border p-5 text-ink transition duration-200 hover:-translate-y-1 hover:text-ink hover:shadow-lift ${feito ? "border-ok/40 bg-ok-soft" : "border-line bg-surface"}`}>
        <span className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold tracking-[0.12em] text-koda-texto uppercase">{lab.nivel}</span>
          {feito
            ? <CheckCircle2 className="size-5 text-ok" aria-label="Concluído" />
            : <Circle className="size-5 text-ink-3" aria-label="Não concluído" />}
        </span>
        <span className="mt-2 text-lg leading-snug font-bold">{lab.titulo}</span>
        <span className="mt-1.5 flex-1 text-sm leading-relaxed text-body">{lab.resumo}</span>
        <span className="mt-3 flex flex-wrap gap-1.5">
          {lab.conceitos.map((conceito) => <span key={conceito} className="rounded-full bg-tint px-2.5 py-0.5 text-[11px] font-semibold text-ink-2">{conceito}</span>)}
        </span>
        <span className="mt-4 flex items-center justify-between gap-2 text-xs font-bold text-ink-2">
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden="true" />{lab.minutos} min</span>
          <ArrowRight className="size-4 text-koda-texto transition duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}

function Conteudo() {
  const { progresso } = useEstudo(TRILHA_DE_REDES);
  const total = AULAS_DE_REDES.length + DESAFIOS_DE_REDES.length;
  const feitos = [...AULAS_DE_REDES, ...DESAFIOS_DE_REDES].filter((l) => progresso.desafios.includes(l.slug)).length;

  return (
    <>
      <PageHeader mascot="prancheta" title="Redes" subtitle={`Monte redes de verdade no navegador, como no Packet Tracer. ${feitos} de ${total} laboratórios concluídos.`} />

      <Card className="mt-6">
        <p className="leading-relaxed text-body">
          Cada laboratório tem um simulador: você arrasta computadores, switches e roteadores, liga os cabos, configura endereços e dá <strong>ping</strong> de verdade.
          Os pacotes andam pela tela, e você vê o ARP, o ICMP, a tabela do switch e o TTL funcionando.
          Comece pelas aulas, que guiam passo a passo, e depois resolva os desafios, onde a rede já vem com defeitos para você consertar.
        </p>
      </Card>

      <section className="mt-8" aria-labelledby="aulas">
        <h2 id="aulas" className="text-xl font-bold">Aulas interativas</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {AULAS_DE_REDES.map((lab) => <Cartao key={lab.slug} lab={lab} feito={progresso.desafios.includes(lab.slug)} />)}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="desafios">
        <h2 id="desafios" className="text-xl font-bold">Desafios</h2>
        <p className="mt-1 text-sm text-ink-2">A rede já vem montada, mas algo está errado. Descubra o quê e conserte.</p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {DESAFIOS_DE_REDES.map((lab) => <Cartao key={lab.slug} lab={lab} feito={progresso.desafios.includes(lab.slug)} />)}
        </ul>
      </section>
    </>
  );
}

export default function ListaDeRedes() {
  return <AppShell><Conteudo /></AppShell>;
}
