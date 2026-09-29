"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { BackLink, btnPrimary, Eyebrow, PageHeader } from "@/components/ui";
import { challengeTypes } from "@/lib/data";

export default function NovoDesafio() {
  const router = useRouter();
  const [type, setType] = useState("Feature");
  return (
    <AppShell width="max-w-[760px]">
      <BackLink href="/projeto">← Voltar</BackLink>
      <PageHeader mascot="prancheta" title="Novo desafio" subtitle="Escolha o nível e o tipo. A Koda cria o ticket a partir do seu código." />

      <div className="mt-8"><Eyebrow>Nível</Eyebrow></div>
      <div className="-mt-1 grid grid-cols-3 gap-3.5">
        <div className="rounded-[22px] border-2 border-koda bg-koda-soft p-4 sm:p-5"><div className="font-bold">Júnior</div><div className="mt-1 text-xs text-ink-2">Tarefas guiadas</div></div>
        {["Pleno", "Sênior"].map((n) => (
          <div key={n} aria-disabled className="rounded-[22px] border-2 border-transparent bg-[#f6f4f0] p-4 opacity-65 sm:p-5"><div className="font-bold">{n}</div><div className="mt-1 text-xs text-ink-2">Em breve</div></div>
        ))}
      </div>

      <div className="mt-8"><Eyebrow>Tipo</Eyebrow></div>
      <div role="radiogroup" className="-mt-1 grid gap-3.5 sm:grid-cols-2">
        {challengeTypes.map((t) => (
          <button key={t.name} role="radio" aria-checked={type === t.name} onClick={() => setType(t.name)}
            className={`rounded-[22px] border-2 p-5 text-left transition duration-200 hover:-translate-y-1 hover:shadow-lift active:scale-[.98] ${type === t.name ? "border-koda bg-koda-soft" : "border-[#efecf7] bg-white hover:border-koda/40"}`}>
            <div className="font-bold">{t.name}</div><div className="mt-1 text-xs text-ink-2">{t.desc}</div>
          </button>
        ))}
      </div>

      <button onClick={() => router.push("/desafio/gerando")} className={btnPrimary + " mt-9 h-15 w-full text-base"}>Gerar desafio</button>
    </AppShell>
  );
}
