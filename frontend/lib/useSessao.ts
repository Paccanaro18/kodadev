"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buscarPerfil, type Perfil } from "@/lib/api";

/** Garante que há usuário logado. Sem sessão, manda para a tela de login ("/"). */
export function useSessao() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    let ativo = true;

    buscarPerfil()
      .then((dados) => {
        if (!ativo) return;
        if (dados === null) {
          router.replace("/");
          return;
        }
        setPerfil(dados);
        setCarregando(false);
      })
      .catch(() => {
        if (!ativo) return;
        setFalhou(true);
        setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [router]);

  return { perfil, carregando, falhou };
}
