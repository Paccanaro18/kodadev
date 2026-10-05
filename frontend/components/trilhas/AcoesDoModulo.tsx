"use client";
import { useState } from "react";
import { BadgeCheck, CheckCircle2, Circle } from "lucide-react";
import Questionario from "./Questionario";
import { Card } from "../ui";
import { moduloConcluido, NOTA_MINIMA_DO_TESTE } from "@/lib/progressoDeEstudo";
import type { DesafioPratico, Questao } from "@/lib/trilhas/tipos";
import { useEstudo } from "@/lib/useEstudo";

type Props = {
  trilha: string;
  modulo: string;
  questoes: Questao[];
  desafio: DesafioPratico;
};

/** A parte interativa de um módulo: marcar a lição como lida, o teste rápido e o desafio prático. */
export default function AcoesDoModulo({ trilha, modulo, questoes, desafio }: Props) {
  const estudo = useEstudo(trilha);
  const { progresso } = estudo;
  const lida = progresso.licoes.includes(modulo);
  const desafioFeito = progresso.desafios.includes(modulo);
  const nota = progresso.notas[modulo] ?? null;
  const concluido = moduloConcluido(progresso, modulo);
  const [marcados, setMarcados] = useState<boolean[]>(() => desafio.criterios.map(() => false));
  const todosMarcados = marcados.every(Boolean);

  function alternarCriterio(indice: number) {
    setMarcados((atuais) => atuais.map((marcado, i) => (i === indice ? !marcado : marcado)));
  }

  return (
    <div className="grid gap-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Terminou a leitura?</h2>
            <p className="mt-1 text-sm text-ink-2">Marque a lição como lida para registrar o seu avanço neste navegador.</p>
          </div>
          <button type="button" aria-pressed={lida} onClick={() => estudo.marcarLicao(modulo, !lida)}
            className={`inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-bold transition duration-200 active:scale-[.97] ${lida ? "bg-ok-soft text-ok" : "bg-koda text-white hover:-translate-y-0.5 hover:bg-koda-dark"}`}>
            {lida ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <Circle className="size-4" aria-hidden="true" />}
            {lida ? "Lição lida" : "Marcar como lida"}
          </button>
        </div>
      </Card>

      <Card>
        <h2 id="teste-rapido" className="text-xl font-bold tracking-tight">Teste rápido</h2>
        <p className="mt-1 mb-5 text-sm text-ink-2">
          {questoes.length} questões para fixar. Cada resposta mostra a explicação. Com {Math.round(NOTA_MINIMA_DO_TESTE * 100)}% de acertos e a lição lida, o módulo conta como concluído.
        </p>
        <Questionario questoes={questoes} notaMinima={NOTA_MINIMA_DO_TESTE} melhorNota={estudo.carregado ? nota : null}
          aoFinalizar={(resultado) => estudo.registrarNota(modulo, resultado)} />
      </Card>

      <Card>
        <h2 id="desafio-pratico" className="text-xl font-bold tracking-tight">Desafio prático: {desafio.titulo}</h2>
        <p className="mt-3 leading-relaxed text-body">{desafio.enunciado}</p>

        <h3 className="mt-6 text-sm font-bold tracking-[0.1em] text-ink-2 uppercase">O que fazer</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-body marker:text-koda-texto">
          {desafio.requisitos.map((item) => <li key={item}>{item}</li>)}
        </ul>

        <h3 className="mt-6 text-sm font-bold tracking-[0.1em] text-ink-2 uppercase">Como saber que acabou</h3>
        <ul className="mt-3 grid gap-2">
          {desafio.criterios.map((criterio, i) => (
            <li key={criterio}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3 text-[15px] leading-relaxed transition duration-200 hover:bg-tint">
                <input type="checkbox" checked={marcados[i]} onChange={() => alternarCriterio(i)} className="mt-1 size-4 shrink-0 accent-koda" />
                <span>{criterio}</span>
              </label>
            </li>
          ))}
        </ul>

        {desafio.dica && <p className="mt-5 rounded-xl bg-koda-soft p-4 text-sm leading-relaxed text-body"><b className="text-koda-texto">Dica: </b>{desafio.dica}</p>}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" disabled={!todosMarcados && !desafioFeito} aria-pressed={desafioFeito}
            onClick={() => estudo.marcarDesafio(modulo, !desafioFeito)}
            className={`inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-bold transition duration-200 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50 ${desafioFeito ? "bg-ok-soft text-ok" : "bg-koda text-white hover:-translate-y-0.5 hover:bg-koda-dark"}`}>
            <BadgeCheck className="size-4" aria-hidden="true" />
            {desafioFeito ? "Desafio concluído" : "Declarar desafio concluído"}
          </button>
          {!todosMarcados && !desafioFeito && <span className="text-sm text-ink-2">Marque todos os critérios para liberar.</span>}
        </div>
      </Card>

      {concluido && (
        <p role="status" className="rounded-2xl bg-ok-soft p-4 text-center font-semibold text-ok">Módulo concluído. Siga para o próximo passo da trilha.</p>
      )}
    </div>
  );
}
