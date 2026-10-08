"use client";
import Link from "next/link";
import { Check, Clock, Minus, Sparkles } from "lucide-react";
import AppShell from "../AppShell";
import { Card, Mascot } from "../ui";
import {
  dataDeRenovacao, limiteDe, linhasDaComparacao, plural, resumoDoUso,
  type NivelDeUso, type ValorDaLinha,
} from "@/lib/planos";
import { usePlano } from "@/lib/usePlano";

const COR_DA_BARRA: Record<NivelDeUso, string> = {
  folga: "bg-koda",
  atencao: "bg-warn",
  esgotado: "bg-bad",
};

function Medidor({ rotulo, usados, limite, restantes, nivel, percentual, unidade }: {
  rotulo: string; usados: number; limite: number; restantes: number; nivel: NivelDeUso; percentual: number; unidade: [string, string];
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-bold">{rotulo}</span>
        <span className="text-sm text-ink-2"><strong className="text-ink">{usados}</strong> de {limite}</span>
      </div>
      <div role="progressbar" aria-label={rotulo} aria-valuemin={0} aria-valuemax={limite} aria-valuenow={Math.min(usados, limite)}
        className="mt-2 h-3 overflow-hidden rounded-full bg-tint">
        <div className={`h-full rounded-full transition-all duration-500 ${COR_DA_BARRA[nivel]}`} style={{ width: `${percentual}%` }} />
      </div>
      <p className={`mt-1.5 text-xs ${nivel === "esgotado" ? "font-semibold text-bad" : "text-ink-2"}`}>
        {nivel === "esgotado" ? `Você usou todos os ${unidade[1]} do seu plano.` : `Restam ${plural(restantes, unidade[0], unidade[1])}.`}
      </p>
    </div>
  );
}

function Valor({ valor }: { valor: ValorDaLinha }) {
  if (typeof valor === "string") {
    if (valor === "Incluído") return <span className="inline-flex items-center gap-1.5 font-semibold text-ok"><Check className="size-4" aria-hidden="true" />Incluído</span>;
    if (valor === "—") return <span className="inline-flex items-center text-ink-2/60"><Minus className="size-4" aria-hidden="true" /><span className="sr-only">Não incluído</span></span>;
    return <span className="font-semibold">{valor}</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-ink-2">
      <Clock className="size-4" aria-hidden="true" />{valor.texto}
    </span>
  );
}

type Cartao = { id: "GRATIS" | "PRO" | "EQUIPE"; nome: string; subtitulo: string; destaque?: boolean; itens: string[] };

export function ConteudoDePlanos() {
  const { situacao, carregando, falhou } = usePlano();
  const gratis = limiteDe(situacao?.planos, "GRATIS");
  const pro = limiteDe(situacao?.planos, "PRO");

  const cartoes: Cartao[] = [
    {
      id: "GRATIS", nome: "Grátis", subtitulo: "Para aprender e testar o Koda.",
      itens: [
        "Todas as trilhas, o simulador de redes, as ferramentas e as ideias de projetos",
        "Conquistas e progresso salvos na conta",
        gratis ? `${plural(gratis.ticketsPorMes, "ticket", "tickets")} por mês gerados por IA` : "Poucos tickets por mês gerados por IA",
        gratis ? `${plural(gratis.repositorios, "repositório", "repositórios")} analisado` : "Um repositório analisado",
      ],
    },
    {
      id: "PRO", nome: "Pro", subtitulo: "Para quem pratica toda semana com projetos reais.", destaque: true,
      itens: [
        "Tudo do plano Grátis",
        pro ? `${plural(pro.ticketsPorMes, "ticket", "tickets")} por mês gerados por IA` : "Muito mais tickets por mês",
        pro ? `Até ${plural(pro.repositorios, "repositório", "repositórios")} analisados` : "Vários repositórios analisados",
        "Em breve: revisão de projeto por IA e certificado verificável",
      ],
    },
    {
      id: "EQUIPE", nome: "Equipe e escola", subtitulo: "Para bootcamps, faculdades e mentores.",
      itens: [
        "Tudo do plano Pro",
        "Em breve: painel para acompanhar o progresso de cada pessoa",
        "Em breve: cota compartilhada entre os membros",
      ],
    },
  ];

  const uso = situacao ? resumoDoUso(situacao) : null;
  const linhas = linhasDaComparacao(situacao?.planos);

  return (
    <>
      <section className="rounded-[32px] bg-koda-soft p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-6">
          <Mascot name="pensando" className="h-28 shrink-0 sm:h-36" />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-koda-texto uppercase"><Sparkles className="size-4" aria-hidden="true" />Planos</span>
            <h1 className="mt-1 text-[30px] leading-tight font-bold tracking-tight sm:text-4xl">Aprender é de graça. Você paga pelo que usa IA.</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-body">
              O conteúdo do Koda continua aberto para todo mundo. A geração de tickets com IA e a análise de vários repositórios têm custo real, por isso têm cota.
            </p>
          </div>
        </div>
      </section>

      <Card className="mt-6">
        <h2 className="text-xl font-bold">Seu uso neste mês</h2>
        {carregando && <p className="mt-3 text-sm text-ink-2" role="status">Carregando o seu uso...</p>}
        {falhou && <p className="mt-3 text-sm text-bad" role="alert">Não foi possível carregar o seu uso agora. Tente de novo em instantes.</p>}
        {situacao && uso && (
          <>
            <p className="mt-2 text-sm text-ink-2">
              Seu plano é o <strong className="text-ink">{situacao.nome}</strong>. A cota de tickets renova em <strong className="text-ink">{dataDeRenovacao(situacao.renovaEm)}</strong>.
            </p>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <Medidor rotulo="Tickets gerados" {...uso.tickets} unidade={["ticket", "tickets"]} />
              <Medidor rotulo="Repositórios analisados" {...uso.repositorios} unidade={["repositório", "repositórios"]} />
            </div>
          </>
        )}
      </Card>

      <ul className="mt-8 grid gap-5 lg:grid-cols-3" aria-label="Planos">
        {cartoes.map((c) => {
          const atual = situacao?.plano === c.id;
          return (
            <li key={c.id} className={`flex flex-col rounded-[28px] border p-6 ${c.destaque ? "border-2 border-koda/50 bg-surface shadow-lift" : "border-line bg-surface"}`}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold">{c.nome}</h2>
                {atual && <span className="rounded-full bg-ok-soft px-3 py-1 text-xs font-bold text-ok">Seu plano</span>}
                {!atual && c.id !== "GRATIS" && <span className="rounded-full bg-tint px-3 py-1 text-xs font-bold text-ink-2">Em breve</span>}
              </div>
              <p className="mt-1 text-sm text-ink-2">{c.subtitulo}</p>
              <ul className="mt-5 flex-1 space-y-3">
                {c.itens.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] leading-snug text-body">
                    <Check className="mt-0.5 size-4 shrink-0 text-koda-texto" aria-hidden="true" />{item}
                  </li>
                ))}
              </ul>
              {c.id === "GRATIS"
                ? <Link href="/desafios" className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-tint px-5 text-sm font-bold text-ink transition duration-200 hover:-translate-y-0.5">Continuar praticando</Link>
                : <button type="button" disabled className="mt-6 h-11 cursor-not-allowed rounded-2xl bg-tint px-5 text-sm font-bold text-ink-2">O pagamento ainda não está disponível</button>}
            </li>
          );
        })}
      </ul>

      <Card className="mt-8 !p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="px-6 pt-6 pb-3 text-left text-xl font-bold">O que muda em cada plano</caption>
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-ink-2 uppercase">
                <th scope="col" className="px-6 py-3 font-bold">Recurso</th>
                <th scope="col" className="px-4 py-3 font-bold">Grátis</th>
                <th scope="col" className="px-4 py-3 font-bold">Pro</th>
                <th scope="col" className="px-4 py-3 font-bold">Equipe e escola</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0">
                  <th scope="row" className="px-6 py-3.5 font-semibold">{l.rotulo}</th>
                  <td className="px-4 py-3.5"><Valor valor={l.gratis} /></td>
                  <td className="px-4 py-3.5"><Valor valor={l.pro} /></td>
                  <td className="px-4 py-3.5"><Valor valor={l.equipe} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-8">
        <h2 className="text-xl font-bold">Como a cota funciona</h2>
        <ul className="mt-4 max-w-3xl list-disc space-y-2.5 pl-6 text-[15px] leading-relaxed text-body marker:text-koda-texto">
          <li>Um ticket conta na cota assim que a geração começa. Se a geração falhar, ele não é descontado.</li>
          <li>A cota renova no primeiro dia de cada mês, pelo horário de Brasília.</li>
          <li>Existe também um limite diário, para evitar abuso. Ele vale para todos os planos.</li>
          <li>Para analisar um repositório novo, o plano precisa ter espaço. Repositórios que você já analisou continuam disponíveis.</li>
        </ul>
        <h2 className="mt-8 text-xl font-bold">Posso assinar agora?</h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-body">
          Ainda não. O pagamento está em preparação, e o que aparece como &quot;Em breve&quot; na tabela ainda não existe. Hoje, a diferença real do Pro é a cota maior. Quando o pagamento abrir, os preços serão divulgados aqui antes de qualquer cobrança.
        </p>
      </Card>
    </>
  );
}

export default function Planos() {
  return <AppShell><ConteudoDePlanos /></AppShell>;
}
