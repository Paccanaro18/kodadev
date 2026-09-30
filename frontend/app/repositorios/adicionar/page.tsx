"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import AppShell from "@/components/AppShell";
import { BackLink, PageHeader } from "@/components/ui";
import { ErroApi, iniciarAnalise, listarRepositorios, type Repositorio } from "@/lib/api";
import { tempoRelativo } from "@/lib/formatar";

export default function AddRepo() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [repositorios, setRepositorios] = useState<Repositorio[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [conectando, setConectando] = useState<number | null>(null);
  const [erroConexao, setErroConexao] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setErro(null);
    setRepositorios(null);

    listarRepositorios()
      .then(setRepositorios)
      .catch((e: unknown) => {
        if (e instanceof ErroApi && e.status === 401) {
          router.replace("/");
          return;
        }
        setErro(e instanceof Error ? e.message : "Erro inesperado.");
      });
  }, [router]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function conectar(r: Repositorio) {
    setErroConexao(null);
    setConectando(r.id);
    try {
      const dono = r.nomeCompleto.split("/")[0];
      const analise = await iniciarAnalise(dono, r.nome);
      router.push(`/analisando?analise=${encodeURIComponent(analise.id)}`);
    } catch (e: unknown) {
      if (e instanceof ErroApi && e.status === 401) {
        router.replace("/");
        return;
      }
      setErroConexao(e instanceof Error ? e.message : "Erro inesperado.");
      setConectando(null);
    }
  }

  const termo = q.toLowerCase().trim();
  const lista = (repositorios ?? []).filter((r) => r.nome.toLowerCase().includes(termo));

  return (
    <AppShell width="max-w-[760px]">
      <BackLink href="/dashboard">← Voltar</BackLink>
      <PageHeader mascot="duvida" title="Adicionar repositório" subtitle="Escolha um dos seus repositórios públicos do GitHub para conectar." />
      <label className="mt-7 flex h-14 items-center gap-3 rounded-[18px] border-[1.5px] border-[#e5e2f2] bg-white px-5 focus-within:border-koda">
        <Search className="size-5 text-[#8a8fa5]" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar repositórios..." className="flex-1 bg-transparent text-[15px] outline-none" />
      </label>

      <div className="mt-5 grid gap-3">
        {repositorios === null && !erro &&
          [0, 1, 2].map((i) => (
            <div key={i} className="h-[86px] animate-pulse rounded-[22px] bg-white shadow-soft" />
          ))}

        {erro && (
          <div role="alert" className="rounded-[22px] bg-[#fdecee] px-6 py-5 text-sm text-[#b42335]">
            <p>{erro}</p>
            <button onClick={carregar} className="mt-3 h-9 rounded-xl border-[1.5px] border-[#b42335] px-4 text-sm font-bold transition duration-200 hover:bg-[#b42335] hover:text-white">Tentar de novo</button>
          </div>
        )}

        {erroConexao && (
          <div role="alert" className="rounded-[22px] bg-[#fdecee] px-6 py-4 text-sm text-[#b42335]">{erroConexao}</div>
        )}

        {lista.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] bg-white px-6 py-5 shadow-soft">
            <div className="min-w-0 flex-1">
              <div className="font-bold">{r.nome}</div>
              <div className="mt-1 text-[13px] text-ink-2">
                {[r.descricao, r.linguagem, r.atualizadoEm && `atualizado ${tempoRelativo(r.atualizadoEm)}`].filter(Boolean).join(" · ")}
              </div>
            </div>
            <button onClick={() => conectar(r)} disabled={conectando !== null} className="h-10 rounded-[14px] border-[1.5px] border-koda px-5 text-sm font-bold text-koda transition duration-200 hover:scale-105 hover:bg-koda hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-koda">{conectando === r.id ? "Conectando..." : "Conectar"}</button>
          </div>
        ))}

        {repositorios !== null && lista.length === 0 && (
          <p className="py-8 text-center text-ink-2">
            {repositorios.length === 0 ? "Você ainda não tem repositórios públicos no GitHub." : "Nenhum repositório encontrado."}
          </p>
        )}
      </div>
    </AppShell>
  );
}
