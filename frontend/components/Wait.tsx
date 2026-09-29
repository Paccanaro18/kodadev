"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import AppShell from "./AppShell";
import { Mascot } from "./ui";

export default function Wait({ mascot, title, subtitle, steps, next }: { mascot: string; title: string; subtitle: string; steps: string[]; next: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => s + 1), 900);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (step > steps.length) router.push(next); }, [step, steps.length, next, router]);

  return (
    <AppShell width="max-w-[560px]">
      <div className="text-center">
        <Mascot name={mascot} className="mx-auto h-44 sm:h-52" />
        <h1 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[32px]">{title}</h1>
        <p className="mt-2 mb-8 text-ink-2">{subtitle}</p>
      </div>
      <ol className="rounded-[28px] bg-white px-6 py-3 shadow-soft" aria-live="polite">
        {steps.map((s, i) => {
          const done = i < step, cur = i === step;
          return (
            <li key={s} className={`flex items-center gap-3.5 border-b border-[#f4f1fa] py-4 text-[15px] last:border-0 ${cur ? "font-bold" : "font-medium"} ${done || cur ? "text-ink" : "text-[#8a8fa5]"}`}>
              <span className={`grid size-6.5 place-items-center rounded-full text-[13px] font-bold ${done ? "bg-koda text-white" : cur ? "bg-koda-soft text-koda animate-pulse" : "bg-[#f4f1fa] text-koda"}`}>
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
