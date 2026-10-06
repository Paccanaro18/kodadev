"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import AppShell from "./AppShell";
import SeloProgresso from "./SeloProgresso";
import { btnPrimary, Card, Eyebrow, PageHeader } from "./ui";
import type { ItemHistorico } from "@/lib/api";
import { estaGerando, rotuloDoTipo } from "@/lib/desafio";
import { agruparEmAberto, repositoriosDe } from "@/lib/emAberto";
import { tempoRelativo } from "@/lib/formatar";
import { useDesafiosEmAberto } from "@/lib/useDesafiosEmAberto";

const chip = "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition duration-200 hover:-translate-y-0.5 active:scale-95";

function destino(item: ItemHistorico): string {
  const id = encodeURIComponent(item.id);
  return estaGerando(item.statusGeracao) ? `/desafio/gerando?desafio=${id}` : `/desafio/${id}`;
}

function Linha({ item }: { item: ItemHistorico }) {
  return (
    <li className="border-b border-line last:border-0">
      <Link href={destino(item)} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4 text-ink transition duration-200 hover:translate-x-2 hover:bg-tint hover:text-ink active:translate-x-1">
        <span className="rounded-[10px] bg-koda-soft px-3 py-1 text-[13px] font-bold text-koda-texto">{item.codigo}</span>
        <span className="min-w-[200px] flex-1">
          <span className="block font-semibold">{item.titulo ?? "Gerando o ticket…"}</span>
          <span className="block text-xs text-ink-2">{item.repositorio} · {rotuloDoTipo(item.tipo)} · criado {tempoRelativo(item.criadoEm)}</span>
        </span>
        {item.dicasUsadas > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-ink-2" title="Dicas usadas">
            <Lightbulb className="size-3.5 text-koda-texto" /> {item.dicasUsadas}
          </span>
        )}
        {estaGerando(item.statusGeracao)
          ? <span className="rounded-full bg-koda-soft px-3.5 py-1.5 text-xs font-bold whitespace-nowrap text-koda-texto">Gerando</span>
          : <SeloProgresso status={item.statusProgresso} />}
      </Link>
    </li>
  );
}

function Grupo({ titulo, itens }: { titulo: string; itens: ItemHistorico[] }) {
  if (itens.length === 0) return null;
  return (
    <Card className="mt-6">
      <Eyebrow>{titulo} ({itens.length})</Eyebrow>
      <ul className="-mt-2">{itens.map((item) => <Linha key={item.id} item={item} />)}</ul>
    </Card>
  );
}

function Conteudo() {
  const { itens, erro, tentarDeNovo } = useDesafiosEmAberto();
  const [repositorio, setRepositorio] = useState<string | undefined>(undefined);

  const repositorios = useMemo(() => (itens ? repositoriosDe(itens) : []), [itens]);
  const visiveis = useMemo(
    () => (itens ?? []).filter((item) => !repositorio || item.repositorio === repositorio),
    [itens, repositorio],
  );
  const grupos = useMemo(() => agruparEmAberto(visiveis), [visiveis]);

  const total = itens?.length ?? 0;
  const subtitulo = itens === null
    ? "Tudo o que você ainda precisa terminar, em um só lugar."
    : total === 0
      ? "Você não tem desafios em aberto."
      : `${total} ${total === 1 ? "desafio em aberto" : "desafios em aberto"}, de todos os seus projetos.`;

  return (
    <>
      <PageHeader mascot="prancheta" title="Desafios" subtitle={subtitulo}
        action={<Link href="/dashboard" className={btnPrimary + " hover:text-white"}>Escolher um projeto</Link>} />

      {erro && (
        <div role="alert" className="mt-6 rounded-2xl bg-bad-soft px-5 py-4 text-sm text-bad">
          <p>{erro}</p>
          <button onClick={tentarDeNovo} className="mt-3 h-9 rounded-xl border-[1.5px] border-bad px-4 text-sm font-bold transition duration-200 hover:bg-[#b42335] hover:text-white">Tentar de novo</button>
        </div>
      )}

      {!erro && itens === null && <div className="mt-6 h-40 animate-pulse rounded-[28px] bg-tint" />}

      {itens !== null && itens.length === 0 && (
        <Card className="mt-6">
          <p className="text-sm text-ink-2">
            Nenhum desafio em aberto agora. Abra um projeto e gere um novo desafio, ou veja o que você já fez em{" "}
            <Link href="/desafios" className="font-bold text-koda-texto">Desafios</Link>.
          </p>
        </Card>
      )}

      {repositorios.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filtrar por projeto">
          <button onClick={() => setRepositorio(undefined)} aria-pressed={!repositorio}
            className={`${chip} ${!repositorio ? "bg-koda text-white" : "bg-tint text-ink"}`}>Todos os projetos</button>
          {repositorios.map((nome) => (
            <button key={nome} onClick={() => setRepositorio(nome)} aria-pressed={repositorio === nome}
              className={`${chip} ${repositorio === nome ? "bg-koda text-white" : "bg-tint text-ink"}`}>{nome}</button>
          ))}
        </div>
      )}

      <Grupo titulo="Em andamento" itens={grupos.emAndamento} />
      <Grupo titulo="Para começar" itens={grupos.paraComecar} />
      <Grupo titulo="Sendo gerados" itens={grupos.gerando} />
    </>
  );
}

export default function DesafiosEmAberto() {
  return (
    <AppShell>
      <Conteudo />
    </AppShell>
  );
}
