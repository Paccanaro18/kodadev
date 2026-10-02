import { infoDaLinguagem } from "@/lib/linguagem";
import { iconeDaLinguagem } from "@/lib/tecnologias";
import IconeDeTecnologia from "./IconeDeTecnologia";

type Props = {
  linguagem: string | null | undefined;
  tamanho?: "pequeno" | "medio";
};

/** Mostra a linguagem do projeto, com o logo. Sem linguagem conhecida, não mostra nada. */
export default function SeloDeLinguagem({ linguagem, tamanho = "pequeno" }: Props) {
  const info = infoDaLinguagem(linguagem);
  if (!info) return null;

  const icone = iconeDaLinguagem(linguagem);
  const medidas = tamanho === "medio" ? "gap-2 px-3 py-1 text-[13px]" : "gap-1.5 px-2 py-0.5 text-[11px]";
  return (
    <span
      title={`Linguagem do projeto: ${info.rotulo}`}
      className={`inline-flex items-center rounded-full border border-line-2 bg-surface font-semibold text-ink ${medidas}`}
    >
      {icone && <IconeDeTecnologia icone={icone} tamanho={tamanho} />}
      {info.rotulo}
    </span>
  );
}
