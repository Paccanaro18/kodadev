"use client";
import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { Questao } from "@/lib/trilhas/tipos";

type Props = {
  questoes: Questao[];
  /** Chamado uma única vez por tentativa, quando a última questão é respondida, com a fração de acertos (0 a 1). */
  aoFinalizar: (nota: number) => void;
  /** Melhor nota guardada antes desta tentativa, só para mostrar. */
  melhorNota?: number | null;
  notaMinima: number;
};

/** O enunciado pode trazer um trecho de código depois de uma linha em branco. */
function dividirEnunciado(enunciado: string): { texto: string; codigo: string | null } {
  const separador = enunciado.indexOf("\n\n");
  if (separador < 0) return { texto: enunciado, codigo: null };
  return { texto: enunciado.slice(0, separador), codigo: enunciado.slice(separador + 2) };
}

export default function Questionario({ questoes, aoFinalizar, melhorNota = null, notaMinima }: Props) {
  const [escolhas, setEscolhas] = useState<(number | null)[]>(() => questoes.map(() => null));
  const [rodada, setRodada] = useState(0);

  const respondidas = escolhas.filter((escolha) => escolha !== null).length;
  const acertos = useMemo(
    () => escolhas.filter((escolha, i) => escolha === questoes[i].correta).length,
    [escolhas, questoes],
  );
  const terminou = respondidas === questoes.length;
  const nota = questoes.length === 0 ? 0 : acertos / questoes.length;

  function responder(indiceDaQuestao: number, opcao: number) {
    if (escolhas[indiceDaQuestao] !== null) return;
    const novas = escolhas.map((escolha, i) => (i === indiceDaQuestao ? opcao : escolha));
    setEscolhas(novas);
    if (novas.every((escolha) => escolha !== null)) {
      const feitos = novas.filter((escolha, i) => escolha === questoes[i].correta).length;
      aoFinalizar(feitos / questoes.length);
    }
  }

  function refazer() {
    setEscolhas(questoes.map(() => null));
    setRodada((r) => r + 1);
  }

  return (
    <div key={rodada}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink-2">
        <span aria-live="polite">{respondidas} de {questoes.length} respondidas</span>
        {melhorNota !== null && <span>Melhor nota: {Math.round(melhorNota * 100)}%</span>}
      </div>

      <ol className="mt-4 grid gap-5">
        {questoes.map((questao, i) => {
          const escolha = escolhas[i];
          const respondida = escolha !== null;
          const { texto, codigo } = dividirEnunciado(questao.enunciado);
          return (
            <li key={i} className="rounded-2xl border border-line p-5">
              <p className="font-semibold leading-relaxed"><span className="mr-2 text-koda-texto">{i + 1}.</span>{texto}</p>
              {codigo && <pre className="mt-3 overflow-x-auto rounded-xl bg-tint p-3 text-[13px] leading-relaxed"><code>{codigo}</code></pre>}

              <ul className="mt-4 grid gap-2" role="radiogroup" aria-label={`Opções da questão ${i + 1}`}>
                {questao.opcoes.map((opcao, o) => {
                  const marcada = escolha === o;
                  const certa = o === questao.correta;
                  const estilo = !respondida
                    ? "border-line hover:border-koda hover:bg-tint"
                    : certa
                      ? "border-ok bg-ok-soft"
                      : marcada
                        ? "border-bad bg-bad-soft"
                        : "border-line opacity-70";
                  return (
                    <li key={o}>
                      <button type="button" role="radio" aria-checked={marcada} disabled={respondida}
                        onClick={() => responder(i, o)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition duration-200 ${estilo}`}>
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-line-2 text-[11px] font-bold">{String.fromCharCode(65 + o)}</span>
                        <span className="flex-1">{opcao}</span>
                        {respondida && certa && <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ok" aria-label="Resposta certa" />}
                        {respondida && marcada && !certa && <XCircle className="mt-0.5 size-5 shrink-0 text-bad" aria-label="Sua resposta, errada" />}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {respondida && (
                <p role="status" className="mt-4 rounded-xl bg-tint p-4 text-sm leading-relaxed text-body">
                  <b className={escolha === questao.correta ? "text-ok" : "text-bad"}>{escolha === questao.correta ? "Certo. " : "Não foi dessa vez. "}</b>
                  {questao.explicacao}
                </p>
              )}
            </li>
          );
        })}
      </ol>

      {terminou && (
        <section aria-labelledby="resultado" className={`mt-6 rounded-2xl p-5 ${nota >= notaMinima ? "bg-ok-soft" : "bg-warn-soft"}`}>
          <h3 id="resultado" className="text-lg font-bold">Você acertou {acertos} de {questoes.length} ({Math.round(nota * 100)}%)</h3>
          <p className="mt-1 text-sm text-body">
            {nota >= notaMinima
              ? "Muito bem: esta etapa está concluída."
              : `Para concluir, o mínimo é ${Math.round(notaMinima * 100)}%. Releia o que errou e tente de novo: ninguém perde nada por refazer.`}
          </p>
          <button type="button" onClick={refazer}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-line-2 bg-surface px-4 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:scale-[.97]">
            <RotateCcw className="size-4" aria-hidden="true" /> Refazer
          </button>
        </section>
      )}
    </div>
  );
}
