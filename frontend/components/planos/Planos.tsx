"use client";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Clock, Minus, ShieldCheck, Sparkles } from "lucide-react";
import AppShell from "../AppShell";
import type { NomeDoPlano } from "@/lib/api";
import {
  agruparLinhas, dataDeRenovacao, limiteDe, linhasDaComparacao, PERGUNTAS, plural, resumoDoUso, ROTULO_DO_GRUPO,
  type NivelDeUso, type ValorDaLinha,
} from "@/lib/planos";
import { usePlano } from "@/lib/usePlano";

const COR_DO_NIVEL: Record<NivelDeUso, string> = {
  folga: "bg-koda",
  atencao: "bg-warn",
  esgotado: "bg-bad",
};

type Medida = { usados: number; limite: number; restantes: number; nivel: NivelDeUso; percentual: number };

function Medidor({ rotulo, medida, unidade }: { rotulo: string; medida: Medida; unidade: [string, string] }) {
  const segmentado = medida.limite <= 10;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="font-semibold">{rotulo}</span>
        <span className="text-ink-2"><strong className="text-ink">{medida.usados}</strong> de {medida.limite}</span>
      </div>
      <div role="progressbar" aria-label={rotulo} aria-valuemin={0} aria-valuemax={medida.limite} aria-valuenow={Math.min(medida.usados, medida.limite)} className="mt-2">
        {segmentado ? (
          <div className="flex gap-1.5">
            {Array.from({ length: medida.limite }, (_, i) => (
              <span key={i} className={`h-2.5 flex-1 rounded-full transition-colors duration-500 ${i < medida.usados ? COR_DO_NIVEL[medida.nivel] : "bg-tint"}`} />
            ))}
          </div>
        ) : (
          <div className="h-2.5 overflow-hidden rounded-full bg-tint">
            <div className={`h-full rounded-full transition-all duration-500 ${COR_DO_NIVEL[medida.nivel]}`} style={{ width: `${medida.percentual}%` }} />
          </div>
        )}
      </div>
      <p className={`mt-1.5 text-xs ${medida.nivel === "esgotado" ? "font-semibold text-bad" : "text-ink-2"}`}>
        {medida.nivel === "esgotado" ? `Você usou todos os ${unidade[1]} do seu plano.` : `Restam ${plural(medida.restantes, unidade[0], unidade[1])}.`}
      </p>
    </div>
  );
}

function Celula({ valor, destaque }: { valor: ValorDaLinha; destaque: boolean }) {
  const base = `px-4 py-3.5 ${destaque ? "bg-koda-soft/60" : ""}`;
  if (typeof valor === "string") {
    if (valor === "Incluído") return <td className={base}><span className="inline-flex items-center gap-1.5 font-semibold text-ok"><Check className="size-4" aria-hidden="true" />Incluído</span></td>;
    if (valor === "—") return <td className={base}><span className="inline-flex text-ink-2/60"><Minus className="size-4" aria-hidden="true" /><span className="sr-only">Não incluído</span></span></td>;
    return <td className={`${base} font-bold`}>{valor}</td>;
  }
  return <td className={base}><span className="inline-flex items-center gap-1.5 text-ink-2"><Clock className="size-4" aria-hidden="true" />{valor.texto}</span></td>;
}

type Cartao = {
  id: NomeDoPlano | "EQUIPE";
  nome: string;
  paraQuem: string;
  numero: string;
  unidade: string;
  detalhe: string;
  itens: string[];
  destaque?: boolean;
};

export function ConteudoDePlanos() {
  const { situacao, carregando, falhou } = usePlano();
  const gratis = limiteDe(situacao?.planos, "GRATIS");
  const pro = limiteDe(situacao?.planos, "PRO");
  const uso = situacao ? resumoDoUso(situacao) : null;

  const cartoes: Cartao[] = [
    {
      id: "GRATIS", nome: "Grátis", paraQuem: "Para aprender e testar o Koda.",
      numero: gratis ? String(gratis.ticketsPorMes) : "—", unidade: "tickets por mês",
      detalhe: gratis ? `e ${plural(gratis.repositorios, "repositório analisado", "repositórios analisados")}` : "e um repositório analisado",
      itens: ["Todas as trilhas e desafios de segurança", "Simulador de redes, ferramentas e ideias de projetos", "Conquistas e progresso salvos na conta"],
    },
    {
      id: "PRO", nome: "Pro", paraQuem: "Para quem pratica toda semana com projetos reais.", destaque: true,
      numero: pro ? String(pro.ticketsPorMes) : "—", unidade: "tickets por mês",
      detalhe: pro ? `e até ${plural(pro.repositorios, "repositório analisado", "repositórios analisados")}` : "e vários repositórios analisados",
      itens: ["Tudo do plano Grátis +", pro && gratis ? `Cota ${Math.round(pro.ticketsPorMes / gratis.ticketsPorMes)} vezes maior de tickets` : "Cota muito maior de tickets", "Em breve: revisão de projeto por IA", "Em breve: certificado verificável"],
    },
    {
      id: "EQUIPE", nome: "Equipe e escola", paraQuem: "Para bootcamps, faculdades e mentores.",
      numero: "Sob consulta", unidade: "",
      detalhe: "cota compartilhada entre os membros",
      itens: ["Tudo do plano Pro +", "Em breve: painel de progresso por pessoa", "Em breve: cota compartilhada"],
    },
  ];

  const grupos = agruparLinhas(linhasDaComparacao(situacao?.planos));
  const atual = situacao?.plano;

  return (
    <>
      <header className="max-w-3xl">
        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-koda-texto uppercase"><Sparkles className="size-4" aria-hidden="true" />Planos</span>
        <h1 className="mt-2 text-[34px] leading-[1.1] font-extrabold tracking-tight sm:text-5xl">
          Aprender é de graça. <span className="text-koda-texto">Você paga pela IA.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
          Trilhas, redes, ferramentas e ideias de projetos ficam abertas para todo mundo. A geração de tickets e a análise de repositórios usam IA e têm custo real, por isso têm cota.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2.5 text-[13px] font-semibold" aria-label="Garantias">
          {["Conteúdo sempre aberto", "Sem cartão de crédito", "A cota renova todo mês"].map((t) => (
            <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-tint px-3.5 py-1.5 text-ink"><ShieldCheck className="size-4 text-ok" aria-hidden="true" />{t}</li>
          ))}
        </ul>
      </header>

      {carregando && <p className="mt-8 text-sm text-ink-2" role="status">Carregando o seu uso...</p>}
      {falhou && <p className="mt-8 rounded-2xl bg-bad-soft px-5 py-3 text-sm text-bad" role="alert">Não foi possível carregar o seu uso agora. Tente de novo em instantes.</p>}

      <ul className="mt-10 grid items-stretch gap-6 lg:grid-cols-3" aria-label="Planos">
        {cartoes.map((c) => {
          const doUsuario = atual === c.id;
          const medidas = doUsuario && uso ? uso : null;
          return (
            <li key={c.id} className={`relative flex flex-col rounded-[28px] p-7 ${c.destaque
              ? "border-2 border-koda/60 bg-gradient-to-b from-koda/15 via-surface to-surface shadow-lift"
              : "border border-line bg-surface"} ${c.destaque ? "lg:-mt-3 lg:mb-3" : ""}`}>
              {c.destaque && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-koda px-4 py-1 text-xs font-extrabold tracking-wide text-white uppercase shadow-soft">Mais completo</span>
              )}
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold">{c.nome}</h2>
                {doUsuario && <span className="rounded-full bg-ok-soft px-3 py-1 text-xs font-bold text-ok">Seu plano</span>}
                {!doUsuario && c.id !== "GRATIS" && <span className="rounded-full bg-tint px-3 py-1 text-xs font-bold text-ink-2">Em breve</span>}
              </div>
              <p className="mt-1 text-sm text-ink-2">{c.paraQuem}</p>

              <p className="mt-6 flex items-end gap-2">
                <span className={`${c.numero.length > 3 ? "text-3xl" : "text-6xl"} leading-none font-extrabold tracking-tight`}>{c.numero}</span>
                {c.unidade && <span className="pb-1 text-sm font-semibold text-ink-2">{c.unidade}</span>}
              </p>
              <p className="mt-1.5 text-sm text-ink-2">{c.detalhe}</p>

              {medidas && (
                <div className="mt-6 grid gap-4 rounded-2xl bg-tint p-4">
                  <Medidor rotulo="Tickets deste mês" medida={medidas.tickets} unidade={["ticket", "tickets"]} />
                  <Medidor rotulo="Repositórios" medida={medidas.repositorios} unidade={["repositório", "repositórios"]} />
                  {situacao && <p className="text-xs text-ink-2">A cota renova em <strong className="text-ink">{dataDeRenovacao(situacao.renovaEm)}</strong>.</p>}
                </div>
              )}

              <div className="mt-6">
                {c.id === "GRATIS" ? (
                  <>
                    <Link href="/desafios" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-koda px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-koda-dark hover:text-white active:scale-95">
                      Continuar praticando<ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    <p className="mt-2 text-center text-xs text-ink-2">Sem cartão. Sem prazo.</p>
                  </>
                ) : (
                  <>
                    <button type="button" disabled className="h-11 w-full cursor-not-allowed rounded-2xl bg-tint px-5 text-sm font-bold text-ink-2">Em breve</button>
                    <p className="mt-2 text-center text-xs text-ink-2">O pagamento ainda não está disponível.</p>
                  </>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6">
                {c.itens.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] leading-snug text-body">
                    <Check className="mt-0.5 size-4 shrink-0 text-koda-texto" aria-hidden="true" />{item}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <section className="mt-16" aria-labelledby="titulo-da-tabela">
        <h2 id="titulo-da-tabela" className="text-2xl font-bold tracking-tight">O que muda em cada plano</h2>
        <p className="mt-1 text-sm text-ink-2">Só as diferenças que importam. O que está como &quot;Em breve&quot; ainda não existe.</p>
        <div className="relative mt-5 overflow-x-auto rounded-[24px] border border-line bg-surface">
          <table className="w-full min-w-[680px] text-left text-sm">
            <caption className="sr-only">O que muda em cada plano</caption>
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-ink-2 uppercase">
                <th scope="col" className="sticky left-0 bg-surface px-5 py-3.5 font-bold">Recurso</th>
                {([["GRATIS", "Grátis"], ["PRO", "Pro"], ["EQUIPE", "Equipe e escola"]] as const).map(([id, nome]) => (
                  <th key={id} scope="col" className={`px-4 py-3.5 font-bold ${atual === id ? "bg-koda-soft/60 text-koda-texto" : ""}`}>
                    {nome}{atual === id && <span className="ml-1.5 normal-case">(você)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            {grupos.map((g) => (
              <tbody key={g.grupo}>
                <tr>
                  <th colSpan={4} scope="colgroup" className="bg-tint/60 px-5 py-2 text-[11px] font-extrabold tracking-[0.12em] text-ink-2 uppercase">{ROTULO_DO_GRUPO[g.grupo]}</th>
                </tr>
                {g.linhas.map((l) => (
                  <tr key={l.id} className="border-b border-line last:border-0">
                    <th scope="row" title={l.dica} className="sticky left-0 bg-surface px-5 py-3.5 font-semibold">{l.rotulo}</th>
                    <Celula valor={l.gratis} destaque={atual === "GRATIS"} />
                    <Celula valor={l.pro} destaque={atual === "PRO"} />
                    <Celula valor={l.equipe} destaque={false} />
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="titulo-do-faq">
        <h2 id="titulo-do-faq" className="text-2xl font-bold tracking-tight">Perguntas frequentes</h2>
        <div className="mt-5 grid max-w-3xl gap-3">
          {PERGUNTAS.map((p) => (
            <details key={p.pergunta} className="group rounded-2xl border border-line bg-surface px-5 py-4 transition-colors open:border-koda/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-bold">
                {p.pergunta}
                <ChevronDown className="size-4 shrink-0 text-ink-2 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-body">{p.resposta}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-16 flex flex-wrap items-center justify-between gap-5 rounded-[28px] bg-koda-soft px-7 py-8">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold tracking-tight">Comece pelo que já é seu.</h2>
          <p className="mt-1 text-body">Conecte um repositório, gere o primeiro ticket e estude no seu ritmo. Você só pensa em plano quando a cota apertar.</p>
        </div>
        <Link href="/repositorios/adicionar" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-koda px-6 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-koda-dark hover:text-white active:scale-95">
          Conectar um repositório<ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}

export default function Planos() {
  return <AppShell><ConteudoDePlanos /></AppShell>;
}
