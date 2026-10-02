import type { Metadata } from "next";
import Documento from "@/components/publico/Documento";
import { TERMOS_DE_USO } from "@/lib/conteudoPublico";

export const metadata: Metadata = {
  title: "Termos de Uso | Koda",
  description: "As regras para usar a Koda: o que o serviço é, o que é permitido e as responsabilidades de cada lado.",
};

export default function Page() {
  return (
    <Documento
      titulo="Termos de Uso"
      introducao="As regras para usar a Koda, escritas da forma mais clara possível."
      secoes={TERMOS_DE_USO}
    />
  );
}
