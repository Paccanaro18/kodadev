"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ErroApi, listarHistorico, type FiltrosDoHistorico, type PaginaHistorico } from "@/lib/api";

/** Busca uma página do histórico sempre que os filtros mudam. Sem sessão, manda para o login ("/"). */
export function useHistorico(filtros: FiltrosDoHistorico) {
  const router = useRouter();
  const [pagina, setPagina] = useState<PaginaHistorico | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const { status, tipo, pagina: numero, tamanho } = filtros;

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    listarHistorico({ status, tipo, pagina: numero, tamanho })
      .then((p) => { if (ativo) setPagina(p); })
      .catch((e: unknown) => {
        if (!ativo) return;
        if (e instanceof ErroApi && e.status === 401) {
          router.replace("/");
          return;
        }
        setErro(e instanceof Error ? e.message : "Erro inesperado.");
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [status, tipo, numero, tamanho, router]);

  return { pagina, erro, carregando };
}
