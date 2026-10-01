"use client";
import { useState } from "react";
import { CheckCircle2, Play, RotateCcw } from "lucide-react";
import SeloProgresso from "./SeloProgresso";
import { mudarProgresso, type ProgressoDesafio, type StatusProgresso } from "@/lib/api";
import { tempoRelativo } from "@/lib/formatar";

const botao =
  "inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition duration-200 ease-out hover:-translate-y-0.5 active:scale-[.97] disabled:pointer-events-none disabled:opacity-60";

const AVISO: Record<StatusProgresso, string> = {
  NAO_INICIADO: "Comece quando for resolver. As dicas ficam disponíveis enquanto o desafio estiver em andamento.",
  EM_ANDAMENTO: "A Koda não lê o seu código: marcar como concluído é uma declaração sua.",
  CONCLUIDO: "Você pode reabrir o desafio se quiser mexer nele de novo.",
};

/** Mostra em que ponto da resolução a pessoa está e deixa começar, concluir ou reabrir o ticket. */
export default function AcompanhamentoDoDesafio({
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
  const data = statusProgresso === "CONCLUIDO" ? progresso.finalizadoEm : progresso.iniciadoEm;

  return (
    <section className="rounded-[28px] bg-white px-6 py-6 shadow-soft sm:px-9 sm:py-7">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xs font-bold tracking-[0.12em] text-koda uppercase">Seu andamento</h2>
        <SeloProgresso status={statusProgresso} />
        {data && statusProgresso !== "NAO_INICIADO" && (
          <span className="text-xs text-ink-2">
            {statusProgresso === "CONCLUIDO" ? "Concluído" : "Iniciado"} {tempoRelativo(data)}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-2">{AVISO[statusProgresso]}</p>
      {erro && <p role="alert" className="mt-3 text-sm text-[#b3261e]">{erro}</p>}

      <div className="mt-4 flex flex-wrap gap-3">
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
          <button onClick={() => mudar("EM_ANDAMENTO")} disabled={enviando} className={botao + " border border-[#e5e2f2] hover:bg-koda-soft"}>
            <RotateCcw className="size-4" /> {enviando ? "Reabrindo..." : "Reabrir desafio"}
          </button>
        )}
      </div>
    </section>
  );
}
