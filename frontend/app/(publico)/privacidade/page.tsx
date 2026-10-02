import type { Metadata } from "next";
import Documento from "@/components/publico/Documento";
import { POLITICA_DE_PRIVACIDADE } from "@/lib/conteudoPublico";

export const metadata: Metadata = {
  title: "Política de Privacidade | Koda",
  description: "Quais dados a Koda coleta, como usa, com quem compartilha e quais são os seus direitos.",
};

export default function Page() {
  return (
    <Documento
      titulo="Política de Privacidade"
      introducao="Quais dados coletamos, por que e como você mantém o controle sobre eles."
      secoes={POLITICA_DE_PRIVACIDADE}
      comContato
    />
  );
}
