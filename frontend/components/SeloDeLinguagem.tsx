import { infoDaLinguagem } from "@/lib/linguagem";

type Props = {
  linguagem: string | null | undefined;
  tamanho?: "pequeno" | "medio";
};

/** Mostra a linguagem do projeto. Sem linguagem conhecida, não mostra nada. */
export default function SeloDeLinguagem({ linguagem, tamanho = "pequeno" }: Props) {
  const info = infoDaLinguagem(linguagem);
  if (!info) return null;

  const medidas = tamanho === "medio" ? "px-3 py-1 text-[13px]" : "px-2.5 py-0.5 text-[11px]";
  return (
    <span
      title={`Linguagem do projeto: ${info.rotulo}`}
      className={`inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-surface font-semibold text-ink ${medidas}`}
    >
      <i aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ backgroundColor: info.cor }} />
      {info.rotulo}
    </span>
  );
}
