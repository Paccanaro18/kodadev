"use client";
import Link from "next/link";
import AppShell from "./AppShell";
import Wait from "./Wait";
import { BackLink, btnPrimary, Mascot } from "./ui";
import { generationSteps } from "@/lib/data";
import { useDesafio } from "@/lib/useDesafio";

function Falha({ mensagem, analiseId }: { mensagem: string; analiseId: string | null }) {
  const novo = analiseId ? `/desafio/novo?analise=${encodeURIComponent(analiseId)}` : "/desafio/novo";

  return (
    <AppShell width="max-w-[560px]">
      <div className="text-center">
        <Mascot name="duvida" className="mx-auto h-44 sm:h-52" />
        <h1 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[32px]">Não deu para gerar o desafio</h1>
        <p role="alert" className="mx-auto mt-3 max-w-[440px] text-ink-2">{mensagem}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={novo} className={btnPrimary + " hover:text-white"}>Tentar de novo</Link>
          <BackLink href="/dashboard">← Voltar ao início</BackLink>
        </div>
      </div>
    </AppShell>
  );
}

export default function AcompanharDesafio({ id }: { id: string | null }) {
  const { desafio, erro } = useDesafio(id);

  if (!id) return <Falha mensagem="Nenhum desafio foi informado." analiseId={null} />;
  if (erro) return <Falha mensagem={erro} analiseId={desafio?.analiseId ?? null} />;
  if (desafio?.statusGeracao === "FALHOU") {
    return <Falha mensagem={desafio.mensagemErro ?? "A geração não foi concluída."} analiseId={desafio.analiseId} />;
  }

  return (
    <Wait
      mascot="prancheta"
      title={desafio ? `Gerando o ${desafio.codigo}` : "Gerando seu desafio"}
      subtitle="A IA está escrevendo o ticket. Pode levar alguns instantes."
      steps={generationSteps}
      next={`/desafio/${encodeURIComponent(id)}`}
      pronto={desafio?.statusGeracao === "PRONTO"}
    />
  );
}
