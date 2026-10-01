"use client";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Lightbulb, Play, Sparkles } from "lucide-react";
import AppShell from "./AppShell";
import SeloProgresso from "./SeloProgresso";
import { Card, Eyebrow, PageHeader } from "./ui";
import type { ItemHistorico, StatusProgresso, TipoDesafio } from "@/lib/api";
import { estaGerando, rotuloDoTipo } from "@/lib/desafio";
import { tempoRelativo } from "@/lib/formatar";
import { useHistorico } from "@/lib/useHistorico";
import { useResumoDoProgresso } from "@/lib/useResumoDoProgresso";

const TAMANHO_DA_PAGINA = 10;

const FILTROS_DE_STATUS: { valor: StatusProgresso | undefined; rotulo: string }[] = [
  { valor: undefined, rotulo: "Todos" },
  { valor: "EM_ANDAMENTO", rotulo: "Em andamento" },
  { valor: "CONCLUIDO", rotulo: "Concluídos" },
  { valor: "NAO_INICIADO", rotulo: "Não iniciados" },
];

const FILTROS_DE_TIPO: { valor: TipoDesafio | undefined; rotulo: string }[] = [
  { valor: undefined, rotulo: "Todos os tipos" },
  { valor: "FEATURE", rotulo: "Feature" },
  { valor: "BUG", rotulo: "Bug" },
  { valor: "TESTING", rotulo: "Testing" },
];

const chip = "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition duration-200 hover:-translate-y-0.5 active:scale-95";

function Indicador({ icone, valor, rotulo, cor }: { icone: React.ReactNode; valor: number | null; rotulo: string; cor: string }) {
  return (
    <Card className="!p-5">
      <div className={`grid size-10 place-items-center rounded-full ${cor}`}>{icone}</div>
      <div className="mt-3 text-3xl font-extrabold">{valor ?? "–"}</div>
      <div className="text-[13px] text-ink-2">{rotulo}</div>
    </Card>
  );
}

function destino(item: ItemHistorico): string {
  const id = encodeURIComponent(item.id);
  return estaGerando(item.statusGeracao) ? `/desafio/gerando?desafio=${id}` : `/desafio/${id}`;
}

function Linha({ item }: { item: ItemHistorico }) {
  const pronto = item.statusGeracao === "PRONTO";

  return (
    <li className="border-b border-line last:border-0">
      <Link href={destino(item)} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4 text-ink transition duration-200 hover:translate-x-2 hover:bg-tint hover:text-ink active:translate-x-1">
        <span className="rounded-[10px] bg-koda-soft px-3 py-1 text-[13px] font-bold text-koda">{item.codigo}</span>
        <span className="min-w-[200px] flex-1">
          <span className="block font-semibold">{item.titulo ?? (item.statusGeracao === "FALHOU" ? "Geração sem sucesso" : "Gerando o ticket…")}</span>
          <span className="block text-xs text-ink-2">{item.repositorio} · {rotuloDoTipo(item.tipo)} · criado {tempoRelativo(item.criadoEm)}</span>
        </span>
        {item.dicasUsadas > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-ink-2" title="Dicas usadas">
            <Lightbulb className="size-3.5 text-koda" /> {item.dicasUsadas}
          </span>
        )}
        {pronto
          ? <SeloProgresso status={item.statusProgresso} />
          : <span className="rounded-full bg-tint px-3.5 py-1.5 text-xs font-bold text-ink-2">{item.statusGeracao === "FALHOU" ? "Falhou" : "Gerando"}</span>}
      </Link>
    </li>
  );
}

function Conteudo() {
  const { resumo, erro: erroDoResumo } = useResumoDoProgresso();
  const [status, setStatus] = useState<StatusProgresso | undefined>(undefined);
  const [tipo, setTipo] = useState<TipoDesafio | undefined>(undefined);
  const [numeroDaPagina, setNumeroDaPagina] = useState(0);
  const { pagina, erro, carregando } = useHistorico({ status, tipo, pagina: numeroDaPagina, tamanho: TAMANHO_DA_PAGINA });

  const maisComum = resumo?.habilidades[0]?.total ?? 1;

  function filtrarStatus(valor: StatusProgresso | undefined) {
    setStatus(valor);
    setNumeroDaPagina(0);
  }

  function filtrarTipo(valor: TipoDesafio | undefined) {
    setTipo(valor);
    setNumeroDaPagina(0);
  }

  return (
    <>
      <PageHeader mascot="prancheta" title="Seu progresso" subtitle="O que você já praticou e o que está em andamento." />

      {erroDoResumo && <p role="alert" className="mt-6 text-sm text-bad">{erroDoResumo}</p>}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Indicador icone={<CheckCircle2 className="size-5" />} valor={resumo?.concluidos ?? null} rotulo="concluídos" cor="bg-ok-soft text-ok" />
        <Indicador icone={<Play className="size-5" />} valor={resumo?.emAndamento ?? null} rotulo="em andamento" cor="bg-warn-soft text-warn" />
        <Indicador icone={<Sparkles className="size-5" />} valor={resumo?.naoIniciados ?? null} rotulo="não iniciados" cor="bg-koda-soft text-koda" />
        <Indicador icone={<Lightbulb className="size-5" />} valor={resumo?.dicasUsadas ?? null} rotulo="dicas usadas" cor="bg-warn-soft text-[#e0631a]" />
      </div>

      <Card className="mt-6">
        <Eyebrow>Habilidades praticadas</Eyebrow>
        {resumo && resumo.habilidades.length === 0 && (
          <p className="-mt-2 text-sm text-ink-2">Elas aparecem aqui quando você concluir o seu primeiro desafio.</p>
        )}
        {resumo && resumo.habilidades.length > 0 && (
          <ul className="-mt-2 grid gap-3">
            {resumo.habilidades.map((h) => (
              <li key={h.nome} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-[0_0_9rem] truncate" title={h.nome}>{h.nome}</span>
                <div className="h-2.5 flex-1 rounded-full bg-track">
                  <div className="h-2.5 rounded-full bg-[#7d74ff] transition-all duration-500" style={{ width: `${Math.round((h.total / maisComum) * 100)}%` }} />
                </div>
                <span className="w-6 text-right text-ink-2">{h.total}</span>
              </li>
            ))}
          </ul>
        )}
        {!resumo && !erroDoResumo && <div className="h-16 animate-pulse rounded-2xl bg-tint" />}
      </Card>

      <Card className="mt-6">
        <Eyebrow>Histórico</Eyebrow>
        <div className="-mt-2 mb-4 flex flex-wrap items-center gap-2">
          {FILTROS_DE_STATUS.map((f) => (
            <button key={f.rotulo} onClick={() => filtrarStatus(f.valor)} aria-pressed={status === f.valor}
              className={chip + (status === f.valor ? " bg-koda text-white" : " bg-tint text-ink hover:bg-koda-soft")}>
              {f.rotulo}
            </button>
          ))}
          <select value={tipo ?? ""} onChange={(e) => filtrarTipo((e.target.value || undefined) as TipoDesafio | undefined)}
            aria-label="Filtrar por tipo" className="ml-auto h-9 rounded-full border border-line-2 bg-surface px-3 text-[13px] font-semibold outline-none focus:border-koda">
            {FILTROS_DE_TIPO.map((f) => <option key={f.rotulo} value={f.valor ?? ""}>{f.rotulo}</option>)}
          </select>
        </div>

        {erro && <p role="alert" className="text-sm text-bad">{erro}</p>}
        {!erro && !pagina && <div className="h-40 animate-pulse rounded-2xl bg-tint" />}
        {!erro && pagina && pagina.itens.length === 0 && (
          <p className="text-sm text-ink-2">
            {status || tipo ? "Nenhum desafio com esses filtros." : "Você ainda não gerou nenhum desafio."}
          </p>
        )}
        {!erro && pagina && pagina.itens.length > 0 && (
          <ul className={carregando ? "opacity-60 transition-opacity" : "transition-opacity"}>
            {pagina.itens.map((item) => <Linha key={item.id} item={item} />)}
          </ul>
        )}

        {pagina && pagina.totalPaginas > 1 && (
          <div className="mt-4 flex items-center justify-between text-[13px]">
            <button onClick={() => setNumeroDaPagina((n) => Math.max(0, n - 1))} disabled={numeroDaPagina === 0 || carregando}
              className="rounded-full border border-line-2 px-4 py-1.5 font-semibold transition duration-200 hover:bg-koda-soft disabled:pointer-events-none disabled:opacity-40">
              ← Anterior
            </button>
            <span className="text-ink-2">Página {pagina.pagina + 1} de {pagina.totalPaginas}</span>
            <button onClick={() => setNumeroDaPagina((n) => n + 1)} disabled={numeroDaPagina + 1 >= pagina.totalPaginas || carregando}
              className="rounded-full border border-line-2 px-4 py-1.5 font-semibold transition duration-200 hover:bg-koda-soft disabled:pointer-events-none disabled:opacity-40">
              Próxima →
            </button>
          </div>
        )}
      </Card>
    </>
  );
}

export default function Progresso() {
  return (
    <AppShell width="max-w-[1000px]">
      <Conteudo />
    </AppShell>
  );
}
