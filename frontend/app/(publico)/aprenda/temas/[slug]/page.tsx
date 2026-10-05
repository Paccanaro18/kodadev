import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ExternalLink } from "lucide-react";
import BlocosDeConteudo from "@/components/publico/BlocosDeConteudo";
import { ChamadaParaEntrar } from "@/components/publico/PaginaPublica";
import { AULAS, aulaPorSlug, indiceDaAula, proximasLeituras, TRILHAS } from "@/lib/conteudoAprenda";

type Parametros = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return AULAS.map((aula) => ({ slug: aula.slug }));
}

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { slug } = await params;
  const aula = aulaPorSlug(slug);
  return aula ? { title: `${aula.titulo} | Koda`, description: aula.resumo } : {};
}

export default async function Page({ params }: Parametros) {
  const { slug } = await params;
  const aula = aulaPorSlug(slug);
  if (!aula) notFound();

  const proximas = proximasLeituras(aula);
  const indice = indiceDaAula(aula);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_240px]">
      <article className="min-w-0 max-w-[780px]">
        <Link href="/aprenda/temas" className="text-sm font-semibold text-koda-texto">← Temas e leituras</Link>
        <div className="mt-6 text-xs font-bold tracking-[0.12em] text-koda-texto uppercase">
          {TRILHAS[aula.trilha].rotulo} · {aula.nivel} · {aula.leitura} de leitura
        </div>
        <h1 className="mt-3 text-[30px] leading-tight font-extrabold tracking-tight sm:text-[42px]">{aula.titulo}</h1>
        <p className="mt-4 text-lg leading-relaxed text-body">{aula.resumo}</p>

        {aula.preRequisitos && (
          <section className="mt-8 rounded-2xl border border-line p-5" aria-labelledby="pre-requisitos">
            <h2 id="pre-requisitos" className="text-sm font-bold tracking-[0.1em] text-ink-2 uppercase">Antes de ler</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-body marker:text-koda-texto">
              {aula.preRequisitos.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        )}

        {aula.pontosChave && (
          <section className="mt-5 rounded-2xl bg-koda-soft p-5" aria-labelledby="pontos-chave">
            <h2 id="pontos-chave" className="text-sm font-bold tracking-[0.1em] text-koda-texto uppercase">Em resumo</h2>
            <ul className="mt-3 grid gap-2.5">
              {aula.pontosChave.map((item) => (
                <li key={item} className="flex gap-2.5 leading-relaxed text-body">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-koda-texto" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10"><BlocosDeConteudo blocos={aula.blocos} /></div>

        {aula.exercicios && (
          <section className="mt-14 rounded-[24px] bg-surface p-6 shadow-soft sm:p-8" aria-labelledby="exercicios">
            <h2 id="exercicios" className="text-xl font-bold tracking-tight">Para praticar</h2>
            <p className="mt-2 text-sm text-ink-2">Faça no seu próprio projeto. É assim que o conteúdo fica.</p>
            <ol className="mt-4 list-decimal space-y-3 pl-5 leading-relaxed text-body marker:font-bold marker:text-koda-texto">
              {aula.exercicios.map((item) => <li key={item}>{item}</li>)}
            </ol>
          </section>
        )}

        {aula.referencias && (
          <section className="mt-8" aria-labelledby="referencias">
            <h2 id="referencias" className="text-xl font-bold tracking-tight">Para se aprofundar</h2>
            <ul className="mt-4 grid gap-2">
              {aula.referencias.map((referencia) => (
                <li key={referencia.url}>
                  <a href={referencia.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-koda-texto underline-offset-2 hover:underline">
                    {referencia.titulo}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">(abre em uma nova aba)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {proximas.length > 0 && (
          <section className="mt-14" aria-labelledby="proximas">
            <h2 id="proximas" className="text-xl font-bold tracking-tight">Continue estudando</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {proximas.map((proxima) => (
                <li key={proxima.slug}>
                  <Link href={`/aprenda/temas/${proxima.slug}`} className="block h-full rounded-2xl bg-surface p-5 text-ink shadow-soft transition duration-200 hover:-translate-y-0.5 hover:text-ink hover:shadow-lift">
                    <span className="text-xs font-bold tracking-[0.1em] text-koda-texto uppercase">{TRILHAS[proxima.trilha].rotulo}</span>
                    <span className="mt-1 block font-semibold">{proxima.titulo}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <ChamadaParaEntrar titulo="Pronto para praticar no seu código?" />
      </article>

      {indice.length > 1 && (
        <nav aria-label="Neste artigo" className="hidden lg:block">
          <div className="sticky top-28">
            <div className="mb-3 text-xs font-bold tracking-[0.12em] text-ink-2/70 uppercase">Neste artigo</div>
            <ol className="grid gap-2 border-l border-line pl-4 text-sm">
              {indice.map((item) => (
                <li key={item.id}><a href={`#${item.id}`} className="text-ink-2 hover:text-koda-texto">{item.titulo}</a></li>
              ))}
            </ol>
          </div>
        </nav>
      )}
    </div>
  );
}
