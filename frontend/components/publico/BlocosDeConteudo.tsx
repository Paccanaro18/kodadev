import { AlertTriangle, Lightbulb } from "lucide-react";
import BlocoDeCodigo from "./BlocoDeCodigo";
import { idDoTitulo, type Bloco } from "@/lib/conteudoAprenda";

/** Desenha os blocos de um artigo de estudo: parágrafo, subtítulos, listas, tabela, código, dica e alerta. */
export default function BlocosDeConteudo({ blocos }: { blocos: Bloco[] }) {
  return (
    <div className="grid gap-5">
      {blocos.map((bloco, i) => {
        switch (bloco.tipo) {
          case "h":
            return <h2 key={i} id={idDoTitulo(bloco.texto)} className="mt-6 scroll-mt-28 text-xl font-bold tracking-tight sm:text-2xl">{bloco.texto}</h2>;
          case "h3":
            return <h3 key={i} className="mt-2 text-lg font-bold">{bloco.texto}</h3>;
          case "p":
            return <p key={i} className="leading-relaxed text-body">{bloco.texto}</p>;
          case "lista":
            return (
              <ul key={i} className="list-disc space-y-2 pl-5 leading-relaxed text-body marker:text-koda-texto">
                {bloco.itens.map((item) => <li key={item}>{item}</li>)}
              </ul>
            );
          case "numerada":
            return (
              <ol key={i} className="list-decimal space-y-2 pl-5 leading-relaxed text-body marker:font-bold marker:text-koda-texto">
                {bloco.itens.map((item) => <li key={item}>{item}</li>)}
              </ol>
            );
          case "codigo":
            return <BlocoDeCodigo key={i} linguagem={bloco.linguagem} texto={bloco.texto} legenda={bloco.legenda} />;
          case "tabela":
            return (
              <figure key={i} className="overflow-hidden rounded-2xl border border-line">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                    <thead className="bg-tint">
                      <tr>{bloco.cabecalho.map((titulo) => <th key={titulo} scope="col" className="px-4 py-3 font-bold text-ink">{titulo}</th>)}</tr>
                    </thead>
                    <tbody>
                      {bloco.linhas.map((linha, l) => (
                        <tr key={l} className="border-t border-line align-top">
                          {linha.map((celula, c) => (
                            c === 0
                              ? <th key={c} scope="row" className="px-4 py-3 font-semibold text-ink">{celula}</th>
                              : <td key={c} className="px-4 py-3 leading-relaxed text-body">{celula}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {bloco.legenda && <figcaption className="border-t border-line bg-tint px-4 py-2 text-xs text-ink-2">{bloco.legenda}</figcaption>}
              </figure>
            );
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
          case "alerta":
            return (
              <aside key={i} role="note" className="flex gap-3 rounded-2xl border border-warn/40 bg-warn-soft p-5">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warn" aria-hidden="true" />
                <div>
                  <div className="font-bold text-warn">{bloco.titulo}</div>
                  <p className="mt-1 leading-relaxed text-body">{bloco.texto}</p>
                </div>
              </aside>
            );
        }
      })}
    </div>
  );
}
