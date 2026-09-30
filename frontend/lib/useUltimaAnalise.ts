"use client";

import { useEffect, useState } from "react";
import { listarAnalises } from "@/lib/api";

/** Quando não se sabe qual análise usar, pega a mais recente que já foi concluída. */
export function useUltimaAnalise(ativo: boolean) {
  const [id, setId] = useState<string | null>(null);
  const [vazio, setVazio] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!ativo) return;

    let vivo = true;
    listarAnalises()
      .then((lista) => {
        if (!vivo) return;
        const concluida = lista.find((a) => a.status === "CONCLUIDA");
        if (concluida) setId(concluida.id);
        else setVazio(true);
      })
      .catch((e: unknown) => {
        if (vivo) setErro(e instanceof Error ? e.message : "Erro inesperado.");
      });

    return () => {
      vivo = false;
    };
  }, [ativo]);

  return { id, vazio, erro };
}
