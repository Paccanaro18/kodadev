import { PROJETOS_AVANCADOS } from "./projetos-avancados";
import { PROJETOS_INICIANTE_E_JUNIOR } from "./projetos-iniciais";
import { PROJETOS_INTERMEDIARIOS } from "./projetos-intermediarios";
import { NIVEIS_DE_PROJETO, type AreaDeProjeto, type IdeiaDeProjeto, type NivelDeProjeto } from "./tipos";

export { EVIDENCIAS, evidenciaPorId } from "./evidencias";
export { NIVEIS_DE_PROJETO, ROTULO_DA_AREA } from "./tipos";
export type { AreaDeProjeto, Evidencia, IdeiaDeProjeto, NivelDeProjeto } from "./tipos";

export const TRILHA_DE_IDEIAS = "ideias";

export const IDEIAS: IdeiaDeProjeto[] = [...PROJETOS_INICIANTE_E_JUNIOR, ...PROJETOS_INTERMEDIARIOS, ...PROJETOS_AVANCADOS]
  .sort((a, b) => NIVEIS_DE_PROJETO.indexOf(a.nivel) - NIVEIS_DE_PROJETO.indexOf(b.nivel));

export function ideiaPorSlug(slug: string): IdeiaDeProjeto | undefined {
  return IDEIAS.find((ideia) => ideia.slug === slug);
}

export function filtrarIdeias(filtros: { nivel: NivelDeProjeto | null; area: AreaDeProjeto | null }): IdeiaDeProjeto[] {
  return IDEIAS.filter((ideia) => (filtros.nivel === null || ideia.nivel === filtros.nivel) && (filtros.area === null || ideia.area === filtros.area));
}
