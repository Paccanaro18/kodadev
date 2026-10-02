import type { Metadata } from "next";
import { BarChart3, Code2, Folder, Lightbulb, Lock, Palette, ShieldCheck, Target } from "lucide-react";
import { ChamadaParaEntrar, Titulo } from "@/components/publico/PaginaPublica";
import { RECURSOS, type Recurso } from "@/lib/conteudoPublico";

export const metadata: Metadata = {
  title: "Recursos | Koda",
  description: "Análise do projeto, 36 ângulos de desafio, tickets validados, dicas em 3 níveis, progresso e segurança.",
};

const ICONES: Record<Recurso["icone"], typeof Folder> = {
  pasta: Folder,
  alvo: Target,
  escudo: ShieldCheck,
  lampada: Lightbulb,
  grafico: BarChart3,
  paleta: Palette,
  cadeado: Lock,
  codigo: Code2,
};

export default function Page() {
  return (
    <>
      <Titulo
        etiqueta="Recursos"
        titulo="Tudo o que você precisa para praticar de verdade"
        texto="Da leitura do seu projeto ao acompanhamento do que você já fez, cada recurso existe para o ticket parecer trabalho de verdade."
      />

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {RECURSOS.map((recurso) => {
          const Icone = ICONES[recurso.icone];
          return (
            <li key={recurso.titulo} className="rounded-[24px] bg-surface p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lift">
              <span className="grid size-11 place-items-center rounded-2xl bg-koda-soft text-koda-texto"><Icone className="size-5" aria-hidden="true" /></span>
              <h2 className="mt-4 text-lg font-bold">{recurso.titulo}</h2>
              <p className="mt-2 text-sm leading-relaxed text-body">{recurso.texto}</p>
            </li>
          );
        })}
      </ul>

      <ChamadaParaEntrar />
    </>
  );
}
