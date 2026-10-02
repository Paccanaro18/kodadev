"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buscarPerfil } from "@/lib/api";

const estilo = "inline-flex h-11 items-center rounded-2xl bg-koda px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-koda-dark hover:text-white active:scale-[.97]";

/** "Entrar" para quem não tem sessão; "Ir para o app" para quem já está logado. Sem resposta, fica em "Entrar". */
export default function BotaoDeEntrada({ className = "" }: { className?: string }) {
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    let ativo = true;
    buscarPerfil()
      .then((perfil) => { if (ativo) setLogado(perfil !== null); })
      .catch(() => { /* sem resposta, o botão continua sendo "Entrar" */ });
    return () => { ativo = false; };
  }, []);

  return logado
    ? <Link href="/dashboard" className={`${estilo} ${className}`}>Ir para o app</Link>
    : <Link href="/" className={`${estilo} ${className}`}>Entrar</Link>;
}
