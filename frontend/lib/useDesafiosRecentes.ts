"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ErroApi, listarDesafiosRecentes, type DesafiosRecentes } from "@/lib/api";

/** Busca uma vez os últimos desafios do usuário. Sem sessão, manda para o login ("/"). */
export function useDesafiosRecentes() {
  const router = useRouter();
  const [dados, setDados] = useState<DesafiosRecentes | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    listarDesafiosRecentes()
      .then((d) => { if (ativo) setDados(d); })
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

  return { dados, erro };
}
