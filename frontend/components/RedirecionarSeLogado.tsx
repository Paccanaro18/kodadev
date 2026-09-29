"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { buscarPerfil } from "@/lib/api";

/** Quem já tem sessão não precisa ver a tela de login. */
export function RedirecionarSeLogado() {
  const router = useRouter();

  useEffect(() => {
    buscarPerfil()
      .then((perfil) => {
        if (perfil) router.replace("/dashboard");
      })
      .catch(() => {});
  }, [router]);

  return null;
}
