import Link from "next/link";

export default function AvisoDeLimite({ mensagem, noLimite, className = "" }: { mensagem: string; noLimite: boolean; className?: string }) {
  return (
    <div role="alert" className={`rounded-[22px] bg-bad-soft px-6 py-4 text-sm text-bad ${className}`}>
      <p>{mensagem}</p>
      {noLimite && (
        <Link href="/planos" className="mt-2 inline-block font-bold underline underline-offset-2">Ver os planos e o seu uso</Link>
      )}
    </div>
  );
}
