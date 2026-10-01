"use client";
import { useState } from "react";
import { CheckCircle2, Play, RotateCcw } from "lucide-react";
import { mudarProgresso, type ProgressoDesafio, type StatusProgresso } from "@/lib/api";
import { tempoRelativo } from "@/lib/formatar";

const botao =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[.97] disabled:pointer-events-none disabled:opacity-60";

const AVISO: Record<StatusProgresso, string> = {
  NAO_INICIADO: "Comece quando for resolver. As dicas ficam disponíveis enquanto o desafio estiver em andamento.",
  EM_ANDAMENTO: "A Koda não lê o seu código: marcar como concluído é uma declaração sua.",
  CONCLUIDO: "Você pode reabrir o desafio se quiser mexer nele de novo.",
};

/** Frase curta sobre o andamento: o que significa o estado atual e quando ele começou. */
export function NotaDoProgresso({ progresso }: { progresso: ProgressoDesafio }) {
  const { statusProgresso } = progresso;
  const data = statusProgresso === "CONCLUIDO" ? progresso.finalizadoEm : progresso.iniciadoEm;

  return (
    <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
      {data && statusProgresso !== "NAO_INICIADO" && (
        <b className="font-semibold text-ink">{statusProgresso === "CONCLUIDO" ? "Concluído" : "Iniciado"} {tempoRelativo(data)}. </b>
      )}
      {AVISO[statusProgresso]}
    </p>
  );
}

/** Botão que leva o ticket ao próximo passo: começar, concluir ou reabrir. */
export function AcaoDoProgresso({
  desafioId,
  progresso,
  aoMudar,
}: {
  desafioId: string;
  progresso: ProgressoDesafio;
  aoMudar: (novo: ProgressoDesafio) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function mudar(status: StatusProgresso) {
    setEnviando(true);
    setErro(null);
    try {
      aoMudar(await mudarProgresso(desafioId, status));
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Não foi possível atualizar o desafio.");
    } finally {
      setEnviando(false);
    }
  }

  const { statusProgresso } = progresso;

  return (
    <div className="flex flex-col items-end gap-1">
      {statusProgresso === "NAO_INICIADO" && (
        <button onClick={() => mudar("EM_ANDAMENTO")} disabled={enviando} className={botao + " bg-koda text-white shadow-[0_8px_20px_rgb(102_92_255/0.28)] hover:bg-koda-dark"}>
          <Play className="size-4" /> {enviando ? "Começando..." : "Começar desafio"}
        </button>
      )}
      {statusProgresso === "EM_ANDAMENTO" && (
        <button onClick={() => mudar("CONCLUIDO")} disabled={enviando} className={botao + " bg-[#1d7a3c] text-white hover:bg-[#176331]"}>
          <CheckCircle2 className="size-4" /> {enviando ? "Salvando..." : "Marcar como concluído"}
        </button>
      )}
      {statusProgresso === "CONCLUIDO" && (
        <button onClick={() => mudar("EM_ANDAMENTO")} disabled={enviando} className={botao + " border border-line-2 hover:bg-tint-2"}>
          <RotateCcw className="size-4" /> {enviando ? "Reabrindo..." : "Reabrir desafio"}
        </button>
      )}
      {erro && <p role="alert" className="max-w-64 text-right text-xs text-bad">{erro}</p>}
    </div>
  );
}
