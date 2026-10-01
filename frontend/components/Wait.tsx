"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import AppShell from "./AppShell";
import { Mascot } from "./ui";

type Props = {
  mascot: string;
  title: string;
  subtitle: string;
  steps: string[];
  next: string;
  /** Quando informado, os passos param no último até ficar true. Sem ele, avançam sozinhos até o fim. */
  pronto?: boolean;
};

export default function Wait({ mascot, title, subtitle, steps, next, pronto }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const aguardando = pronto === false;

  useEffect(() => {
    const t = setInterval(
      () => setStep((s) => (aguardando ? Math.min(s + 1, steps.length - 1) : s + 1)),
      pronto === true ? 350 : 900,
    );
    return () => clearInterval(t);
  }, [aguardando, pronto, steps.length]);

  useEffect(() => { if (step > steps.length) router.push(next); }, [step, steps.length, next, router]);

  return (
    <AppShell width="max-w-[560px]">
      <div className="text-center">
        <Mascot name={mascot} className="mx-auto h-44 sm:h-52" />
        <h1 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[32px]">{title}</h1>
        <p className="mt-2 mb-8 text-ink-2">{subtitle}</p>
      </div>
      <ol className="rounded-[28px] bg-surface px-6 py-3 shadow-soft" aria-live="polite">
        {steps.map((s, i) => {
          const done = i < step, cur = i === step;
          return (
            <li key={s} className={`flex items-center gap-3.5 border-b border-line py-4 text-[15px] last:border-0 ${cur ? "font-bold" : "font-medium"} ${done || cur ? "text-ink" : "text-ink-3"}`}>
              <span className={`grid size-6.5 place-items-center rounded-full text-[13px] font-bold ${done ? "bg-koda text-white" : cur ? "bg-koda-soft text-koda animate-pulse" : "bg-tint text-koda"}`}>
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              {s}
            </li>
          );
        })}
      </ol>
    </AppShell>
  );
}
