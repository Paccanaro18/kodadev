"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import IconeDeTecnologia from "../IconeDeTecnologia";
import { BarraDeProgresso, paraProgresso } from "./Roteiro";
import { percentualConcluido } from "@/lib/progressoDeEstudo";
import type { ResumoDeTrilha } from "@/lib/trilhas/tipos";
import { useEstudo } from "@/lib/useEstudo";

/** O cartão de uma trilha na página inicial do Aprenda, com o progresso da pessoa. */
export default function CartaoDaTrilha({ trilha }: { trilha: ResumoDeTrilha }) {
  const { progresso, carregado } = useEstudo(trilha.slug);
  const itens = trilha.etapas.flatMap((etapa) => etapa.itens);
  const modulos = itens.filter((item) => item.tipo === "modulo").length;
  const percentual = carregado ? percentualConcluido(progresso, itens.map(paraProgresso)) : 0;

  return (
    <Link href={`/aprenda/${trilha.slug}`}
      className="flex h-full flex-col rounded-[28px] bg-surface p-7 text-ink shadow-soft transition duration-200 hover:-translate-y-1 hover:text-ink hover:shadow-lift">
      <span className="grid size-14 place-items-center rounded-2xl bg-tint"><span className="scale-[2.2]"><IconeDeTecnologia icone={trilha.slug} tamanho="medio" /></span></span>
      <h2 className="mt-5 text-xl leading-snug font-bold">{trilha.titulo}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-body">{trilha.descricao}</p>
      <p className="mt-4 text-xs text-ink-2">{modulos} módulos prontos · {trilha.planejados.length} a caminho · desafios e checkpoints</p>
      <div className="mt-4"><BarraDeProgresso percentual={percentual} rotulo="Seu progresso" /></div>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-koda-texto">Ver a trilha <ArrowRight className="size-4" aria-hidden="true" /></span>
    </Link>
  );
}
