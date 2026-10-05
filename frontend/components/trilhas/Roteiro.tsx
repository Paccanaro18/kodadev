"use client";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Clock, Flag } from "lucide-react";
import { Card } from "../ui";
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

function Marca({ feito }: { feito: boolean }) {
  return feito
    ? <CheckCircle2 className="size-6 shrink-0 text-ok" aria-label="Concluído" />
    : <Circle className="size-6 shrink-0 text-ink-3" aria-label="Pendente" />;
}

function LinhaDoItem({ trilha, item, progresso }: { trilha: string; item: ResumoDeItem; progresso: ProgressoDaTrilha }) {
  const feito = itemConcluido(progresso, paraProgresso(item));
  const ehCheckpoint = item.tipo === "checkpoint";
  return (
    <li>
      <Link href={`/aprenda/${trilha}/${item.slug}`}
        className="flex items-start gap-4 rounded-2xl border border-line p-4 text-ink transition duration-200 hover:-translate-y-0.5 hover:border-koda hover:text-ink hover:shadow-soft">
        <Marca feito={feito} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            {ehCheckpoint && <span className="inline-flex items-center gap-1 rounded-full bg-warn-soft px-2.5 py-0.5 text-[11px] font-bold text-warn"><Flag className="size-3" aria-hidden="true" />Checkpoint</span>}
            <span className="font-bold">{item.titulo}</span>
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-body">{item.resumo}</span>
          <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-ink-2"><Clock className="size-3.5" aria-hidden="true" />{item.detalhe}</span>
        </span>
        <ArrowRight className="mt-1 size-4 shrink-0 text-koda-texto" aria-hidden="true" />
      </Link>
    </li>
  );
}

/** O mapa da trilha: as etapas, os módulos e checkpoints com o progresso da pessoa, e o botão de continuar. */
export default function Roteiro({ trilha }: { trilha: ResumoDeTrilha }) {
  const { progresso, carregado } = useEstudo(trilha.slug);
  const itens = trilha.etapas.flatMap((etapa) => etapa.itens);
  const paraCalculo = itens.map(paraProgresso);
  const percentual = percentualConcluido(progresso, paraCalculo);
  const pendente = proximoPendente(progresso, paraCalculo);
  const proximo = pendente ? itens.find((item) => item.slug === pendente.slug) ?? null : null;
  const comecou = progresso.licoes.length > 0 || Object.keys(progresso.notas).length > 0;

  return (
    <div className="grid gap-6">
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-[220px] flex-1">
            <BarraDeProgresso percentual={carregado ? percentual : 0} rotulo="Seu progresso nesta trilha" />
            <p className="mt-2 text-xs text-ink-2">O progresso fica salvo neste navegador. Um módulo conta como concluído com a lição lida e 60% de acertos no teste.</p>
          </div>
          {proximo
            ? (
              <Link href={`/aprenda/${trilha.slug}/${proximo.slug}`}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-koda px-6 text-[15px] font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-koda-dark hover:text-white active:scale-[.97]">
                {comecou ? "Continuar de onde parou" : "Começar a trilha"} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            )
            : carregado && itens.length > 0 && <span className="rounded-2xl bg-ok-soft px-5 py-3 text-sm font-bold text-ok">Tudo concluído por enquanto. Novos módulos chegam em breve.</span>}
        </div>
      </Card>

      {trilha.etapas.map((etapa, e) => (
        <section key={etapa.titulo} aria-labelledby={`etapa-${e}`}>
          <h2 id={`etapa-${e}`} className="text-xl font-bold tracking-tight">{e + 1}. {etapa.titulo}</h2>
          <p className="mt-1 text-sm text-ink-2">{etapa.descricao}</p>
          <ol className="mt-4 grid gap-3">
            {etapa.itens.map((item) => <LinhaDoItem key={item.slug} trilha={trilha.slug} item={item} progresso={progresso} />)}
          </ol>
        </section>
      ))}

      {trilha.planejados.length > 0 && (
        <section aria-labelledby="em-breve">
          <h2 id="em-breve" className="text-xl font-bold tracking-tight">O que vem a seguir</h2>
          <p className="mt-1 text-sm text-ink-2">O roteiro completo da trilha. Estes módulos estão sendo escritos e liberados aos poucos.</p>
          <ol className="mt-4 grid gap-2.5">
            {trilha.planejados.map((planejado) => (
              <li key={planejado.titulo} className="flex items-start gap-4 rounded-2xl border border-dashed border-line-2 p-4 opacity-80">
                <Circle className="size-6 shrink-0 text-ink-3" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{planejado.titulo}</span>
                    <span className="rounded-full bg-tint px-2.5 py-0.5 text-[11px] font-bold text-ink-2">Em breve</span>
                  </span>
                  <span className="mt-1 block text-sm text-body">{planejado.resumo}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
