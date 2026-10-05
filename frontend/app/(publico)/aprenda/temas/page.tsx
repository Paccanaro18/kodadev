import type { Metadata } from "next";
import Link from "next/link";
import ListaDeAulas from "@/components/publico/ListaDeAulas";
import { Titulo } from "@/components/publico/PaginaPublica";

export const metadata: Metadata = {
  title: "Temas e leituras | Aprenda aqui | Koda",
  description: "Artigos para estudar Java, TypeScript e Python, segurança, testes, HTTP e como trabalhar com tickets.",
};

export default function Page() {
  return (
    <>
      <Link href="/aprenda" className="text-sm font-semibold text-koda-texto">← Aprenda aqui</Link>
      <div className="mt-6">
        <Titulo
          etiqueta="Temas e leituras"
          titulo="Artigos para estudar em qualquer ordem"
          texto="Leituras com código, para entender os conceitos que aparecem nos desafios da Koda. Para um caminho passo a passo, volte e escolha uma trilha."
        />
      </div>
      <ListaDeAulas />
    </>
  );
}
