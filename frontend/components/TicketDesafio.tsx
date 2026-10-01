"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { Check, CircleAlert, Plus } from "lucide-react";
import AppShell from "./AppShell";
import { BackLink, btnPrimary, Chip, Mascot } from "./ui";
import type { ConteudoDesafio, DesafioDetalhe, ProgressoDesafio } from "@/lib/api";
import { estaGerando, rotuloDoTipo } from "@/lib/desafio";
import { useDesafio } from "@/lib/useDesafio";
import AcompanhamentoDoDesafio from "./AcompanhamentoDoDesafio";
import SeloProgresso from "./SeloProgresso";
import PainelDeDicas from "./PainelDeDicas";
import { useState } from "react";

const marca = {
  ponto: <span className="size-1.5 rounded-full bg-koda" />,
  check: <Check className="size-3.5 text-koda" strokeWidth={3} />,
  alerta: <CircleAlert className="size-3.5 text-koda" strokeWidth={3} />,
};

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] bg-white px-6 py-6 shadow-soft sm:px-9 sm:py-7">
      <h2 className="mb-3.5 text-xs font-bold tracking-[0.12em] text-koda uppercase">{titulo}</h2>
      {children}
    </section>
  );
}

function Texto({ titulo, texto }: { titulo: string; texto: string }) {
  return <Secao titulo={titulo}><p className="leading-relaxed text-[#2a2f4a]">{texto}</p></Secao>;
}

function Lista({ titulo, itens, tipo }: { titulo: string; itens: string[]; tipo: keyof typeof marca }) {
  return (
    <Secao titulo={titulo}>
      <ul className="grid gap-2.5">
        {itens.map((item, i) => (
          <li key={`${i}-${item}`} className="flex gap-3 leading-relaxed text-[#2a2f4a]">
            <span className="mt-0.5 grid size-5.5 shrink-0 place-items-center rounded-[7px] bg-koda-soft">{marca[tipo]}</span>{item}
          </li>
        ))}
      </ul>
    </Secao>
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

  return (
    <AppShell width="max-w-[860px]">
      <BackLink href={projeto}>← Voltar ao projeto</BackLink>
      <div className="grid gap-5">
        <header className="rounded-[28px] bg-white p-6 shadow-soft sm:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-[10px] bg-koda-soft px-3.5 py-1.5 text-sm font-bold text-koda">{desafio.codigo}</span>
            {[rotuloDoTipo(desafio.tipo), "Júnior"].map((t) => (
              <span key={t} className="rounded-lg border border-[#ddd9ff] px-3 py-1 text-xs text-koda">{t}</span>
            ))}
            <SeloProgresso status={progresso.statusProgresso} />
          </div>
          <h1 className="mt-5 text-2xl leading-tight font-bold tracking-tight sm:text-3xl">{conteudo.titulo}</h1>
        </header>

        <AcompanhamentoDoDesafio desafioId={desafio.id} progresso={progresso} aoMudar={setAtualizado} />

        <Texto titulo="Contexto" texto={conteudo.contexto} />
        <Texto titulo="Cenário atual" texto={conteudo.cenarioAtual} />
        <Texto titulo="Objetivo" texto={conteudo.objetivo} />
        <Lista titulo="Regras de negócio" itens={conteudo.regrasDeNegocio} tipo="ponto" />
        <Lista titulo="Requisitos técnicos" itens={conteudo.requisitosTecnicos} tipo="ponto" />
        <Lista titulo="Critérios de aceite" itens={conteudo.criteriosDeAceite} tipo="check" />
        <Lista titulo="Testes esperados" itens={conteudo.testesEsperados} tipo="check" />
        <Lista titulo="Restrições" itens={conteudo.restricoes} tipo="alerta" />
        <Secao titulo="Habilidades praticadas">
          <div className="flex flex-wrap gap-2">{conteudo.habilidades.map((h) => <Chip key={h}>{h}</Chip>)}</div>
        </Secao>

        <PainelDeDicas desafioId={desafio.id} status={progresso.statusProgresso} />

        <div className="flex justify-center pt-2">
          <Link href={`/desafio/novo?analise=${encodeURIComponent(desafio.analiseId)}`} className={btnPrimary + " hover:text-white"}>
            <Plus className="size-4" /> Gerar outro desafio
          </Link>
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
      <AppShell width="max-w-[860px]">
        <div className="mt-10 grid gap-5">
          {[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-[28px] bg-white shadow-soft" />)}
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
