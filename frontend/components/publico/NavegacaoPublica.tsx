"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PAGINAS_PUBLICAS } from "@/lib/contato";

export default function NavegacaoPublica() {
  const caminho = usePathname() ?? "";

  return (
    <nav aria-label="Principal" className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm font-medium">
      {PAGINAS_PUBLICAS.map(({ rotulo, href }) => {
        const ativa = caminho === href || caminho.startsWith(href + "/");
        return (
          <Link key={href} href={href} aria-current={ativa ? "page" : undefined}
            className={`rounded-xl px-3.5 py-2 transition duration-200 hover:bg-tint-2 hover:text-ink ${ativa ? "bg-koda-soft text-koda-texto" : "text-ink"}`}>
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
