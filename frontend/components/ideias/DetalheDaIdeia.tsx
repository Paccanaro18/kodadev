"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Clock, Eye, Flag, Hammer, Sparkles, Target } from "lucide-react";
import AppShell from "../AppShell";
import { BackLink, Card } from "../ui";
import { CartaoDeEvidencia, SeloDeNivel } from "./IdeiasEmComum";
import { evidenciaPorId, ideiaPorSlug, ROTULO_DA_AREA, TRILHA_DE_IDEIAS } from "@/lib/ideias";
import { useEstudo } from "@/lib/useEstudo";

function Secao({ icone, titulo, children }: { icone: ReactNode; titulo: string; children: ReactNode }) {
  return (
    <Card>
      <h2 className="mb-4 flex items-center gap-2.5 text-xl font-bold"><span className="text-koda-texto">{icone}</span>{titulo}</h2>
      {children}
    </Card>
  );
}

function Lista({ itens, numerada = false }: { itens: string[]; numerada?: boolean }) {
  const Tag = numerada ? "ol" : "ul";
  return (
    <Tag className={`${numerada ? "list-decimal marker:font-bold" : "list-disc"} space-y-3 pl-6 text-[15px] leading-relaxed text-body marker:text-koda-texto`}>
      {itens.map((item) => <li key={item}>{item}</li>)}
    </Tag>
  );
}

export function ConteudoDaIdeia({ slug }: { slug: string }) {
  const ideia = ideiaPorSlug(slug);
  const { progresso, carregado, marcarDesafio } = useEstudo(TRILHA_DE_IDEIAS);
  if (!ideia) return <p className="text-ink-2">Ideia não encontrada.</p>;
  const feita = progresso.desafios.includes(ideia.slug);
  const evidencias = ideia.evidencias.map((id) => evidenciaPorId(id)).filter((e) => e !== undefined);

  return (
    <>
      <nav aria-label="Trilha de navegação" className="text-xs text-ink-2"><Link href="/ideias" className="font-semibold">Ideias de projetos</Link> / <span>{ROTULO_DA_AREA[ideia.area]}</span></nav>
      <div className="mt-3"><BackLink href="/ideias">← Todas as ideias</BackLink></div>
      <div className="flex flex-wrap items-center gap-2.5">
        <SeloDeNivel nivel={ideia.nivel} />
        <span className="rounded-full bg-tint px-3 py-1 text-xs font-bold text-ink">{ROTULO_DA_AREA[ideia.area]}</span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-2"><Clock className="size-3.5" aria-hidden="true" />{ideia.tempo}</span>
      </div>
      <h1 className="mt-3 max-w-4xl text-[28px] leading-tight font-bold tracking-tight sm:text-4xl">{ideia.titulo}</h1>
      <p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink-2">{ideia.gancho}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" disabled={!carregado} aria-pressed={feita} onClick={() => marcarDesafio(ideia.slug, !feita)}
          className={`inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-bold transition duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 ${feita ? "bg-ok-soft text-ok" : "bg-koda text-white hover:bg-koda-dark"}`}>
          <CheckCircle2 className="size-4" aria-hidden="true" />{feita ? "Concluído (clique para desfazer)" : "Marcar como concluído"}
        </button>
        <span className="text-xs text-ink-2">Seu progresso fica salvo na conta e conta para as conquistas.</span>
      </div>

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6">
          <Secao icone={<Target className="size-5" aria-hidden="true" />} titulo="O problema real por trás">
            <p className="text-[15px] leading-relaxed text-body">{ideia.problema}</p>
          </Secao>
          <Secao icone={<Hammer className="size-5" aria-hidden="true" />} titulo="O que construir (escopo mínimo)">
            <Lista itens={ideia.construir} numerada />
          </Secao>
          <Secao icone={<Sparkles className="size-5" aria-hidden="true" />} titulo="O que separa a versão comum da que se destaca">
            <Lista itens={ideia.diferencial} />
          </Secao>
          <Secao icone={<Flag className="size-5" aria-hidden="true" />} titulo="O que publicar">
            <Lista itens={ideia.entregaveis} />
          </Secao>
          <Secao icone={<Eye className="size-5" aria-hidden="true" />} titulo="Como fazer o projeto ser visto">
            <Lista itens={ideia.comoSerVisto} />
          </Secao>
          <Card className="border-2 border-koda/30">
            <h2 className="text-xl font-bold">O que isso sinaliza na carreira</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-body">{ideia.sinalNaCarreira}</p>
            <h3 className="mt-6 mb-3 text-xs font-bold tracking-[0.12em] text-ink-2/70 uppercase">Em que isso se apoia</h3>
            <ul className="grid gap-3" aria-label="Fontes">
              {evidencias.map((e) => <CartaoDeEvidencia key={e.id} evidencia={e} />)}
            </ul>
          </Card>
        </div>

        <aside className="grid gap-6">
          <Card className="!p-6">
            <h2 className="text-lg font-bold">Habilidades que você pratica</h2>
            <ul className="mt-3 flex flex-wrap gap-2">{ideia.habilidades.map((h) => <li key={h} className="rounded-full bg-koda-soft px-3 py-1 text-xs font-semibold text-koda-texto">{h}</li>)}</ul>
            <h2 className="mt-6 text-lg font-bold">Tecnologias sugeridas</h2>
            <ul className="mt-3 flex flex-wrap gap-2">{ideia.tecnologias.map((t) => <li key={t} className="rounded-full bg-tint px-3 py-1 text-xs font-semibold text-ink-2">{t}</li>)}</ul>
          </Card>
          <Card className="!p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold"><BookOpen className="size-5 text-koda-texto" aria-hidden="true" />Estude no Koda antes</h2>
            <ul className="mt-3 grid gap-2">
              {ideia.estudarNoKoda.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="flex items-center justify-between gap-3 rounded-xl bg-koda-soft px-4 py-3 text-sm font-bold text-koda-texto transition duration-200 hover:-translate-y-0.5 hover:text-koda-texto">
                    {l.rotulo}<ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          {ideia.cuidado && (
            <p role="note" className="flex items-start gap-3 rounded-2xl bg-warn-soft px-5 py-4 text-sm leading-relaxed text-body">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warn" aria-hidden="true" /><span><strong className="text-ink">Cuidado. </strong>{ideia.cuidado}</span>
            </p>
          )}
        </aside>
      </div>
    </>
  );
}

export default function DetalheDaIdeia({ slug }: { slug: string }) {
  return <AppShell><ConteudoDaIdeia slug={slug} /></AppShell>;
}
