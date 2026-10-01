import type { StatusProgresso } from "@/lib/api";
import { estiloDoProgresso, rotuloDoProgresso } from "@/lib/desafio";

export default function SeloProgresso({ status }: { status: StatusProgresso }) {
  return (
    <span className={`rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap ${estiloDoProgresso(status)}`}>
      {rotuloDoProgresso(status)}
    </span>
  );
}
