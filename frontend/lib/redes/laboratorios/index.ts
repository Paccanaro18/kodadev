import { AULA_PRIMEIRO_CABO, AULA_ROTEADOR, AULA_SWITCH } from "./aulas";
import { DESAFIO_MASCARA, DESAFIO_ROTA, DESAFIO_VLAN } from "./desafios";
import type { Laboratorio } from "./tipos";

export type { Laboratorio, Objetivo, ResultadoDoObjetivo } from "./tipos";
export { avaliarObjetivos, tudoCumprido } from "./avaliar";

export const TRILHA_DE_REDES = "redes";

export const AULAS_DE_REDES: Laboratorio[] = [AULA_PRIMEIRO_CABO, AULA_SWITCH, AULA_ROTEADOR];
export const DESAFIOS_DE_REDES: Laboratorio[] = [DESAFIO_MASCARA, DESAFIO_VLAN, DESAFIO_ROTA];
export const LABORATORIOS: Laboratorio[] = [...AULAS_DE_REDES, ...DESAFIOS_DE_REDES];

export function laboratorioPorSlug(slug: string): Laboratorio | undefined {
  return LABORATORIOS.find((l) => l.slug === slug);
}
