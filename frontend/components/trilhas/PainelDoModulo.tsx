"use client";
import { useEffect, useState } from "react";
import { BadgeCheck, BookOpenCheck, CheckCircle2, Circle, ListChecks } from "lucide-react";
import { moduloConcluido, NOTA_MINIMA_DO_TESTE } from "@/lib/progressoDeEstudo";
import { useEstudo } from "@/lib/useEstudo";

type Props = {
  trilha: string;
  modulo: string;
  indice: { id: string; titulo: string }[];
  idDoConteudo: string;
};

function Passo({ feito, rotulo, detalhe }: { feito: boolean; rotulo: string; detalhe?: string }) {
  return (
    <li className="flex items-start gap-2.5">
      {feito
        ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden="true" />
        : <Circle className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden="true" />}
      <span className="leading-snug">
        <span className={feito ? "font-semibold text-ink" : "text-ink-2"}>{rotulo}</span>
        {detalhe && <span className="block text-xs text-ink-2">{detalhe}</span>}
      </span>
    </li>
  );
}

/** A barra de leitura no topo da página e, em telas largas, o índice com destaque da seção atual e o andamento do módulo. */
export default function PainelDoModulo({ trilha, modulo, indice, idDoConteudo }: Props) {
  const { progresso, carregado } = useEstudo(trilha);
  const [lido, setLido] = useState(0);
  const [atual, setAtual] = useState<string | null>(null);

  useEffect(() => {
    const conteudo = document.getElementById(idDoConteudo);
    function medir() {
      if (!conteudo) return;
      const caixa = conteudo.getBoundingClientRect();
      const total = caixa.height - window.innerHeight * 0.6;
      setLido(total <= 0 ? 1 : Math.min(1, Math.max(0, -caixa.top / total)));
    }
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      window.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, [idDoConteudo]);

  useEffect(() => {
    const ids = [...indice.map((entrada) => entrada.id), "teste-rapido", "desafio-pratico"];
    const elementos = ids.map((id) => document.getElementById(id)).filter((elemento): elemento is HTMLElement => elemento !== null);
    if (typeof IntersectionObserver === "undefined" || elementos.length === 0) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.filter((entrada) => entrada.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visivel) setAtual(visivel.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    elementos.forEach((elemento) => observador.observe(elemento));
    return () => observador.disconnect();
  }, [indice]);

  const lida = progresso.licoes.includes(modulo);
  const nota = progresso.notas[modulo];
  const testeFeito = nota !== undefined && nota >= NOTA_MINIMA_DO_TESTE;
  const desafioFeito = progresso.desafios.includes(modulo);
  const concluido = carregado && moduloConcluido(progresso, modulo);

  function classe(id: string) {
    return atual === id
      ? "block -ml-[17px] border-l-2 border-koda pl-4 font-semibold text-koda-texto"
      : "block text-ink-2 hover:text-koda-texto";
  }

  return (
    <>
      <div className="pointer-events-none fixed top-0 left-0 z-50 h-1 w-full" aria-hidden="true">
        <div className="h-full origin-left bg-koda transition-transform duration-150" style={{ transform: `scaleX(${lido})` }} />
      </div>

      <aside aria-label="Neste módulo" className="hidden lg:block">
        <div className="sticky top-28 grid gap-6">
          <nav aria-label="Índice do módulo">
            <div className="mb-3 text-xs font-bold tracking-[0.12em] text-ink-2/70 uppercase">Neste módulo</div>
            <ol className="grid gap-2 border-l border-line pl-4 text-sm leading-snug">
              {indice.map((entrada) => <li key={entrada.id}><a href={`#${entrada.id}`} className={classe(entrada.id)}>{entrada.titulo}</a></li>)}
              <li><a href="#teste-rapido" className={classe("teste-rapido")}>Teste rápido</a></li>
              <li><a href="#desafio-pratico" className={classe("desafio-pratico")}>Desafio prático</a></li>
            </ol>
          </nav>

          <section aria-label="Seu andamento neste módulo" className="rounded-2xl border border-line bg-surface p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-ink-2/70 uppercase">
              {concluido ? <BadgeCheck className="size-4 text-ok" aria-hidden="true" /> : <BookOpenCheck className="size-4" aria-hidden="true" />}
              {concluido ? "Módulo concluído" : "Seu andamento"}
            </div>
            <ul className="grid gap-2.5 text-sm">
              <Passo feito={carregado && lida} rotulo="Lição lida" />
              <Passo feito={carregado && testeFeito} rotulo="Teste rápido" detalhe={carregado && nota !== undefined ? `Melhor nota: ${Math.round(nota * 100)}%` : `Aprovação com ${Math.round(NOTA_MINIMA_DO_TESTE * 100)}%`} />
              <Passo feito={carregado && desafioFeito} rotulo="Desafio prático" detalhe="Opcional, para fixar" />
            </ul>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-2"><ListChecks className="size-3.5" aria-hidden="true" />Salvo neste navegador</p>
          </section>
        </div>
      </aside>
    </>
  );
}
