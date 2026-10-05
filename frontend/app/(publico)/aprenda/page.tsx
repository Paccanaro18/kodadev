import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import CartaoDaTrilha from "@/components/trilhas/CartaoDaTrilha";
import { Titulo } from "@/components/publico/PaginaPublica";
import { AULAS } from "@/lib/conteudoAprenda";
import { resumirTrilha, trilhasDoGrupo, type GrupoDeTrilha } from "@/lib/trilhas";

export const metadata: Metadata = {
  title: "Aprenda aqui | Koda",
  description: "Trilhas de estudo por linguagem, para certificações e sobre IA, com lições aprofundadas, questões, checkpoints e desafios práticos.",
};

const SECOES: { grupo: GrupoDeTrilha; titulo: string; texto: string }[] = [
  { grupo: "linguagem", titulo: "Linguagens", texto: "Do primeiro programa até uma API de verdade, com exemplos que rodam." },
  { grupo: "certificacao", titulo: "Certificações", texto: "Roteiros de estudo para as provas, com questões no estilo do exame." },
  { grupo: "ia", titulo: "Inteligência artificial", texto: "Como usar modelos de linguagem, ferramentas e MCP em produtos reais." },
];

export default function Page() {
  return (
    <>
      <Titulo
        etiqueta="Aprenda aqui"
        titulo="Escolha uma trilha e estude no seu ritmo"
        texto="Cada trilha leva você de um passo ao seguinte: lições aprofundadas com exemplos que rodam de verdade, questões com explicação, checkpoints para saber onde você está e desafios para praticar no seu computador."
      />

      {SECOES.map(({ grupo, titulo, texto }) => (
        <section key={grupo} className="mt-14" aria-labelledby={`grupo-${grupo}`}>
          <h2 id={`grupo-${grupo}`} className="text-2xl font-bold tracking-tight">{titulo}</h2>
          <p className="mt-1 text-body">{texto}</p>
          <ul className="mt-6 grid gap-6 lg:grid-cols-3">
            {trilhasDoGrupo(grupo).map((trilha) => (
              <li key={trilha.slug}><CartaoDaTrilha trilha={resumirTrilha(trilha)} /></li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mt-16 rounded-[28px] bg-surface p-7 shadow-soft sm:p-10" aria-labelledby="temas">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-[640px]">
            <h2 id="temas" className="flex items-center gap-2.5 text-2xl font-bold tracking-tight"><BookOpen className="size-6 text-koda-texto" aria-hidden="true" />Temas e leituras avulsas</h2>
            <p className="mt-2 text-body">{AULAS.length} artigos para ler em qualquer ordem: segurança de aplicações, injeção de SQL, autenticação, testes, HTTP, como ler um ticket e mais.</p>
          </div>
          <Link href="/aprenda/temas" className="inline-flex h-12 items-center gap-2 rounded-2xl border border-line-2 px-6 text-[15px] font-bold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-tint hover:text-ink active:scale-[.97]">
            Ver os artigos <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
