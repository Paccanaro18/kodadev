import Link from "next/link";
import AppShell from "./AppShell";
import { btnPrimary, Mascot } from "./ui";

/** Tela de uma área do menu que ainda não existe. Diz a verdade sobre o que vem e quando. */
export default function EmBreve({ titulo, texto, mascot = "pensando" }: { titulo: string; texto: string; mascot?: string }) {
  return (
    <AppShell width="max-w-[560px]">
      <div className="text-center">
        <Mascot name={mascot} className="mx-auto h-44 sm:h-52" />
        <span className="mt-2 inline-block rounded-full bg-koda-soft px-3.5 py-1 text-xs font-bold tracking-wide text-koda-texto uppercase">Em breve</span>
        <h1 className="mt-3 text-[28px] font-bold tracking-tight sm:text-[32px]">{titulo}</h1>
        <p className="mx-auto mt-3 max-w-[440px] text-ink-2">{texto}</p>
        <Link href="/dashboard" className={btnPrimary + " mt-8 hover:text-white"}>Voltar ao início</Link>
      </div>
    </AppShell>
  );
}
