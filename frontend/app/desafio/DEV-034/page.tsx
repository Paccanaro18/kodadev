"use client";
import { useState } from "react";
import { Check, CircleAlert } from "lucide-react";
import AppShell from "@/components/AppShell";
import { AvisoExemplo, BackLink, Mascot, StatusBadge } from "@/components/ui";
import { ticket } from "@/lib/data";

const mark = {
  dot: <span className="size-1.5 rounded-full bg-koda" />,
  check: <Check className="size-3.5 text-koda" strokeWidth={3} />,
  alert: <CircleAlert className="size-3.5 text-koda" strokeWidth={3} />,
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-[28px] bg-white px-6 py-6 shadow-soft sm:px-9 sm:py-7">
    <h2 className="mb-3.5 text-xs font-bold tracking-[0.12em] text-koda uppercase">{title}</h2>
    {children}
  </section>
);

export default function Desafio() {
  const [hint, setHint] = useState(false);
  return (
    <AppShell width="max-w-[860px]">
      <AvisoExemplo>Ticket de exemplo. Os desafios gerados pela IA entram na Etapa 6.</AvisoExemplo>
      <BackLink href="/projeto">← api-pagamentos</BackLink>
      <div className="grid gap-5">
        <header className="rounded-[28px] bg-white p-6 shadow-soft sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-[10px] bg-koda-soft px-3.5 py-1.5 text-sm font-bold text-koda">{ticket.id}</span>
              {[ticket.area, ticket.level].map((t) => <span key={t} className="rounded-lg border border-[#ddd9ff] px-3 py-1 text-xs text-koda">{t}</span>)}
            </div>
            <StatusBadge status={ticket.status} />
          </div>
          <h1 className="mt-5 text-2xl leading-tight font-bold tracking-tight sm:text-3xl">{ticket.title}</h1>
        </header>

        {ticket.text.map((s) => <Section key={s.title} title={s.title}><p className="leading-relaxed text-[#2a2f4a]">{s.body}</p></Section>)}
        {ticket.lists.map((s) => (
          <Section key={s.title} title={s.title}>
            <ul className="grid gap-2.5">
              {s.items.map((it) => (
                <li key={it} className="flex gap-3 leading-relaxed text-[#2a2f4a]">
                  <span className="mt-0.5 grid size-5.5 shrink-0 place-items-center rounded-[7px] bg-koda-soft">{mark[s.mark as keyof typeof mark]}</span>{it}
                </li>
              ))}
            </ul>
          </Section>
        ))}

        <aside className="flex flex-wrap items-center gap-4 rounded-[28px] bg-koda-soft p-6">
          <Mascot name="duvida" className="h-20" />
          <div className="min-w-[220px] flex-1">
            <div className="font-bold">Precisa de ajuda?</div>
            <p className="mt-1 text-sm leading-relaxed text-[#3b4058]">{hint ? ticket.hint : "Uma dica ajuda sem entregar a solução."}</p>
          </div>
          <button onClick={() => setHint(!hint)} className="h-12 rounded-2xl bg-koda px-6 text-sm font-bold text-white transition duration-200 hover:scale-105 hover:-rotate-1 hover:bg-koda-dark active:scale-95">{hint ? "Ocultar dica" : "Pedir dica"}</button>
        </aside>
      </div>
    </AppShell>
  );
}
