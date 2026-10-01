"use client";

import { usePerfil } from "@/lib/SessaoContext";

export function Saudacao() {
  const perfil = usePerfil();
  const primeiroNome = (perfil.nome ?? perfil.login).trim().split(/\s+/)[0];

  return (
    <>
      Olá, <span className="text-koda-texto">{primeiroNome}!</span> 👋
    </>
  );
}
