"use client";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Check, CircleAlert, Plus } from "lucide-react";
import AppShell from "./AppShell";
import { AcaoDoProgresso, NotaDoProgresso } from "./AcompanhamentoDoDesafio";
import PainelDeDicas from "./PainelDeDicas";
import SeloProgresso from "./SeloProgresso";
import { btnPrimary, Chip, Mascot } from "./ui";
import type { ConteudoDesafio, DesafioDetalhe, ProgressoDesafio } from "@/lib/api";
import { estaGerando, rotuloDoTipo } from "@/lib/desafio";
import { useDesafio } from "@/lib/useDesafio";

const marca = {
  ponto: <span className="size-1.5 rounded-full bg-koda" />,
  check: <Check className="size-3.5 text-koda-texto" strokeWidth={3} />,
  alerta: <CircleAlert className="size-3.5 text-koda-texto" strokeWidth={3} />,
};

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2.5 text-xs font-bold tracking-[0.12em] text-koda-texto uppercase">{titulo}</h2>
      {children}
    </section>
  );
}

function Texto({ titulo, texto }: { titulo: string; texto: string }) {
  return <Bloco titulo={titulo}><p className="leading-relaxed text-body">{texto}</p></Bloco>;
}

function Lista({ titulo, itens, tipo }: { titulo: string; itens: string[]; tipo: keyof typeof marca }) {
  return (
    <Bloco titulo={titulo}>
      <ul className="grid gap-2">
        {itens.map((item, i) => (
          <li key={`${i}-${item}`} className="flex gap-3 text-[15px] leading-relaxed text-body">
            <span className="mt-0.5 grid size-5.5 shrink-0 place-items-center rounded-[7px] bg-koda-soft">{marca[tipo]}</span>{item}
          </li>
        ))}
      </ul>
    </Bloco>
  );
}

type Aba = { id: string; rotulo: string; contagem?: number; conteudo: ReactNode };

function abasDe(c: ConteudoDesafio): Aba[] {
  return [
    {
      id: "resumo",
      rotulo: "Resumo",
      conteudo: (
        <div className="grid gap-6">
          <Texto titulo="Objetivo" texto={c.objetivo} />
          <Texto titulo="Contexto" texto={c.contexto} />
          <Texto titulo="Cenário atual" texto={c.cenarioAtual} />
        </div>
      ),
    },
    {
      id: "fazer",
      rotulo: "O que fazer",
      contagem: c.regrasDeNegocio.length + c.requisitosTecnicos.length + c.restricoes.length,
      conteudo: (
        <div className="grid gap-6 xl:grid-cols-2">
          <Lista titulo="Regras de negócio" itens={c.regrasDeNegocio} tipo="ponto" />
          <Lista titulo="Requisitos técnicos" itens={c.requisitosTecnicos} tipo="ponto" />
          <div className="xl:col-span-2"><Lista titulo="Restrições" itens={c.restricoes} tipo="alerta" /></div>
        </div>
      ),
    },
    {
      id: "validar",
      rotulo: "Como validar",
      contagem: c.criteriosDeAceite.length + c.testesEsperados.length,
      conteudo: (
        <div className="grid gap-6 xl:grid-cols-2">
          <Lista titulo="Critérios de aceite" itens={c.criteriosDeAceite} tipo="check" />
          <Lista titulo="Testes esperados" itens={c.testesEsperados} tipo="check" />
          <div className="xl:col-span-2">
            <Bloco titulo="Habilidades praticadas">
              <div className="flex flex-wrap gap-2">{c.habilidades.map((h) => <Chip key={h}>{h}</Chip>)}</div>
            </Bloco>
          </div>
        </div>
      ),
    },
  ];
}

/** Abas do conteúdo do ticket: tudo fica a um clique, sem rolar a página inteira. Setas do teclado trocam de aba. */
function AbasDoTicket({ conteudo }: { conteudo: ConteudoDesafio }) {
  const abas = abasDe(conteudo);
  const [atual, setAtual] = useState(abas[0].id);
  const botoes = useRef<Record<string, HTMLButtonElement | null>>({});

  function aoTeclar(e: KeyboardEvent<HTMLDivElement>) {
    const indice = abas.findIndex((a) => a.id === atual);
    const passo = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (passo === 0) return;
    e.preventDefault();
    const proxima = abas[(indice + passo + abas.length) % abas.length];
    setAtual(proxima.id);
    botoes.current[proxima.id]?.focus();
  }

  const aba = abas.find((a) => a.id === atual) ?? abas[0];

  return (
    <section className="flex min-h-0 flex-col rounded-3xl bg-surface shadow-soft lg:h-full">
      <div role="tablist" aria-label="Partes do ticket" onKeyDown={aoTeclar} className="flex shrink-0 gap-1 border-b border-line px-3 pt-3">
        {abas.map((a) => {
          const ativa = a.id === atual;
          return (
            <button
              key={a.id}
              ref={(el) => { botoes.current[a.id] = el; }}
              role="tab"
              id={`aba-${a.id}`}
              aria-selected={ativa}
              aria-controls={`painel-${a.id}`}
              tabIndex={ativa ? 0 : -1}
              onClick={() => setAtual(a.id)}
              className={`-mb-px rounded-t-xl border-b-2 px-4 py-2.5 text-sm font-semibold transition duration-200 ${ativa ? "border-koda text-koda-texto" : "border-transparent text-ink-2 hover:bg-tint-2 hover:text-ink"}`}
            >
              {a.rotulo}
              {a.contagem !== undefined && <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${ativa ? "bg-koda-soft text-koda-texto" : "bg-tint text-ink-3"}`}>{a.contagem}</span>}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`painel-${aba.id}`} aria-labelledby={`aba-${aba.id}`} tabIndex={0} className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-7">
        {aba.conteudo}
      </div>
    </section>
  );
}

function Mensagem({ titulo, texto, href, rotulo }: { titulo: string; texto: string; href: string; rotulo: string }) {
  return (
    <AppShell width="max-w-[560px]">
      <div className="text-center">
        <Mascot name="duvida" className="mx-auto h-44 sm:h-52" />
        <h1 className="mt-2 text-[28px] font-bold tracking-tight">{titulo}</h1>
        <p className="mx-auto mt-3 max-w-[440px] text-ink-2">{texto}</p>
        <Link href={href} className={btnPrimary + " mt-8 hover:text-white"}>{rotulo}</Link>
      </div>
    </AppShell>
  );
}

function Ticket({ desafio, conteudo }: { desafio: DesafioDetalhe; conteudo: ConteudoDesafio }) {
  const [atualizado, setAtualizado] = useState<ProgressoDesafio | null>(null);
  const progresso: ProgressoDesafio = atualizado ?? {
    statusProgresso: desafio.statusProgresso,
    iniciadoEm: desafio.iniciadoEm,
    finalizadoEm: desafio.finalizadoEm,
  };
  const projeto = `/projeto?analise=${encodeURIComponent(desafio.analiseId)}`;
  const novo = `/desafio/novo?analise=${encodeURIComponent(desafio.analiseId)}`;

  return (
    <AppShell width="max-w-[1360px]">
      <div className="flex flex-col gap-4 lg:h-[calc(100dvh-8rem)]">
        <header className="shrink-0 rounded-3xl bg-surface px-6 py-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-[10px] bg-koda-soft px-3 py-1 text-[13px] font-bold text-koda-texto">{desafio.codigo}</span>
              {[rotuloDoTipo(desafio.tipo), "Júnior"].map((t) => (
                <span key={t} className="rounded-lg border border-line-2 px-2.5 py-0.5 text-xs text-koda-texto">{t}</span>
              ))}
              <SeloProgresso status={progresso.statusProgresso} />
            </div>
            <div className="flex flex-wrap items-start justify-end gap-2">
              <AcaoDoProgresso desafioId={desafio.id} progresso={progresso} aoMudar={setAtualizado} />
              <Link href={projeto} className="inline-flex h-10 items-center rounded-xl border border-line-2 px-4 text-sm font-semibold text-ink transition duration-200 hover:-translate-x-0.5 hover:bg-tint-2 hover:text-ink">← Projeto</Link>
              <Link href={novo} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line-2 px-4 text-sm font-semibold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-tint-2 hover:text-ink active:scale-[.97]">
                <Plus className="size-4" /> Outro desafio
              </Link>
            </div>
          </div>
          <h1 className="mt-3 text-xl leading-snug font-bold tracking-tight sm:text-2xl">{conteudo.titulo}</h1>
          <NotaDoProgresso progresso={progresso} />
        </header>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <AbasDoTicket conteudo={conteudo} />
          <div className="flex min-h-0 flex-col">
            <PainelDeDicas desafioId={desafio.id} status={progresso.statusProgresso} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function TicketDesafio({ id }: { id: string }) {
  const { desafio, erro } = useDesafio(id);

  if (erro) return <Mensagem titulo="Não foi possível carregar" texto={erro} href="/dashboard" rotulo="Voltar ao início" />;
  if (!desafio) {
    return (
      <AppShell width="max-w-[1360px]">
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="h-96 animate-pulse rounded-3xl bg-surface shadow-soft" />
          <div className="h-96 animate-pulse rounded-3xl bg-surface shadow-soft" />
        </div>
      </AppShell>
    );
  }

  if (desafio.statusGeracao === "FALHOU") {
    return <Mensagem titulo="A geração falhou" texto={desafio.mensagemErro ?? "O desafio não foi gerado."}
      href={`/desafio/novo?analise=${encodeURIComponent(desafio.analiseId)}`} rotulo="Tentar de novo" />;
  }
  if (estaGerando(desafio.statusGeracao) || !desafio.conteudo) {
    return <Mensagem titulo="Desafio em geração" texto="A IA ainda está escrevendo este ticket."
      href={`/desafio/gerando?desafio=${encodeURIComponent(id)}`} rotulo="Acompanhar" />;
  }

  return <Ticket desafio={desafio} conteudo={desafio.conteudo} />;
}
