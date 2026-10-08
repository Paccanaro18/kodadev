"use client";
import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import { BookOpen, ChevronDown, GitBranch, Home, Settings, Sparkles, Users } from "lucide-react";
import { CHAVE_DO_MENU, grupoAtivo, itemAtivo, lerGruposAbertos, MENU, type IconeDoMenu } from "@/lib/menu";

const ICONES: Record<IconeDoMenu, ComponentType<{ className?: string }>> = {
  home: Home, desafios: GitBranch, aprender: BookOpen, comunidade: Users, planos: Sparkles, configuracoes: Settings,
};

function lerSalvos(): string[] {
  try {
    return lerGruposAbertos(window.localStorage.getItem(CHAVE_DO_MENU));
  } catch {
    return [];
  }
}

export default function MenuLateral({ caminho, aoNavegar }: { caminho: string; aoNavegar: () => void }) {
  const [abertos, setAbertos] = useState<string[]>(() => {
    const salvos = lerSalvos();
    const doCaminho = grupoAtivo(caminho);
    return doCaminho && !salvos.includes(doCaminho) ? [...salvos, doCaminho] : salvos;
  });
  const ativo = itemAtivo(caminho);
  const grupoDoCaminho = grupoAtivo(caminho);

  useEffect(() => {
    if (grupoDoCaminho) setAbertos((atuais) => (atuais.includes(grupoDoCaminho) ? atuais : [...atuais, grupoDoCaminho]));
  }, [grupoDoCaminho]);

  function alternar(id: string) {
    setAbertos((atuais) => {
      const novos = atuais.includes(id) ? atuais.filter((g) => g !== id) : [...atuais, id];
      try {
        window.localStorage.setItem(CHAVE_DO_MENU, JSON.stringify(novos));
      } catch {
        // Sem armazenamento disponível: o menu só não lembra o que estava aberto.
      }
      return novos;
    });
  }

  const base = "group flex items-center gap-3.5 rounded-2xl px-4 py-3 text-[15px] font-medium transition duration-200 ease-out";

  return (
    <nav aria-label="Menu principal" className="grid gap-1.5">
      {MENU.map((entrada) => {
        const Icone = ICONES[entrada.icone];
        if (entrada.tipo === "link") {
          const marcado = ativo === entrada.item;
          return (
            <Link key={entrada.item.rotulo} href={entrada.item.href} onClick={aoNavegar} aria-current={marcado ? "page" : undefined}
              className={`${base} hover:translate-x-1 ${marcado ? "bg-koda-soft text-koda-texto" : "text-ink hover:bg-tint-2 hover:text-ink"}`}>
              <Icone className={`size-5.5 transition-transform duration-200 group-hover:scale-110 ${marcado ? "text-koda-texto" : "text-body group-hover:text-koda-texto"}`} />{entrada.item.rotulo}
            </Link>
          );
        }

        const aberto = abertos.includes(entrada.id);
        const contemAtivo = grupoDoCaminho === entrada.id;
        return (
          <div key={entrada.id}>
            <button type="button" aria-expanded={aberto} aria-controls={`submenu-${entrada.id}`} onClick={() => alternar(entrada.id)}
              className={`${base} w-full text-left ${contemAtivo && !aberto ? "bg-koda-soft text-koda-texto" : "text-ink hover:bg-tint-2 hover:text-ink"}`}>
              <Icone className={`size-5.5 transition-transform duration-200 group-hover:scale-110 ${contemAtivo ? "text-koda-texto" : "text-body group-hover:text-koda-texto"}`} />
              <span className="flex-1">{entrada.rotulo}</span>
              <ChevronDown className={`size-4 text-body transition-transform duration-200 ${aberto ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            <div id={`submenu-${entrada.id}`} className={`grid transition-[grid-template-rows] duration-200 ease-out ${aberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <ul className="overflow-hidden" inert={!aberto}>
                {entrada.itens.map((item) => {
                  const marcado = ativo === item;
                  return (
                    <li key={item.rotulo}>
                      <Link href={item.href} onClick={aoNavegar} aria-current={marcado ? "page" : undefined}
                        className={`mt-1 ml-5 flex items-center gap-3 rounded-xl border-l-2 py-2.5 pr-3 pl-4 text-[14px] font-medium transition duration-200 hover:translate-x-1 ${marcado ? "border-koda bg-koda-soft text-koda-texto" : "border-line text-body hover:bg-tint-2 hover:text-ink"}`}>
                        {item.rotulo}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
