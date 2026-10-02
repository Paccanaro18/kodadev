import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChamadaParaEntrar } from "@/components/publico/PaginaPublica";
import { ARTIGOS } from "@/lib/conteudoPublico";

type Parametros = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTIGOS.map((artigo) => ({ slug: artigo.slug }));
}

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { slug } = await params;
  const artigo = ARTIGOS.find((a) => a.slug === slug);
  return artigo ? { title: `${artigo.titulo} | Koda`, description: artigo.resumo } : {};
}

export default async function Page({ params }: Parametros) {
  const { slug } = await params;
  const artigo = ARTIGOS.find((a) => a.slug === slug);
  if (!artigo) notFound();

  return (
    <article className="mx-auto max-w-[720px]">
      <Link href="/blog" className="text-sm font-semibold text-koda-texto">← Blog</Link>
      <div className="mt-6 text-xs font-bold tracking-[0.12em] text-koda-texto uppercase">{artigo.leitura} de leitura · Equipe Koda</div>
      <h1 className="mt-3 text-[30px] leading-tight font-extrabold tracking-tight sm:text-[42px]">{artigo.titulo}</h1>
      <p className="mt-4 text-lg leading-relaxed text-body">{artigo.resumo}</p>

      <div className="mt-10 grid gap-5">
        {artigo.paragrafos.map((bloco) => (
          <section key={bloco.subtitulo ?? bloco.texto}>
            {bloco.subtitulo && <h2 className="mb-2 text-xl font-bold tracking-tight">{bloco.subtitulo}</h2>}
            <p className="leading-relaxed text-body">{bloco.texto}</p>
          </section>
        ))}
      </div>

      <ChamadaParaEntrar titulo="Quer ver isso no seu projeto?" />
    </article>
  );
}
