import Link from "next/link";

export default function AvisoDeLimite({ mensagem, noLimite, gerenciarRepositorios = false, className = "" }: { mensagem: string; noLimite: boolean; gerenciarRepositorios?: boolean; className?: string }) {
  return (
    <div role="alert" className={`rounded-[22px] bg-bad-soft px-6 py-4 text-sm text-bad ${className}`}>
      <p>{mensagem}</p>
      {noLimite && (
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
          {gerenciarRepositorios && <Link href="/dashboard" className="font-bold underline underline-offset-2">Arquivar um repositório conectado</Link>}
          <Link href="/planos" className="font-bold underline underline-offset-2">Ver os planos e o seu uso</Link>
        </div>
      )}
    </div>
  );
}
