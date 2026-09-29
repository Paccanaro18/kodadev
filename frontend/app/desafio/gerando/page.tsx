import Wait from "@/components/Wait";
import { generationSteps } from "@/lib/data";

export default function Page() {
  return <Wait mascot="prancheta" title="Gerando seu desafio" subtitle="A IA está escrevendo o ticket. Leva alguns segundos." steps={generationSteps} next="/desafio/DEV-034" />;
}
