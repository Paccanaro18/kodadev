import { caminhoDoIcone } from "@/lib/tecnologias";

type Props = {
  icone: string;
  tamanho?: "pequeno" | "medio";
};

/**
 * O logo vai sobre um fundo claro fixo, porque vários são escuros (Express, Next.js, Flask, Django) e sumiriam
 * nos temas escuros. É decorativo: o nome da tecnologia sempre aparece em texto ao lado.
 */
export default function IconeDeTecnologia({ icone, tamanho = "pequeno" }: Props) {
  const medidas = tamanho === "medio" ? "size-5 p-[3px]" : "size-4 p-[2px]";
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-md bg-white ${medidas}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={caminhoDoIcone(icone)} alt="" className="size-full object-contain" />
    </span>
  );
}
