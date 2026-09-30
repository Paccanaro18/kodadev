"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buscarDesafio, ErroApi, type DesafioDetalhe } from "@/lib/api";
import { terminou } from "@/lib/desafio";

const INTERVALO_MS = 1500;
const LIMITE_ESPERA_MS = 4 * 60 * 1000;

/** Acompanha um desafio até a geração terminar. Sem sessão, manda para o login ("/"). */
export function useDesafio(id: string | null) {
  const router = useRouter();
  const [desafio, setDesafio] = useState<DesafioDetalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let ativo = true;
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    const inicio = Date.now();

    async function consultar(desafioId: string) {
      try {
        const dados = await buscarDesafio(desafioId);
        if (!ativo) return;
        setDesafio(dados);
        if (terminou(dados.statusGeracao)) return;

        if (Date.now() - inicio > LIMITE_ESPERA_MS) {
          setErro("A geração está demorando mais que o normal. Volte daqui a pouco.");
          return;
        }
        temporizador = setTimeout(() => consultar(desafioId), INTERVALO_MS);
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

  return { desafio, erro };
}
