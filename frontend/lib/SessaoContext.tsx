"use client";

import { createContext, useContext } from "react";
import type { Perfil } from "@/lib/api";

export const SessaoContext = createContext<Perfil | null>(null);

/** Perfil do usuário logado. Só pode ser usado dentro do AppShell. */
export function usePerfil(): Perfil {
  const perfil = useContext(SessaoContext);
  if (!perfil) {
    throw new Error("usePerfil precisa ser usado dentro do AppShell");
  }
  return perfil;
}
