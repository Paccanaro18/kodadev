import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Flag } from "lucide-react";
import BlocosDeConteudo from "@/components/publico/BlocosDeConteudo";
import AcoesDoModulo from "@/components/trilhas/AcoesDoModulo";
import CheckpointDaTrilha from "@/components/trilhas/CheckpointDaTrilha";
import { itemPorSlug, itensDaTrilha, slugsDeTrilha, trilhaPorSlug, vizinhosDoItem } from "@/lib/trilhas";
import type { Item } from "@/lib/trilhas";
import { indiceDosBlocos } from "@/lib/conteudoAprenda";

type Parametros = { params: Promise<{ trilha: string; item: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return slugsDeTrilha().flatMap((slug) => {
    const trilha = trilhaPorSlug(slug);
    return trilha ? itensDaTrilha(trilha).map((item) => ({ trilha: slug, item: item.slug })) : [];
  });
}

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { trilha: slugDaTrilha, item: slugDoItem } = await params;
  const trilha = trilhaPorSlug(slugDaTrilha);
  const item = trilha ? itemPorSlug(trilha, slugDoItem) : undefined;
  return item ? { title: `${item.titulo} | ${trilha?.titulo} | Koda`, description: item.resumo } : {};
}

function Navegacao({ trilha, anterior, proximo }: { trilha: string; anterior: Item | null; proximo: Item | null }) {
  return (
    <nav aria-label="Navegação da trilha" className="mt-10 grid gap-3 sm:grid-cols-2">
      {anterior
        ? (
          <Link href={`/aprenda/${trilha}/${anterior.slug}`} className="flex flex-col rounded-2xl border border-line p-4 text-ink transition duration-200 hover:-translate-y-0.5 hover:border-koda hover:text-ink">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-2 uppercase"><ArrowLeft className="size-3.5" aria-hidden="true" />Anterior</span>
            <span className="mt-1 font-semibold">{anterior.titulo}</span>
          </Link>
        )
        : <span />}
      {proximo
        ? (
          <Link href={`/aprenda/${trilha}/${proximo.slug}`} className="flex flex-col rounded-2xl border border-line p-4 text-right text-ink transition duration-200 hover:-translate-y-0.5 hover:border-koda hover:text-ink">
            <span className="inline-flex items-center justify-end gap-1.5 text-xs font-bold text-ink-2 uppercase">Próximo<ArrowRight className="size-3.5" aria-hidden="true" /></span>
            <span className="mt-1 font-semibold">{proximo.titulo}</span>
          </Link>
        )
        : <span />}
    </nav>
  );
}

export default async function Page({ params }: Parametros) {
  const { trilha: slugDaTrilha, item: slugDoItem } = await params;
  const trilha = trilhaPorSlug(slugDaTrilha);
  const item = trilha ? itemPorSlug(trilha, slugDoItem) : undefined;
  if (!trilha || !item) notFound();

  const { anterior, proximo } = vizinhosDoItem(trilha, item.slug);
  const voltar = <Link href={`/aprenda/${trilha.slug}`} className="text-sm font-semibold text-koda-texto">← {trilha.titulo}</Link>;

  if (item.tipo === "checkpoint") {
    return (
      <div className="mx-auto max-w-[820px]">
        {voltar}
        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-warn-soft px-3 py-1 text-xs font-bold text-warn"><Flag className="size-3.5" aria-hidden="true" />Checkpoint</div>
        <h1 className="mt-3 text-[30px] leading-tight font-extrabold tracking-tight sm:text-[40px]">{item.titulo}</h1>
        <p className="mt-4 text-lg leading-relaxed text-body">{item.resumo}</p>
        <p className="mt-3 text-sm text-ink-2">Para ser aprovado, acerte pelo menos {Math.round(item.notaMinima * 100)}%. Você pode refazer quantas vezes quiser, e a melhor nota fica guardada.</p>
        <div className="mt-8"><CheckpointDaTrilha trilha={trilha.slug} slug={item.slug} questoes={item.questoes} notaMinima={item.notaMinima} /></div>
        <Navegacao trilha={trilha.slug} anterior={anterior} proximo={proximo} />
      </div>
    );
  }

  const indice = indiceDosBlocos(item.blocos);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_240px]">
      <article className="min-w-0 max-w-[780px]">
        {voltar}
        <div className="mt-6 text-xs font-bold tracking-[0.12em] text-koda-texto uppercase">{item.nivel} · {item.leitura} de leitura</div>
        <h1 className="mt-3 text-[30px] leading-tight font-extrabold tracking-tight sm:text-[42px]">{item.titulo}</h1>
        <p className="mt-4 text-lg leading-relaxed text-body">{item.resumo}</p>

        <section className="mt-8 rounded-2xl border border-line p-5" aria-labelledby="objetivos">
          <h2 id="objetivos" className="text-sm font-bold tracking-[0.1em] text-ink-2 uppercase">Ao final deste módulo você será capaz de</h2>
          <ul className="mt-3 grid gap-2">
            {item.objetivos.map((objetivo) => (
              <li key={objetivo} className="flex gap-2.5 leading-relaxed text-body"><CheckCircle2 className="mt-1 size-4 shrink-0 text-koda-texto" aria-hidden="true" /><span>{objetivo}</span></li>
            ))}
          </ul>
          {item.preRequisitos && (
            <>
              <h3 className="mt-5 text-sm font-bold tracking-[0.1em] text-ink-2 uppercase">Antes de começar</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-body marker:text-koda-texto">
                {item.preRequisitos.map((pre) => <li key={pre}>{pre}</li>)}
              </ul>
            </>
          )}
        </section>

        <section className="mt-5 rounded-2xl bg-koda-soft p-5" aria-labelledby="pontos-chave">
          <h2 id="pontos-chave" className="text-sm font-bold tracking-[0.1em] text-koda-texto uppercase">Em resumo</h2>
          <ul className="mt-3 grid gap-2.5">
            {item.pontosChave.map((ponto) => (
              <li key={ponto} className="flex gap-2.5 leading-relaxed text-body"><CheckCircle2 className="mt-1 size-4 shrink-0 text-koda-texto" aria-hidden="true" /><span>{ponto}</span></li>
            ))}
          </ul>
        </section>

        <div className="mt-10"><BlocosDeConteudo blocos={item.blocos} /></div>

        {item.referencias && (
          <section className="mt-12" aria-labelledby="referencias">
            <h2 id="referencias" className="text-xl font-bold tracking-tight">Para se aprofundar</h2>
            <ul className="mt-4 grid gap-2">
              {item.referencias.map((referencia) => (
                <li key={referencia.url}>
                  <a href={referencia.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-koda-texto underline-offset-2 hover:underline">
                    {referencia.titulo}<ExternalLink className="size-3.5" aria-hidden="true" /><span className="sr-only">(abre em uma nova aba)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12"><AcoesDoModulo trilha={trilha.slug} modulo={item.slug} questoes={item.questoes} desafio={item.desafio} /></div>
        <Navegacao trilha={trilha.slug} anterior={anterior} proximo={proximo} />
      </article>

      {indice.length > 1 && (
        <nav aria-label="Neste módulo" className="hidden lg:block">
          <div className="sticky top-28">
            <div className="mb-3 text-xs font-bold tracking-[0.12em] text-ink-2/70 uppercase">Neste módulo</div>
            <ol className="grid gap-2 border-l border-line pl-4 text-sm">
              {indice.map((entrada) => <li key={entrada.id}><a href={`#${entrada.id}`} className="text-ink-2 hover:text-koda-texto">{entrada.titulo}</a></li>)}
              <li><a href="#teste-rapido" className="font-semibold text-koda-texto">Teste rápido</a></li>
              <li><a href="#desafio-pratico" className="font-semibold text-koda-texto">Desafio prático</a></li>
            </ol>
          </div>
        </nav>
      )}
    </div>
  );
}
