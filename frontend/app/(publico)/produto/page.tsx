import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import SeloDeLinguagem from "@/components/SeloDeLinguagem";
import { ChamadaParaEntrar, Titulo } from "@/components/publico/PaginaPublica";
import { Mascot } from "@/components/ui";
import { O_QUE_A_KODA_NAO_FAZ, PASSOS_DO_PRODUTO } from "@/lib/conteudoPublico";

export const metadata: Metadata = {
  title: "Produto | Koda",
  description: "A Koda transforma o seu repositório do GitHub em desafios reais de desenvolvimento, no estilo Jira.",
};

export default function Page() {
  return (
    <>
      <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
        <Titulo
          etiqueta="Produto"
          titulo="Do seu repositório ao desafio, em minutos"
          texto="Tutorial todo mundo tem. A Koda lê o seu projeto e usa IA para escrever tickets de nível júnior, no estilo Jira, sobre o seu próprio código. Sem exercícios genéricos e sem solução pronta."
        />
        <div className="hidden justify-center lg:flex"><Mascot name="laptop" className="h-64" /></div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Como funciona</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {PASSOS_DO_PRODUTO.map((passo, i) => (
            <li key={passo.titulo} className="rounded-[24px] bg-surface p-6 shadow-soft">
              <span className="grid size-10 place-items-center rounded-full bg-koda-soft text-base font-extrabold text-koda-texto">{i + 1}</span>
              <h3 className="mt-4 text-lg font-bold">{passo.titulo}</h3>
              <p className="mt-2 leading-relaxed text-body">{passo.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] bg-surface p-7 shadow-soft">
          <h2 className="text-xl font-bold tracking-tight">Para projetos em</h2>
          <p className="mt-2 text-body">A Koda entende estas linguagens e frameworks. O manifesto do projeto precisa estar na raiz do repositório.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(["JAVA", "TYPESCRIPT", "JAVASCRIPT", "PYTHON"] as const).map((l) => <SeloDeLinguagem key={l} linguagem={l} tamanho="medio" />)}
          </div>
          <ul className="mt-5 grid gap-2 text-sm text-body">
            <li><b className="text-ink">Java:</b> Spring Boot com Maven</li>
            <li><b className="text-ink">TypeScript e JavaScript:</b> NestJS, Express, Fastify, Koa, Hono, Hapi e Next.js</li>
            <li><b className="text-ink">Python:</b> FastAPI, Flask e Django</li>
          </ul>
        </div>

        <div className="rounded-[28px] bg-surface p-7 shadow-soft">
          <h2 className="text-xl font-bold tracking-tight">Transparência sobre o que ela faz</h2>
          <p className="mt-2 text-body">Combinamos com você o que esperar, e o que não esperar:</p>
          <ul className="mt-4 grid gap-3">
            {O_QUE_A_KODA_NAO_FAZ.map((item) => (
              <li key={item} className="flex gap-3 text-body">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-tint text-koda-texto"><X className="size-3.5" aria-hidden="true" /></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16 rounded-[28px] bg-surface p-7 shadow-soft sm:p-10">
        <h2 className="text-2xl font-bold tracking-tight">Para quem é</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            "Quem está aprendendo e quer praticar em um projeto de verdade.",
            "Quem já programa e quer ganhar fluência em outro framework.",
            "Quem precisa montar um portfólio com tarefas resolvidas e testadas.",
            "Quem quer treinar a leitura de código que outra pessoa escreveu.",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-body">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-koda-soft text-koda-texto"><Check className="size-3.5" aria-hidden="true" /></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <ChamadaParaEntrar />
    </>
  );
}
