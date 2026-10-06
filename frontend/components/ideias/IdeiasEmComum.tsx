import type { Evidencia, NivelDeProjeto } from "@/lib/ideias";

export const ESTILO_DO_NIVEL: Record<NivelDeProjeto, string> = {
  Iniciante: "bg-ok-soft text-ok",
  Júnior: "bg-koda-soft text-koda-texto",
  Intermediário: "bg-warn-soft text-warn",
  Avançado: "bg-bad-soft text-bad",
};

const FORCA: Record<Evidencia["forca"], { rotulo: string; estilo: string }> = {
  pesquisa: { rotulo: "Pesquisa com método", estilo: "bg-ok-soft text-ok" },
  relatorio: { rotulo: "Relatório do setor", estilo: "bg-koda-soft text-koda-texto" },
  orientacao: { rotulo: "Orientação ou opinião", estilo: "bg-warn-soft text-warn" },
};

export function SeloDeNivel({ nivel }: { nivel: NivelDeProjeto }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${ESTILO_DO_NIVEL[nivel]}`}>{nivel}</span>;
}

export function CartaoDeEvidencia({ evidencia }: { evidencia: Evidencia }) {
  const forca = FORCA[evidencia.forca];
  return (
    <li className="rounded-2xl border border-line p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${forca.estilo}`}>{forca.rotulo}</span>
        <span className="text-xs font-semibold text-ink-2">{evidencia.fonte} · {evidencia.ano}</span>
      </div>
      <h3 className="mt-2 text-[15px] leading-snug font-bold">
        <a href={evidencia.url} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-koda-texto">{evidencia.titulo}</a>
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-body">{evidencia.achado}</p>
    </li>
  );
}
