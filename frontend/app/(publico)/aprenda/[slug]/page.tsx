import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlocosDeConteudo from "@/components/publico/BlocosDeConteudo";
import { ChamadaParaEntrar } from "@/components/publico/PaginaPublica";
import { AULAS, aulaPorSlug, proximasLeituras, TRILHAS } from "@/lib/conteudoAprenda";

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

  return (
    <article className="mx-auto max-w-[760px]">
      <Link href="/aprenda" className="text-sm font-semibold text-koda-texto">← Aprenda aqui</Link>
      <div className="mt-6 text-xs font-bold tracking-[0.12em] text-koda-texto uppercase">
        {TRILHAS[aula.trilha].rotulo} · {aula.nivel} · {aula.leitura} de leitura
      </div>
      <h1 className="mt-3 text-[30px] leading-tight font-extrabold tracking-tight sm:text-[42px]">{aula.titulo}</h1>
      <p className="mt-4 text-lg leading-relaxed text-body">{aula.resumo}</p>

      <div className="mt-10"><BlocosDeConteudo blocos={aula.blocos} /></div>

      {proximas.length > 0 && (
        <section className="mt-14" aria-labelledby="proximas">
          <h2 id="proximas" className="text-xl font-bold tracking-tight">Continue estudando</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {proximas.map((proxima) => (
              <li key={proxima.slug}>
                <Link href={`/aprenda/${proxima.slug}`} className="block h-full rounded-2xl bg-surface p-5 text-ink shadow-soft transition duration-200 hover:-translate-y-0.5 hover:text-ink hover:shadow-lift">
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
  );
}
