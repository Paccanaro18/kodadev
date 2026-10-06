"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Circle, Crown, ShieldAlert, Trophy } from "lucide-react";
import AppShell from "../AppShell";
import { Card, Eyebrow, PageHeader } from "../ui";
import type { CategoriaDeSeguranca, DificuldadeDeSeguranca, ResumoDeSeguranca } from "@/lib/api";
import {
  CATEGORIAS, DIFICULDADES, estiloDaDificuldade, filtrar, progressoPorCategoria, resumirPessoa,
  rotuloDaCategoria, rotuloDaDificuldade,
} from "@/lib/seguranca";
import { useDesafiosDeSeguranca, usePlacarDeSeguranca } from "@/lib/useSeguranca";

const chip = "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition duration-200 hover:-translate-y-0.5 active:scale-95";

function Filtro<T extends string>({ rotulo, opcoes, valor, aoMudar }: {
  rotulo: string;
  opcoes: { valor: T; rotulo: string }[];
  valor: T | null;
  aoMudar: (novo: T | null) => void;
}) {
  return (
    <div role="group" aria-label={rotulo} className="flex flex-wrap items-center gap-2">
      <button type="button" aria-pressed={valor === null} onClick={() => aoMudar(null)}
        className={`${chip} ${valor === null ? "bg-koda text-white" : "bg-tint text-ink"}`}>Todos</button>
      {opcoes.map((opcao) => (
        <button key={opcao.valor} type="button" aria-pressed={valor === opcao.valor} onClick={() => aoMudar(opcao.valor)}
          className={`${chip} ${valor === opcao.valor ? "bg-koda text-white" : "bg-tint text-ink"}`}>{opcao.rotulo}</button>
      ))}
    </div>
  );
}

function CartaoDoDesafio({ desafio }: { desafio: ResumoDeSeguranca }) {
  return (
    <li>
      <Link href={`/seguranca/${encodeURIComponent(desafio.slug)}`}
        className={`group flex h-full flex-col rounded-[24px] border p-5 text-ink transition duration-200 hover:-translate-y-1 hover:text-ink hover:shadow-lift ${desafio.resolvido ? "border-ok/40 bg-ok-soft" : "border-line bg-surface"}`}>
        <span className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold tracking-[0.12em] text-koda-texto uppercase">{rotuloDaCategoria(desafio.categoria)}</span>
          {desafio.resolvido
            ? <CheckCircle2 className="size-5 text-ok" aria-label="Resolvido" />
            : <Circle className="size-5 text-ink-3" aria-label="Não resolvido" />}
        </span>
        <span className="mt-2 text-lg leading-snug font-bold">{desafio.titulo}</span>
        <span className="mt-1.5 flex-1 text-sm leading-relaxed text-body">{desafio.resumo}</span>
        <span className="mt-4 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${estiloDaDificuldade(desafio.dificuldade)}`}>{rotuloDaDificuldade(desafio.dificuldade)}</span>
            <span className="text-xs font-bold text-ink-2">{desafio.pontos} pts</span>
          </span>
          <ArrowRight className="size-4 text-koda-texto transition duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}

function Placar() {
  const { placar, erro } = usePlacarDeSeguranca();
  if (erro) return <p role="alert" className="text-sm text-bad">{erro}</p>;
  if (!placar) return <p className="text-sm text-ink-2">Carregando o placar…</p>;
  if (placar.melhores.length === 0) return <p className="text-sm text-ink-2">Ninguém pontuou ainda. Resolva um desafio para abrir o placar.</p>;

  return (
    <div>
      <ol className="grid gap-2">
        {placar.melhores.map((pessoa) => (
          <li key={pessoa.login} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${placar.voce?.login === pessoa.login ? "bg-koda-soft font-bold" : ""}`}>
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-tint text-xs font-bold">
              {pessoa.posicao === 1 ? <Crown className="size-4 text-warn" aria-label="Primeiro lugar" /> : pessoa.posicao}
            </span>
            <span className="min-w-0 flex-1 truncate">{pessoa.login}</span>
            <span className="text-xs text-ink-2">{pessoa.resolvidos} resolvidos</span>
            <span className="font-bold tabular-nums">{pessoa.pontos}</span>
          </li>
        ))}
      </ol>
      {placar.voce && !placar.melhores.some((pessoa) => pessoa.login === placar.voce?.login) && (
        <p className="mt-3 rounded-xl bg-koda-soft px-3 py-2 text-sm font-bold">Você está em {placar.voce.posicao}º lugar, com {placar.voce.pontos} pontos.</p>
      )}
    </div>
  );
}

function Conteudo() {
  const { desafios, erro, tentarDeNovo } = useDesafiosDeSeguranca();
  const [categoria, setCategoria] = useState<CategoriaDeSeguranca | null>(null);
  const [dificuldade, setDificuldade] = useState<DificuldadeDeSeguranca | null>(null);

  const visiveis = useMemo(() => filtrar(desafios ?? [], { categoria, dificuldade }), [desafios, categoria, dificuldade]);
  const resumo = useMemo(() => resumirPessoa(desafios ?? []), [desafios]);
  const porCategoria = useMemo(() => progressoPorCategoria(desafios ?? []), [desafios]);

  return (
    <>
      <PageHeader mascot="terminal" title="Desafios de segurança"
        subtitle={desafios ? `${resumo.resolvidos} de ${resumo.total} resolvidos · ${resumo.pontos} pontos` : "Treine segurança resolvendo desafios no estilo CTF."} />

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-warn-soft px-5 py-4 text-sm leading-relaxed text-body">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warn" aria-hidden="true" />
        <p>Todos os dados, servidores e credenciais destes desafios são <strong>fictícios</strong>, criados para estudo. Use o que aprender só para se defender e para testar sistemas seus ou com autorização por escrito: acessar sistemas alheios sem permissão é crime.</p>
      </div>

      <Link href="/aprenda/seguranca-de-aplicacoes" className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-koda-soft px-5 py-4 text-sm font-semibold text-koda-texto transition duration-200 hover:-translate-y-0.5 hover:text-koda-texto">
        <span className="flex items-center gap-3"><BookOpen className="size-5" aria-hidden="true" />Quer entender cada ataque antes? Estude a trilha Segurança de aplicações.</span>
        <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
      </Link>

      {erro && (
        <div role="alert" className="mt-6 rounded-2xl bg-bad-soft px-5 py-4 text-sm text-bad">
          <p>{erro}</p>
          <button onClick={tentarDeNovo} className="mt-3 h-9 rounded-xl border-[1.5px] border-bad px-4 text-sm font-bold transition duration-200 hover:bg-[#b42335] hover:text-white">Tentar de novo</button>
        </div>
      )}

      {desafios && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="grid gap-3">
              <Filtro rotulo="Filtrar por categoria" opcoes={CATEGORIAS.map(({ valor, rotulo }) => ({ valor, rotulo }))} valor={categoria} aoMudar={setCategoria} />
              <Filtro rotulo="Filtrar por dificuldade" opcoes={DIFICULDADES} valor={dificuldade} aoMudar={setDificuldade} />
            </div>
            {visiveis.length === 0
              ? <p className="mt-6 text-ink-2">Nenhum desafio com esses filtros.</p>
              : <ul className="mt-6 grid gap-4 sm:grid-cols-2">{visiveis.map((desafio) => <CartaoDoDesafio key={desafio.slug} desafio={desafio} />)}</ul>}
          </div>

          <aside className="grid content-start gap-6">
            <Card>
              <Eyebrow>Seu progresso</Eyebrow>
              <p className="text-3xl font-extrabold tabular-nums">{resumo.pontos}<span className="text-base font-semibold text-ink-2"> / {resumo.pontosPossiveis} pts</span></p>
              <ul className="mt-4 grid gap-2 text-sm">
                {porCategoria.map((item) => (
                  <li key={item.categoria} className="flex items-center justify-between gap-2">
                    <span>{rotuloDaCategoria(item.categoria)}</span>
                    <span className="font-bold tabular-nums">{item.resolvidos}/{item.total}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <Eyebrow><span className="inline-flex items-center gap-2"><Trophy className="size-4" aria-hidden="true" />Placar</span></Eyebrow>
              <Placar />
            </Card>
          </aside>
        </div>
      )}
      {!desafios && !erro && <p className="mt-8 text-ink-2">Carregando os desafios…</p>}
    </>
  );
}

export default function ListaDeSeguranca() {
  return <AppShell><Conteudo /></AppShell>;
}
