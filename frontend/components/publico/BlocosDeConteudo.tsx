import { Lightbulb } from "lucide-react";
import BlocoDeCodigo from "./BlocoDeCodigo";
import type { Bloco } from "@/lib/conteudoAprenda";

/** Desenha os blocos de um artigo de estudo: parágrafo, subtítulo, lista, código e dica. */
export default function BlocosDeConteudo({ blocos }: { blocos: Bloco[] }) {
  return (
    <div className="grid gap-5">
      {blocos.map((bloco, i) => {
        switch (bloco.tipo) {
          case "h":
            return <h2 key={i} className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">{bloco.texto}</h2>;
          case "p":
            return <p key={i} className="leading-relaxed text-body">{bloco.texto}</p>;
          case "lista":
            return (
              <ul key={i} className="list-disc space-y-2 pl-5 leading-relaxed text-body marker:text-koda-texto">
                {bloco.itens.map((item) => <li key={item}>{item}</li>)}
              </ul>
            );
          case "codigo":
            return <BlocoDeCodigo key={i} linguagem={bloco.linguagem} texto={bloco.texto} legenda={bloco.legenda} />;
          case "dica":
            return (
              <aside key={i} className="flex gap-3 rounded-2xl bg-koda-soft p-5">
                <Lightbulb className="mt-0.5 size-5 shrink-0 text-koda-texto" aria-hidden="true" />
                <div>
                  <div className="font-bold text-koda-texto">{bloco.titulo}</div>
                  <p className="mt-1 leading-relaxed text-body">{bloco.texto}</p>
                </div>
              </aside>
            );
        }
      })}
    </div>
  );
}
