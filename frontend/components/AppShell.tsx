"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BarChart3, Bell, Folder, GitBranch, Home, LogOut, Menu, Plus, Search, Settings, Users, X } from "lucide-react";
import { Logo, Mascot } from "./ui";
import { sair } from "@/lib/api";
import { SessaoContext } from "@/lib/SessaoContext";
import { useSessao } from "@/lib/useSessao";

const nav = [
  { label: "Home", href: "/dashboard", icon: Home, match: ["/dashboard"] },
  { label: "Desafios", href: "/projeto", icon: GitBranch, match: ["/projeto", "/desafio"] },
  { label: "Repositórios", href: "/repositorios/adicionar", icon: Folder, match: ["/repositorios", "/analisando"] },
  { label: "Progresso", href: "#", icon: BarChart3, match: [] },
  { label: "Comunidade", href: "#", icon: Users, match: [] },
  { label: "Configurações", href: "#", icon: Settings, match: [] },
];

export default function AppShell({ children, width = "max-w-[1360px]" }: { children: ReactNode; width?: string }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { perfil, carregando, falhou } = useSessao();

  async function aoSair() {
    try {
      await sair();
      router.replace("/");
    } catch {
      window.alert("Não foi possível sair agora. Tente novamente.");
    }
  }

  if (falhou) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <Mascot name="duvida" className="mx-auto h-28" />
          <p className="mt-4 font-bold">Não conseguimos falar com o servidor.</p>
          <p className="mt-1 text-sm text-ink-2">Confira se o back-end está rodando e tente de novo.</p>
          <button onClick={() => window.location.reload()} className="mt-5 h-11 rounded-2xl bg-koda px-6 text-sm font-bold text-white hover:bg-koda-dark">Tentar de novo</button>
        </div>
      </div>
    );
  }

  if (carregando || !perfil) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-center">
          <Mascot name="pensando" className="mx-auto h-28 animate-pulse" />
          <p className="mt-3 text-sm text-ink-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <SessaoContext.Provider value={perfil}>
    <div className="min-h-screen lg:pl-58">
      {open && <div className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-58 flex-col border-r border-[#f0edf7] bg-white px-4 py-5 transition-transform lg:translate-x-0 ${open ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}>
        <div className="mb-6 flex items-center justify-between pl-2">
          <Logo className="h-11" />
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu"><X className="size-5" /></button>
        </div>
        <nav className="grid gap-1.5">
          {nav.map(({ label, href, icon: Icon, match }) => {
            const active = match.some((m) => path.startsWith(m));
            return (
              <Link key={label} href={href} onClick={() => setOpen(false)}
                className={`group flex items-center gap-3.5 rounded-2xl px-4 py-3 text-[15px] font-medium transition duration-200 ease-out hover:translate-x-1 ${active ? "bg-koda-soft text-koda" : "text-ink hover:bg-[#f3f1ff] hover:text-ink"}`}>
                <Icon className={`size-5.5 transition-transform duration-200 group-hover:scale-110 ${active ? "text-koda" : "text-[#3b4058] group-hover:text-koda"}`} />{label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center gap-3 rounded-2xl bg-[#f8f6fc] p-3">
          <Image src={perfil.avatarUrl} alt={perfil.login} width={40} height={40} className="size-10 rounded-full" />
          <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{perfil.nome ?? perfil.login}</div><div className="truncate text-xs text-ink-2">@{perfil.login}</div></div>
          <button onClick={aoSair} aria-label="Sair" title="Sair" className="grid size-9 place-items-center rounded-xl text-[#8a8fa5] transition duration-200 hover:bg-white hover:text-koda active:scale-95"><LogOut className="size-4.5" /></button>
        </div>
      </aside>

      <div className="sticky top-0 z-20 flex items-center gap-3 bg-cream/90 px-4 py-3.5 backdrop-blur sm:px-6">
        <button className="grid size-11 place-items-center rounded-[14px] border border-[#efecf7] bg-white transition duration-200 hover:scale-105 active:scale-95 lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu className="size-5" /></button>
        <label className="flex h-12 max-w-[620px] min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#efecf7] bg-white px-5 focus-within:border-koda">
          <Search className="size-5 shrink-0 text-ink-2" />
          <input placeholder="Buscar desafios, repositórios ou conteúdos..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8a8fa5]" />
        </label>
        <div className="flex-1" />
        <button className="relative grid size-11 place-items-center rounded-[14px] border border-[#efecf7] bg-white transition duration-200 hover:scale-110 hover:-rotate-6 hover:bg-[#f3f1ff] active:scale-95" aria-label="Notificações">
          <Bell className="size-5" /><i className="absolute top-2.5 right-3 size-2 rounded-full bg-[#ff5a6a]" />
        </button>
        <Link href="/repositorios/adicionar" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-koda px-4 text-[15px] font-semibold whitespace-nowrap text-white shadow-[0_8px_20px_rgb(102_92_255/0.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-koda-dark hover:text-white hover:shadow-[0_12px_28px_rgb(102_92_255/0.4)] active:scale-[.97] sm:px-6">
          <Plus className="size-4.5" /><span className="hidden sm:inline">Novo repositório</span>
        </Link>
      </div>

      <main className={`mx-auto ${width} px-4 pt-2 pb-10 sm:px-6`}>{children}</main>
    </div>
    </SessaoContext.Provider>
  );
}
