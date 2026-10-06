import Conquistas from "@/components/conquistas/Conquistas";
import type { CatalogoDeInsignias } from "@/lib/insignias";
import { IDEIAS } from "@/lib/ideias";
import { AULAS_DE_REDES, DESAFIOS_DE_REDES } from "@/lib/redes/laboratorios";
import { resumirTrilha, TRILHAS } from "@/lib/trilhas";

export default function Page() {
  const catalogo: CatalogoDeInsignias = {
    trilhas: TRILHAS.map(resumirTrilha),
    laboratoriosDeRedes: { aulas: AULAS_DE_REDES.map((l) => l.slug), desafios: DESAFIOS_DE_REDES.map((l) => l.slug) },
    ideias: IDEIAS.map((i) => ({ slug: i.slug, nivel: i.nivel })),
  };

  return <Conquistas catalogo={catalogo} />;
}
