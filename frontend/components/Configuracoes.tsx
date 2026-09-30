"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import AppShell from "./AppShell";
import { Card, Eyebrow, PageHeader } from "./ui";
import { sair } from "@/lib/api";
import { usePerfil } from "@/lib/SessaoContext";
import { useDesafiosRecentes } from "@/lib/useDesafiosRecentes";

function Conteudo() {
  const perfil = usePerfil();
  const router = useRouter();
  const { dados, erro } = useDesafiosRecentes();
  const [saindo, setSaindo] = useState(false);
  const [erroAoSair, setErroAoSair] = useState<string | null>(null);

  async function aoSair() {
    setSaindo(true);
    setErroAoSair(null);
    try {
      await sair();
      router.replace("/");
    } catch {
      setErroAoSair("Não foi possível sair agora. Tente novamente.");
      setSaindo(false);
    }
  }

  const porcentagem = dados && dados.cotaLimite > 0 ? Math.min(100, Math.round((dados.cotaUsada / dados.cotaLimite) * 100)) : 0;

  return (
    <>
      <PageHeader mascot="laptop" title="Configurações" subtitle="Sua conta e o seu uso da Koda." />

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <Eyebrow>Conta</Eyebrow>
          <div className="flex items-center gap-4">
            <Image src={perfil.avatarUrl} alt={perfil.login} width={64} height={64} className="size-16 rounded-full" />
            <div className="min-w-0">
              <div className="truncate text-lg font-bold">{perfil.nome ?? perfil.login}</div>
              <div className="truncate text-sm text-ink-2">@{perfil.login}</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-2">
            Você entra com o GitHub. A Koda lê apenas repositórios públicos e guarda o mínimo para gerar os desafios.
          </p>
          <a
            href={`https://github.com/${encodeURIComponent(perfil.login)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-koda transition duration-200 hover:translate-x-0.5"
          >
            Ver perfil no GitHub <ExternalLink className="size-3.5" />
          </a>
        </Card>

        <Card>
          <Eyebrow>Uso de hoje</Eyebrow>
          {erro && <p role="alert" className="text-sm text-ink-2">{erro}</p>}
          {!erro && !dados && <div className="h-20 animate-pulse rounded-2xl bg-[#f4f1fa]" />}
          {dados && (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold">{dados.cotaUsada}</span>
                <span className="text-ink-2">de {dados.cotaLimite} desafios gerados nas últimas 24 horas</span>
              </div>
              <div className="mt-4 h-2.5 rounded-full bg-[#efecfb]" role="progressbar" aria-valuemin={0} aria-valuemax={dados.cotaLimite} aria-valuenow={dados.cotaUsada}>
                <div className="h-2.5 rounded-full bg-[#7d74ff] transition-all duration-500" style={{ width: `${porcentagem}%` }} />
              </div>
              <p className="mt-4 text-sm text-ink-2">
                {dados.cotaUsada >= dados.cotaLimite
                  ? "Você chegou ao limite. A cota volta a liberar conforme os desafios saem da janela de 24 horas."
                  : `Você ainda pode gerar ${dados.cotaLimite - dados.cotaUsada} ${dados.cotaLimite - dados.cotaUsada === 1 ? "desafio" : "desafios"}.`}
              </p>
              <p className="mt-2 text-sm text-ink-2">Total gerado até agora: <b className="text-ink">{dados.totalGerados}</b></p>
            </>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <Eyebrow>Sessão</Eyebrow>
        <p className="text-sm text-ink-2">Sair encerra a sessão neste navegador. Seus repositórios e desafios continuam guardados.</p>
        {erroAoSair && <p role="alert" className="mt-3 text-sm text-[#b3261e]">{erroAoSair}</p>}
        <button
          onClick={aoSair}
          disabled={saindo}
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-2xl border border-[#e5e2f2] px-5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:bg-koda-soft active:scale-[.97] disabled:opacity-60"
        >
          <LogOut className="size-4" /> {saindo ? "Saindo..." : "Sair da conta"}
        </button>
      </Card>
    </>
  );
}

export default function Configuracoes() {
  return (
    <AppShell width="max-w-[960px]">
      <Conteudo />
    </AppShell>
  );
}
