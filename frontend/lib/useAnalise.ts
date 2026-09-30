"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buscarAnalise, ErroApi, type AnaliseDetalhe } from "@/lib/api";

const INTERVALO_MS = 1500;
const LIMITE_ESPERA_MS = 3 * 60 * 1000;

/** Acompanha uma análise até ela terminar. Sem sessão, manda para o login ("/"). */
export function useAnalise(id: string | null) {
  const router = useRouter();
  const [analise, setAnalise] = useState<AnaliseDetalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let ativo = true;
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    const inicio = Date.now();

    async function consultar(analiseId: string) {
      try {
        const dados = await buscarAnalise(analiseId);
        if (!ativo) return;
        setAnalise(dados);

        const terminou = dados.status === "CONCLUIDA" || dados.status === "FALHOU";
        if (terminou) return;

        if (Date.now() - inicio > LIMITE_ESPERA_MS) {
          setErro("A análise está demorando mais que o normal. Volte daqui a pouco.");
          return;
        }
        temporizador = setTimeout(() => consultar(analiseId), INTERVALO_MS);
      } catch (e: unknown) {
        if (!ativo) return;
        if (e instanceof ErroApi && e.status === 401) {
          router.replace("/");
          return;
        }
        setErro(e instanceof Error ? e.message : "Erro inesperado.");
      }
    }

    consultar(id);

    return () => {
      ativo = false;
      clearTimeout(temporizador);
    };
  }, [id, router]);

  return { analise, erro };
}
