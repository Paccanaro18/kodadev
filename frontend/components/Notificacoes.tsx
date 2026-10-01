"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check, CircleAlert, Sparkles } from "lucide-react";
import { listarNotificacoes, marcarComoLida, marcarTodasComoLidas, type Notificacao, type Notificacoes as Dados } from "@/lib/api";
import { tempoRelativo } from "@/lib/formatar";

const INTERVALO_MS = 30_000;

function textoDe(n: Notificacao): string {
  switch (n.tipo) {
    case "DESAFIO_PRONTO":
      return `O ${n.codigo} está pronto${n.titulo ? `: ${n.titulo}` : ""}`;
    case "DESAFIO_FALHOU":
      return `A geração do ${n.codigo} não deu certo`;
    case "PROGRESSO_CONCLUIDO":
      return `Você concluiu o ${n.codigo}${n.titulo ? `: ${n.titulo}` : ""}`;
    default:
      return `Novidade no ${n.codigo}`;
  }
}

function Icone({ tipo }: { tipo: Notificacao["tipo"] }) {
  if (tipo === "DESAFIO_FALHOU") return <CircleAlert className="size-3.5" />;
  if (tipo === "PROGRESSO_CONCLUIDO") return <Check className="size-3.5" strokeWidth={3} />;
  return <Sparkles className="size-3.5" />;
}

/** Sino do topo: contador de não lidas (consultado a cada 30 s) e a lista das últimas notificações. */
export default function Notificacoes() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [dados, setDados] = useState<Dados | null>(null);
  const [erro, setErro] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  const carregar = useCallback(() => {
    listarNotificacoes()
      .then((d) => { setDados(d); setErro(false); })
      .catch(() => setErro(true));
  }, []);

  useEffect(() => {
    carregar();
    const intervalo = setInterval(() => {
      if (document.visibilityState === "visible") carregar();
    }, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [carregar]);

  useEffect(() => {
    if (!aberto) return;
    carregar();
    function aoClicarFora(e: MouseEvent) {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto, carregar]);

  async function abrir(n: Notificacao) {
    setAberto(false);
    if (!n.lida) {
      setDados((atual) => atual && {
        naoLidas: Math.max(0, atual.naoLidas - 1),
        itens: atual.itens.map((i) => (i.id === n.id ? { ...i, lida: true } : i)),
      });
      marcarComoLida(n.id).catch(() => carregar());
    }
    router.push(`/desafio/${encodeURIComponent(n.desafioId)}`);
  }

  async function marcarTodas() {
    setDados((atual) => atual && { naoLidas: 0, itens: atual.itens.map((i) => ({ ...i, lida: true })) });
    try {
      await marcarTodasComoLidas();
    } catch {
      carregar();
    }
  }

  const naoLidas = dados?.naoLidas ?? 0;

  return (
    <div ref={caixa} className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        aria-label={naoLidas > 0 ? `Notificações (${naoLidas} não lidas)` : "Notificações"}
        aria-expanded={aberto}
        className="relative grid size-11 place-items-center rounded-[14px] border border-[#efecf7] bg-white transition duration-200 hover:scale-110 hover:-rotate-6 hover:bg-[#f3f1ff] active:scale-95"
      >
        <Bell className="size-5" />
        {naoLidas > 0 && (
          <span className="absolute -top-1.5 -right-1.5 grid min-w-5 place-items-center rounded-full bg-[#ff5a6a] px-1 text-[11px] leading-5 font-bold text-white">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div role="dialog" aria-label="Notificações" className="absolute top-14 right-0 z-30 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#efecf7] bg-white p-2 shadow-soft">
          <div className="flex items-center justify-between px-3 pt-2 pb-1">
            <span className="text-sm font-bold">Notificações</span>
            {naoLidas > 0 && (
              <button onClick={marcarTodas} className="text-xs font-semibold text-koda transition duration-200 hover:translate-x-0.5">Marcar todas como lidas</button>
            )}
          </div>

          {erro && !dados && <p className="px-3 py-3 text-sm text-ink-2">Não foi possível carregar agora.</p>}
          {dados && dados.itens.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-ink-2">Nenhuma notificação por enquanto.</p>
          )}
          {dados && dados.itens.length > 0 && (
            <ul className="max-h-96 overflow-y-auto">
              {dados.itens.map((n) => (
                <li key={n.id}>
                  <button onClick={() => abrir(n)} className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition duration-200 hover:bg-[#f3f1ff]">
                    <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${n.tipo === "DESAFIO_FALHOU" ? "bg-[#fdeaea] text-[#b3261e]" : "bg-koda-soft text-koda"}`}>
                      <Icone tipo={n.tipo} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[13px] leading-snug ${n.lida ? "text-ink-2" : "font-semibold"}`}>{textoDe(n)}</span>
                      <span className="block text-[11px] text-[#8a8fa5]">{tempoRelativo(n.criadoEm)}</span>
                    </span>
                    {!n.lida && <span aria-label="Não lida" className="mt-2 size-2 shrink-0 rounded-full bg-koda" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
