"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buscarResumoDoProgresso, ErroApi, type ResumoDoProgresso } from "@/lib/api";

/** Busca uma vez as contagens de progresso do usuário. Sem sessão, manda para o login ("/"). */
export function useResumoDoProgresso() {
  const router = useRouter();
  const [resumo, setResumo] = useState<ResumoDoProgresso | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    buscarResumoDoProgresso()
      .then((r) => { if (ativo) setResumo(r); })
      .catch((e: unknown) => {
        if (!ativo) return;
        if (e instanceof ErroApi && e.status === 401) {
          router.replace("/");
          return;
        }
        setErro(e instanceof Error ? e.message : "Erro inesperado.");
      });
    return () => { ativo = false; };
  }, [router]);

  return { resumo, erro };
}
