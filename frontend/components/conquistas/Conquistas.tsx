"use client";
import { useState, type ComponentType } from "react";
import { Award, BookOpen, Flag, GraduationCap, KeyRound, Lock, Map, Network, ShieldCheck, Star, Target, Trophy, Zap } from "lucide-react";
import AppShell from "../AppShell";
import { Card, Mascot } from "../ui";
import {
  CATEGORIAS_DE_INSIGNIA, proximasInsignias, resumirInsignias,
  type CategoriaDeInsignia, type IconeDeInsignia, type Insignia, type NivelDeInsignia,
} from "@/lib/insignias";
import { useInsignias } from "@/lib/useInsignias";

const ICONES: Record<IconeDeInsignia, ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  livro: BookOpen, estrela: Star, trofeu: Trophy, rede: Network, escudo: ShieldCheck, bandeira: Flag,
  alvo: Target, chave: KeyRound, diploma: GraduationCap, raio: Zap, mapa: Map,
};

const NIVEIS: Record<NivelDeInsignia, { rotulo: string; anel: string; fundo: string; texto: string }> = {
  bronze: { rotulo: "Bronze", anel: "from-[#e3a56b] to-[#a8642b]", fundo: "bg-[#cd7f32]/15", texto: "text-[#cd7f32]" },
  prata: { rotulo: "Prata", anel: "from-[#e6eaf2] to-[#9aa3b5]", fundo: "bg-[#c0c7d1]/15", texto: "text-[#aab3c2]" },
  ouro: { rotulo: "Ouro", anel: "from-[#ffe08a] to-[#e0a415]", fundo: "bg-[#f5c542]/15", texto: "text-[#e0a415]" },
};

function Medalha({ insignia }: { insignia: Insignia }) {
  const Icone = ICONES[insignia.icone];
  const nivel = NIVEIS[insignia.nivel];
  return (
    <span className={`relative grid size-16 shrink-0 place-items-center rounded-full bg-gradient-to-br p-[3px] ${nivel.anel} ${insignia.conquistada ? "shadow-[0_6px_18px_rgb(0_0_0/0.25)]" : "opacity-40 grayscale"}`}>
      <span className="grid size-full place-items-center rounded-full bg-surface text-ink">
        <Icone className="size-7" aria-hidden={true} />
      </span>
      {!insignia.conquistada && (
        <span className="absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full bg-tint text-ink-2"><Lock className="size-3" aria-hidden="true" /></span>
      )}
    </span>
  );
}

function Cartao({ insignia }: { insignia: Insignia }) {
  const nivel = NIVEIS[insignia.nivel];
  const percentual = Math.round((insignia.atual / insignia.total) * 100);
  return (
    <li className={`flex gap-4 rounded-[24px] border p-4 transition duration-200 hover:-translate-y-0.5 ${insignia.conquistada ? "border-line-2 bg-surface" : "border-line bg-surface/60"}`}
      data-conquistada={insignia.conquistada}>
      <Medalha insignia={insignia} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] leading-snug font-bold">{insignia.titulo}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${nivel.fundo} ${nivel.texto}`}>{nivel.rotulo}</span>
        </div>
        <p className="mt-1 text-[13px] leading-snug text-ink-2">{insignia.descricao}</p>
        {insignia.conquistada
          ? <p className="mt-2 text-xs font-bold text-ok">Conquistada</p>
          : (
            <div className="mt-2">
              <div role="progressbar" aria-label={`Progresso de ${insignia.titulo}`} aria-valuemin={0} aria-valuemax={insignia.total} aria-valuenow={insignia.atual} className="h-1.5 overflow-hidden rounded-full bg-track">
                <div className="h-full rounded-full bg-koda transition-all duration-500" style={{ width: `${percentual}%` }} />
              </div>
              <p className="mt-1 text-xs font-semibold text-ink-2">{insignia.atual} de {insignia.total}</p>
            </div>
          )}
      </div>
    </li>
  );
}

export function ConteudoDeConquistas() {
  const { insignias, carregando, incompleto } = useInsignias();
  const [categoria, setCategoria] = useState<CategoriaDeInsignia | null>(null);
  const resumo = resumirInsignias(insignias);
  const proximas = proximasInsignias(insignias);
  const percentual = Math.round((resumo.conquistadas / resumo.total) * 100);
  const chip = "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition duration-200 hover:-translate-y-0.5 active:scale-95";

  return (
    <>
      <section className="rounded-[32px] bg-koda-soft p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-6">
          <Mascot name="festa" className="h-28 shrink-0 sm:h-36" />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-koda-texto uppercase"><Award className="size-4" aria-hidden="true" />Suas conquistas</span>
            <h1 className="mt-1 text-[30px] leading-tight font-bold tracking-tight sm:text-4xl">Conquistas</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-body">
              Cada lição lida, laboratório concluído, desafio de segurança resolvido e ticket entregue vira progresso aqui. As insígnias são calculadas a partir do que você já fez e ficam salvas na sua conta.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="min-w-[220px] flex-1 sm:max-w-sm">
                <p className="text-sm font-semibold text-ink">{carregando ? "Calculando…" : `${resumo.conquistadas} de ${resumo.total} insígnias conquistadas`}</p>
                <div role="progressbar" aria-label="Insígnias conquistadas" aria-valuemin={0} aria-valuemax={resumo.total} aria-valuenow={resumo.conquistadas} className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-koda transition-all duration-500" style={{ width: `${percentual}%` }} />
                </div>
              </div>
              <ul className="flex gap-3" aria-label="Insígnias por nível">
                {(Object.keys(NIVEIS) as NivelDeInsignia[]).map((nivel) => (
                  <li key={nivel} className={`rounded-full px-3 py-1 text-xs font-bold ${NIVEIS[nivel].fundo} ${NIVEIS[nivel].texto}`}>{NIVEIS[nivel].rotulo}: {resumo.porNivel[nivel]}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {incompleto && (
        <p role="status" className="mt-5 rounded-2xl bg-warn-soft px-5 py-3 text-sm font-semibold text-warn">
          Não foi possível carregar parte do seu histórico (segurança ou tickets). As insígnias dessas áreas podem aparecer incompletas.
        </p>
      )}

      {proximas.length > 0 && (
        <section className="mt-8" aria-labelledby="quase-la">
          <h2 id="quase-la" className="text-xl font-bold">Quase lá</h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">{proximas.map((i) => <Cartao key={i.id} insignia={i} />)}</ul>
        </section>
      )}

      <div role="group" aria-label="Filtrar por área" className="mt-10 flex flex-wrap gap-2">
        <button type="button" aria-pressed={categoria === null} onClick={() => setCategoria(null)} className={`${chip} ${categoria === null ? "bg-koda text-white" : "bg-tint text-ink"}`}>Todas</button>
        {CATEGORIAS_DE_INSIGNIA.map((c) => (
          <button key={c.valor} type="button" aria-pressed={categoria === c.valor} onClick={() => setCategoria(c.valor)} className={`${chip} ${categoria === c.valor ? "bg-koda text-white" : "bg-tint text-ink"}`}>{c.rotulo}</button>
        ))}
      </div>

      {CATEGORIAS_DE_INSIGNIA.filter((c) => categoria === null || categoria === c.valor).map((c) => {
        const daArea = insignias.filter((i) => i.categoria === c.valor);
        const feitas = daArea.filter((i) => i.conquistada).length;
        return (
          <section key={c.valor} className="mt-8" aria-labelledby={`area-${c.valor}`}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 id={`area-${c.valor}`} className="text-xl font-bold">{c.rotulo}</h2>
              <span className="text-sm font-semibold text-ink-2">{feitas} de {daArea.length}</span>
            </div>
            <ul className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{daArea.map((i) => <Cartao key={i.id} insignia={i} />)}</ul>
          </section>
        );
      })}

      <Card className="mt-10 !p-5">
        <p className="text-sm leading-relaxed text-ink-2">
          Quer mais insígnias? Estude uma trilha em <strong className="text-ink">Aprenda aqui</strong>, monte uma rede em <strong className="text-ink">Redes</strong>, resolva um desafio em <strong className="text-ink">Segurança</strong> ou entregue um ticket em <strong className="text-ink">Desafios</strong>.
        </p>
      </Card>
    </>
  );
}

export default function Conquistas() {
  return <AppShell><ConteudoDeConquistas /></AppShell>;
}
