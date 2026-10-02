import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { Titulo } from "@/components/publico/PaginaPublica";
import { PERGUNTAS_FREQUENTES } from "@/lib/conteudoPublico";

export const metadata: Metadata = {
  title: "Ajuda | Koda",
  description: "Perguntas frequentes sobre como começar, desafios, dicas, limites, privacidade e segurança.",
};

export default function Page() {
  return (
    <>
      <Titulo etiqueta="Ajuda" titulo="Perguntas frequentes" texto="Respostas rápidas sobre como começar, como os desafios funcionam e o que acontece com os seus dados." />

      <div className="mt-12 grid max-w-[820px] gap-10">
        {PERGUNTAS_FREQUENTES.map((grupo) => (
          <section key={grupo.titulo} aria-labelledby={`grupo-${grupo.titulo}`}>
            <h2 id={`grupo-${grupo.titulo}`} className="mb-4 text-xl font-bold tracking-tight">{grupo.titulo}</h2>
            <div className="grid gap-3">
              {grupo.perguntas.map((item) => (
                <details key={item.pergunta} className="group rounded-2xl bg-surface shadow-soft open:shadow-lift">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-[15px] font-semibold marker:content-none">
                    {item.pergunta}
                    <ChevronDown className="size-5 shrink-0 text-koda-texto transition duration-200 group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="px-5 pb-5 leading-relaxed text-body">{item.resposta}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
