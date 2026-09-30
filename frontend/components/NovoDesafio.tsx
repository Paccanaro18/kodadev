"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AppShell from "./AppShell";
import { BackLink, btnPrimary, Eyebrow, Mascot, PageHeader } from "./ui";
import { ErroApi, iniciarDesafio, type TipoPedido } from "@/lib/api";
import { TIPOS_DE_DESAFIO } from "@/lib/desafio";
import { useAnalise } from "@/lib/useAnalise";
import { useUltimaAnalise } from "@/lib/useUltimaAnalise";

function Mensagem({ titulo, texto, href, rotulo }: { titulo: string; texto: string; href: string; rotulo: string }) {
  return (
    <AppShell width="max-w-[560px]">
      <div className="text-center">
        <Mascot name="duvida" className="mx-auto h-44 sm:h-52" />
        <h1 className="mt-2 text-[28px] font-bold tracking-tight">{titulo}</h1>
        <p className="mx-auto mt-3 max-w-[440px] text-ink-2">{texto}</p>
        <Link href={href} className={btnPrimary + " mt-8 hover:text-white"}>{rotulo}</Link>
      </div>
    </AppShell>
  );
}

function Escolha({ analiseId }: { analiseId: string }) {
  const router = useRouter();
  const { analise, erro: erroAnalise } = useAnalise(analiseId);
  const [tipo, setTipo] = useState<TipoPedido>("FEATURE");
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setErro(null);
    setGerando(true);
    try {
      const desafio = await iniciarDesafio(analiseId, tipo);
      router.push(`/desafio/gerando?desafio=${encodeURIComponent(desafio.id)}`);
    } catch (e: unknown) {
      if (e instanceof ErroApi && e.status === 401) {
        router.replace("/");
        return;
      }
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
      setGerando(false);
    }
  }

  if (erroAnalise) {
    return <Mensagem titulo="Não foi possível carregar" texto={erroAnalise} href="/dashboard" rotulo="Voltar ao início" />;
  }

  const nomeDoProjeto = analise?.nome;

  return (
    <AppShell width="max-w-[760px]">
      <BackLink href={`/projeto?analise=${encodeURIComponent(analiseId)}`}>← Voltar</BackLink>
      <PageHeader
        mascot="prancheta"
        title="Novo desafio"
        subtitle={nomeDoProjeto ? `Escolha o tipo. A Koda cria o ticket a partir do código de ${nomeDoProjeto}.` : "Escolha o tipo. A Koda cria o ticket a partir do seu código."}
      />

      <div className="mt-8"><Eyebrow>Nível</Eyebrow></div>
      <div className="-mt-1 grid grid-cols-3 gap-3.5">
        <div className="rounded-[22px] border-2 border-koda bg-koda-soft p-4 sm:p-5"><div className="font-bold">Júnior</div><div className="mt-1 text-xs text-ink-2">Tarefas guiadas</div></div>
        {["Pleno", "Sênior"].map((n) => (
          <div key={n} aria-disabled className="rounded-[22px] border-2 border-transparent bg-[#f6f4f0] p-4 opacity-65 sm:p-5"><div className="font-bold">{n}</div><div className="mt-1 text-xs text-ink-2">Em breve</div></div>
        ))}
      </div>

      <div className="mt-8"><Eyebrow>Tipo</Eyebrow></div>
      <div role="radiogroup" className="-mt-1 grid gap-3.5 sm:grid-cols-2">
        {TIPOS_DE_DESAFIO.map((t) => (
          <button key={t.valor} role="radio" aria-checked={tipo === t.valor} disabled={gerando} onClick={() => setTipo(t.valor)}
            className={`rounded-[22px] border-2 p-5 text-left transition duration-200 hover:-translate-y-1 hover:shadow-lift active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60 ${tipo === t.valor ? "border-koda bg-koda-soft" : "border-[#efecf7] bg-white hover:border-koda/40"}`}>
            <div className="font-bold">{t.nome}</div><div className="mt-1 text-xs text-ink-2">{t.descricao}</div>
          </button>
        ))}
      </div>

      {erro && (
        <div role="alert" className="mt-6 rounded-[22px] bg-[#fdecee] px-6 py-4 text-sm text-[#b42335]">{erro}</div>
      )}

      <button onClick={gerar} disabled={gerando} className={btnPrimary + " mt-9 h-15 w-full text-base disabled:cursor-not-allowed disabled:opacity-60"}>
        {gerando ? "Gerando..." : "Gerar desafio"}
      </button>
    </AppShell>
  );
}

function SemAnaliseInformada() {
  const { id, vazio, erro } = useUltimaAnalise(true);

  if (erro) return <Mensagem titulo="Não foi possível carregar" texto={erro} href="/dashboard" rotulo="Voltar ao início" />;
  if (vazio) {
    return <Mensagem titulo="Nenhum projeto analisado ainda" texto="Conecte um repositório para a Koda analisar o seu código antes de gerar desafios." href="/repositorios/adicionar" rotulo="Adicionar repositório" />;
  }
  if (!id) {
    return (
      <AppShell width="max-w-[760px]">
        <div className="mt-10 h-64 animate-pulse rounded-[28px] bg-white shadow-soft" />
      </AppShell>
    );
  }
  return <Escolha analiseId={id} />;
}

export default function NovoDesafio({ analiseId }: { analiseId: string | null }) {
  return analiseId ? <Escolha analiseId={analiseId} /> : <SemAnaliseInformada />;
}
