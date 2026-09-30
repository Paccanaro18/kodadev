"use client";
import Link from "next/link";
import AppShell from "./AppShell";
import Wait from "./Wait";
import { BackLink, btnPrimary, Mascot } from "./ui";
import { analysisSteps } from "@/lib/data";
import { useAnalise } from "@/lib/useAnalise";

function Falha({ mensagem }: { mensagem: string }) {
  return (
    <AppShell width="max-w-[560px]">
      <div className="text-center">
        <Mascot name="duvida" className="mx-auto h-44 sm:h-52" />
        <h1 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[32px]">Não deu para analisar</h1>
        <p role="alert" className="mx-auto mt-3 max-w-[440px] text-ink-2">{mensagem}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/repositorios/adicionar" className={btnPrimary + " hover:text-white"}>Escolher outro repositório</Link>
          <BackLink href="/dashboard">← Voltar ao início</BackLink>
        </div>
      </div>
    </AppShell>
  );
}

export default function AcompanharAnalise({ id }: { id: string | null }) {
  const { analise, erro } = useAnalise(id);

  if (!id) return <Falha mensagem="Nenhuma análise foi informada." />;
  if (erro) return <Falha mensagem={erro} />;
  if (analise?.status === "FALHOU") {
    return <Falha mensagem={analise.mensagemErro ?? "A análise não foi concluída."} />;
  }

  return (
    <Wait
      mascot="terminal"
      title={analise ? `Analisando ${analise.nome}` : "Analisando repositório"}
      subtitle="A Koda está lendo seu código. Leva alguns segundos."
      steps={analysisSteps}
      next={`/projeto?analise=${encodeURIComponent(id)}`}
      pronto={analise?.status === "CONCLUIDA"}
    />
  );
}
