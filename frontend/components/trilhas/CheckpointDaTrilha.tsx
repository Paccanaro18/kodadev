"use client";
import Questionario from "./Questionario";
import { Card } from "../ui";
import { checkpointAprovado } from "@/lib/progressoDeEstudo";
import type { Questao } from "@/lib/trilhas/tipos";
import { useEstudo } from "@/lib/useEstudo";

type Props = { trilha: string; slug: string; questoes: Questao[]; notaMinima: number };

/** A prova de um checkpoint: guarda a melhor nota e mostra se a pessoa já foi aprovada. */
export default function CheckpointDaTrilha({ trilha, slug, questoes, notaMinima }: Props) {
  const estudo = useEstudo(trilha);
  const nota = estudo.progresso.notas[slug] ?? null;
  const aprovado = checkpointAprovado(estudo.progresso, slug, notaMinima);

  return (
    <Card>
      {estudo.carregado && aprovado && (
        <p role="status" className="mb-5 rounded-2xl bg-ok-soft p-4 text-center font-semibold text-ok">Você já foi aprovado neste checkpoint. Pode refazer para revisar.</p>
      )}
      <Questionario questoes={questoes} notaMinima={notaMinima} melhorNota={estudo.carregado ? nota : null}
        aoFinalizar={(resultado) => estudo.registrarNota(slug, resultado)} />
    </Card>
  );
}
