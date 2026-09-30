"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderGit2 } from "lucide-react";
import { ErroApi, listarAnalises, type AnaliseResumo } from "@/lib/api";
import { tempoRelativo } from "@/lib/formatar";
import { rotuloTecnologia } from "@/lib/projeto";

const card = "rounded-3xl bg-white shadow-soft";
const seeAll = "rounded-[10px] border border-[#e5e2f2] px-3 py-1.5 text-xs font-semibold transition duration-200 hover:translate-x-0.5 hover:bg-koda-soft";

function tagsDe(a: AnaliseResumo): string[] {
  const tags: string[] = [];
  if (a.versaoJava) tags.push(`Java ${a.versaoJava}`);
  if (a.springBoot) tags.push("Spring Boot");
  tags.push(...a.tecnologias.map(rotuloTecnologia));
  return tags;
}

function situacaoDe(a: AnaliseResumo): { cor: string; texto: string } {
  if (a.status === "CONCLUIDA") {
    return { cor: "bg-[#2fbf71]", texto: `Analisado ${tempoRelativo(a.concluidaEm)}${a.parcial ? " (parcial)" : ""}` };
  }
  if (a.status === "FALHOU") {
    return { cor: "bg-[#e5484d]", texto: a.mensagemErro ?? "A análise falhou" };
  }
  return { cor: "bg-[#f5a623] animate-pulse", texto: "Analisando..." };
}

function destinoDe(a: AnaliseResumo): string {
  const id = encodeURIComponent(a.id);
  return a.status === "CONCLUIDA" ? `/projeto?analise=${id}` : `/analisando?analise=${id}`;
}

export default function RepositoriosConectados() {
  const router = useRouter();
  const [analises, setAnalises] = useState<AnaliseResumo[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setErro(null);
    setAnalises(null);

    listarAnalises()
      .then(setAnalises)
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

  return (
    <section className={card + " p-6"}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[17px] font-bold">Repositórios conectados</h2>
        <Link href="/repositorios/adicionar" className={seeAll}>Adicionar →</Link>
      </div>

      {erro && (
        <div role="alert" className="rounded-2xl bg-[#fdecee] px-5 py-4 text-sm text-[#b42335]">
          <p>{erro}</p>
          <button onClick={carregar} className="mt-3 h-9 rounded-xl border-[1.5px] border-[#b42335] px-4 text-sm font-bold transition duration-200 hover:bg-[#b42335] hover:text-white">Tentar de novo</button>
        </div>
      )}

      {analises === null && !erro && (
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-36 animate-pulse rounded-[18px] bg-[#f5f4fb]" />)}
        </div>
      )}

      {analises !== null && analises.length === 0 && (
        <p className="py-6 text-center text-sm text-ink-2">
          Você ainda não conectou nenhum repositório.{" "}
          <Link href="/repositorios/adicionar" className="font-bold text-koda">Conectar o primeiro</Link>
        </p>
      )}

      {analises !== null && analises.length > 0 && (
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {analises.map((a) => {
            const situacao = situacaoDe(a);
            return (
              <Link key={a.id} href={destinoDe(a)} className="grid content-start gap-2.5 rounded-[18px] border border-[#efecf7] p-4 text-ink transition duration-200 hover:-translate-y-1 hover:text-ink hover:shadow-lift active:translate-y-0">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-9.5 place-items-center rounded-xl bg-koda-soft text-koda"><FolderGit2 className="size-5" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{a.nome}</div>
                    <div className="truncate text-[11px] text-[#8a8fa5]">{a.dono}/{a.nome}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tagsDe(a).map((t) => <span key={t} className="rounded-full border border-[#ece9f5] px-2.5 py-0.5 text-[11px]">{t}</span>)}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#3b4058]">
                  <i className={`size-2 shrink-0 rounded-full ${situacao.cor}`} /><span className="line-clamp-2">{situacao.texto}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
