import type { Metadata } from "next";
import ListaDeAulas from "@/components/publico/ListaDeAulas";
import { Titulo } from "@/components/publico/PaginaPublica";

export const metadata: Metadata = {
  title: "Aprenda aqui | Koda",
  description: "Artigos para estudar Java, TypeScript e Python, testes, HTTP e como trabalhar com tickets.",
};

export default function Page() {
  return (
    <>
      <Titulo
        etiqueta="Aprenda aqui"
        titulo="Estude com exemplos de verdade"
        texto="Artigos curtos, com código, para você entender os conceitos que aparecem nos desafios da Koda. Escolha uma trilha e leia no seu ritmo."
      />
      <ListaDeAulas />
    </>
  );
}
