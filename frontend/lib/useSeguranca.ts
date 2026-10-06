"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buscarDesafioDeSeguranca, buscarPlacarDeSeguranca, ErroApi, listarDesafiosDeSeguranca,
  type DetalheDeSeguranca, type PlacarDeSeguranca, type ResumoDeSeguranca,
} from "@/lib/api";

function mensagemDe(erro: unknown): string {
  return erro instanceof Error ? erro.message : "Erro inesperado.";
}

/** Carrega uma consulta da área de segurança. Sem sessão, manda para o login ("/"). */
function useConsulta<T>(buscar: () => Promise<T>, dependencias: unknown[]) {
  const router = useRouter();
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  const tentarDeNovo = useCallback(() => {
    setErro(null);
    setDados(null);
    setTentativa((n) => n + 1);
  }, []);

  useEffect(() => {
    let ativo = true;
    buscar()
      .then((resultado) => { if (ativo) setDados(resultado); })
      .catch((e: unknown) => {
        if (!ativo) return;
        if (e instanceof ErroApi && e.status === 401) {
          router.replace("/");
          return;
        }
        setErro(mensagemDe(e));
      });
    return () => { ativo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, tentativa, ...dependencias]);

  return { dados, setDados, erro, tentarDeNovo };
}

export function useDesafiosDeSeguranca() {
  const { dados, erro, tentarDeNovo } = useConsulta<ResumoDeSeguranca[]>(listarDesafiosDeSeguranca, []);
  return { desafios: dados, erro, tentarDeNovo };
}

export function usePlacarDeSeguranca() {
  const { dados, erro } = useConsulta<PlacarDeSeguranca>(buscarPlacarDeSeguranca, []);
  return { placar: dados, erro };
}

export function useDesafioDeSeguranca(slug: string) {
  const { dados, setDados, erro, tentarDeNovo } = useConsulta<DetalheDeSeguranca>(() => buscarDesafioDeSeguranca(slug), [slug]);
  const atualizar = useCallback(async () => {
    setDados(await buscarDesafioDeSeguranca(slug));
  }, [slug, setDados]);
  return { desafio: dados, atualizar, erro, tentarDeNovo };
}
