import Link from "next/link";
import type { ReactNode } from "react";
import BotaoDeEntrada from "./BotaoDeEntrada";
import NavegacaoPublica from "./NavegacaoPublica";
import { LogoImagem, btnPrimary } from "../ui";
import { DOCUMENTOS_LEGAIS, PAGINAS_PUBLICAS } from "@/lib/contato";

/** Cabeçalho e rodapé das páginas que qualquer pessoa vê, antes de entrar. */
export default function PaginaPublica({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3.5 sm:px-8">
          <Link href="/" aria-label="Koda, página inicial" className="order-1"><LogoImagem className="h-10" /></Link>
          <div className="order-3 w-full sm:order-2 sm:w-auto"><NavegacaoPublica /></div>
          <BotaoDeEntrada className="order-2 sm:order-3" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 py-12 sm:px-8 sm:py-16">{children}</main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto grid w-full max-w-[1120px] gap-8 px-5 py-10 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-8">
          <div>
            <LogoImagem className="h-9" />
            <p className="mt-3 max-w-[300px] text-sm text-ink-2">Desafios reais, no seu código. Feito para quem está crescendo como desenvolvedor.</p>
          </div>
          <FooterLista titulo="Conheça" itens={PAGINAS_PUBLICAS} />
          <FooterLista titulo="Legal" itens={DOCUMENTOS_LEGAIS} />
        </div>
        <div className="border-t border-line px-5 py-4 text-center text-xs text-ink-2 sm:px-8">© 2026 Koda. Todos os direitos reservados.</div>
      </footer>
    </div>
  );
}

function FooterLista({ titulo, itens }: { titulo: string; itens: readonly { rotulo: string; href: string }[] }) {
  return (
    <div>
      <div className="mb-3 text-xs font-bold tracking-[0.12em] text-ink-2/70 uppercase">{titulo}</div>
      <ul className="grid gap-2 text-sm">
        {itens.map(({ rotulo, href }) => (
          <li key={href}><Link href={href} className="text-ink hover:text-koda-texto">{rotulo}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export function Titulo({ etiqueta, titulo, texto }: { etiqueta?: string; titulo: string; texto?: string }) {
  return (
    <div className="max-w-[720px]">
      {etiqueta && <div className="mb-3 text-xs font-bold tracking-[0.12em] text-koda-texto uppercase">{etiqueta}</div>}
      <h1 className="text-[32px] leading-tight font-extrabold tracking-tight sm:text-5xl">{titulo}</h1>
      {texto && <p className="mt-4 text-base leading-relaxed text-body sm:text-lg">{texto}</p>}
    </div>
  );
}

export function ChamadaParaEntrar({ titulo = "Pronto para praticar no seu código?" }: { titulo?: string }) {
  return (
    <section className="mt-16 rounded-[28px] bg-koda-soft px-6 py-10 text-center sm:px-10">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{titulo}</h2>
      <p className="mx-auto mt-3 max-w-[520px] text-body">Entre com o GitHub, conecte um repositório público e receba o seu primeiro desafio.</p>
      <Link href="/" className={btnPrimary + " mt-6 hover:text-white"}>Começar com o GitHub</Link>
    </section>
  );
}
