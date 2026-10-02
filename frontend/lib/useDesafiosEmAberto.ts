"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ErroApi, listarDesafiosEmAberto, type ItemHistorico } from "@/lib/api";
import { estaGerando } from "@/lib/desafio";

const INTERVALO_COM_GERACAO_MS = 4000;

/**
 * Busca os desafios em aberto. Enquanto algum estiver sendo gerado, busca de novo a cada poucos segundos para ele
 * aparecer pronto sozinho. Sem sessão, manda para o login ("/").
 */
export function useDesafiosEmAberto() {
  const router = useRouter();
  const [itens, setItens] = useState<ItemHistorico[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  const tentarDeNovo = useCallback(() => {
    setErro(null);
    setItens(null);
    setTentativa((n) => n + 1);
  }, []);

  const temGeracao = itens?.some((item) => estaGerando(item.statusGeracao)) ?? false;

  useEffect(() => {
    let ativo = true;
    listarDesafiosEmAberto()
      .then((lista) => { if (ativo) setItens(lista); })
      .catch((e: unknown) => {
        if (!ativo) return;
        if (e instanceof ErroApi && e.status === 401) {
          router.replace("/");
          return;
        }
        setErro(e instanceof Error ? e.message : "Erro inesperado.");
      });
    return () => { ativo = false; };
  }, [router, tentativa]);

  useEffect(() => {
    if (!temGeracao) return;
    const relogio = setInterval(() => {
      listarDesafiosEmAberto().then(setItens).catch(() => { /* a próxima rodada tenta de novo */ });
    }, INTERVALO_COM_GERACAO_MS);
    return () => clearInterval(relogio);
  }, [temGeracao]);

  return { itens, erro, tentarDeNovo };
}
