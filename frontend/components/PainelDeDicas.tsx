"use client";
import { useEffect, useState } from "react";
import { Lightbulb, LoaderCircle } from "lucide-react";
import { listarDicas, pedirDica, type Dicas, type StatusProgresso } from "@/lib/api";
import { rotuloDoNivelDaDica } from "@/lib/desafio";

/** Dicas em níveis crescentes. A geração é feita na hora e pode levar de alguns segundos a cerca de 1 minuto. */
export default function PainelDeDicas({ desafioId, status }: { desafioId: string; status: StatusProgresso }) {
  const [dados, setDados] = useState<Dicas | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarDicas(desafioId)
      .then((d) => { if (ativo) setDados(d); })
      .catch((e: unknown) => { if (ativo) setErro(e instanceof Error ? e.message : "Erro inesperado."); });
    return () => { ativo = false; };
  }, [desafioId]);

  async function pedir() {
    setGerando(true);
    setErro(null);
    try {
      const nova = await pedirDica(desafioId);
      setDados((atual) => atual && { ...atual, dicas: [...atual.dicas, nova], usadasHoje: atual.usadasHoje + 1 });
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Não foi possível gerar a dica.");
      // O servidor pode ter mudado de estado (por exemplo, outra aba pediu a mesma dica).
      listarDicas(desafioId).then(setDados).catch(() => undefined);
    } finally {
      setGerando(false);
    }
  }

  const usadas = dados?.dicas.length ?? 0;
  const maximo = dados?.maximoPorDesafio ?? 3;
  const semCotaHoje = dados ? dados.usadasHoje >= dados.limiteDiario : false;
  const podePedir = status === "EM_ANDAMENTO" && usadas < maximo && !semCotaHoje && !gerando;

  return (
    <section className="flex min-h-[16rem] flex-col rounded-3xl bg-surface p-5 shadow-soft lg:min-h-0 lg:flex-1">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-bold tracking-[0.12em] text-koda uppercase">Dicas</h2>
        {dados && <span className="text-xs text-ink-2">{usadas} de {maximo} neste desafio · {dados.usadasHoje} de {dados.limiteDiario} hoje</span>}
      </div>

      <p className="mt-2 shrink-0 text-[13px] leading-relaxed text-ink-2">
        As dicas apontam o caminho, nunca a solução. Cada uma é mais próxima que a anterior.
      </p>

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">

      {dados && dados.dicas.length > 0 && (
        <ol className="grid gap-2.5">
          {dados.dicas.map((d) => (
            <li key={d.nivel} className="flex gap-3 rounded-2xl bg-tint p-3.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-koda text-xs font-bold text-white">{d.nivel}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-koda">{rotuloDoNivelDaDica(d.nivel)}</div>
                <p className="mt-1 text-[14px] leading-relaxed text-body">{d.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

        {erro && <p role="alert" className="mt-3 text-sm text-bad">{erro}</p>}
        {gerando && (
        <p role="status" className="mt-3 flex items-center gap-2 text-sm text-ink-2">
          <LoaderCircle className="size-4 animate-spin text-koda" /> Escrevendo a dica... pode levar até 1 minuto.
        </p>
      )}
      </div>

      <div className="mt-3 shrink-0">
        <button
          onClick={pedir}
          disabled={!podePedir}
          className="inline-flex h-11 items-center gap-2 rounded-2xl bg-koda-soft px-5 text-sm font-bold text-koda transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-koda/25 active:scale-[.97] disabled:pointer-events-none disabled:opacity-50"
        >
          <Lightbulb className="size-4" /> {usadas === 0 ? "Pedir uma dica" : "Pedir outra dica"}
        </button>
        {status === "NAO_INICIADO" && <p className="mt-2 text-xs text-ink-2">Comece o desafio para liberar as dicas.</p>}
        {status === "CONCLUIDO" && <p className="mt-2 text-xs text-ink-2">Reabra o desafio para pedir mais dicas.</p>}
        {status === "EM_ANDAMENTO" && usadas >= maximo && <p className="mt-2 text-xs text-ink-2">Você já usou todas as dicas deste desafio.</p>}
        {status === "EM_ANDAMENTO" && semCotaHoje && usadas < maximo && <p className="mt-2 text-xs text-ink-2">Você chegou ao limite de dicas de hoje. Tente de novo mais tarde.</p>}
      </div>
    </section>
  );
}
