import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Titulo } from "@/components/publico/PaginaPublica";
import { ARTIGOS } from "@/lib/conteudoPublico";

export const metadata: Metadata = {
  title: "Blog | Koda",
  description: "Como a Koda funciona por dentro e por que praticar em tickets reais ensina mais.",
};

export default function Page() {
  return (
    <>
      <Titulo etiqueta="Blog" titulo="Por dentro da Koda" texto="Como os tickets são feitos, o que a Koda lê do seu código e por que praticar assim funciona." />

      <ul className="mt-12 grid gap-5 lg:grid-cols-3">
        {ARTIGOS.map((artigo) => (
          <li key={artigo.slug}>
            <Link href={`/blog/${artigo.slug}`} className="flex h-full flex-col rounded-[24px] bg-surface p-6 text-ink shadow-soft transition duration-200 hover:-translate-y-1 hover:text-ink hover:shadow-lift">
              <span className="text-xs font-bold tracking-[0.12em] text-koda-texto uppercase">{artigo.leitura} de leitura</span>
              <h2 className="mt-3 text-xl leading-snug font-bold">{artigo.titulo}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-body">{artigo.resumo}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-koda-texto">Ler artigo <ArrowRight className="size-4" aria-hidden="true" /></span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
