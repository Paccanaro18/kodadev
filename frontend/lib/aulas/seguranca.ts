import { AULA_AUTENTICACAO } from "./seguranca-autenticacao";
import { AULA_INJECAO } from "./seguranca-injecao";
import { AULA_NAVEGADOR } from "./seguranca-navegador";
import { AULA_OWASP } from "./seguranca-owasp";
import { AULA_SEGREDOS } from "./seguranca-segredos";
import type { Aula } from "./tipos";

/** Trilha de segurança, na ordem sugerida de leitura: do panorama aos detalhes. */
export const AULAS_DE_SEGURANCA: Aula[] = [AULA_OWASP, AULA_INJECAO, AULA_AUTENTICACAO, AULA_NAVEGADOR, AULA_SEGREDOS];
