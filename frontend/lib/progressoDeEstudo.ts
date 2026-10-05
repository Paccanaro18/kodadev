/**
 * O progresso de estudo fica no navegador (localStorage), o que serve também para quem ainda não entrou, e é guardado
 * no perfil de quem está logado. As funções aqui são puras (recebem e devolvem o estado) para serem fáceis de testar.
 */

export const CHAVE_DO_ESTUDO = "koda-estudo-v1";
export const NOTA_MINIMA_DO_TESTE = 0.6;

export type ProgressoDaTrilha = {
  /** Slugs dos módulos cuja lição foi marcada como lida. */
  licoes: string[];
  /** Melhor nota (0 a 1) de cada teste de módulo ou checkpoint, pelo slug. */
  notas: Record<string, number>;
  /** Slugs dos módulos cujo desafio foi declarado como concluído. */
  desafios: string[];
};

export type EstadoDeEstudo = Record<string, ProgressoDaTrilha>;

export const ESTADO_VAZIO: EstadoDeEstudo = {};

const PROGRESSO_VAZIO: ProgressoDaTrilha = { licoes: [], notas: {}, desafios: [] };

export function progressoDa(estado: EstadoDeEstudo, trilha: string): ProgressoDaTrilha {
  return estado[trilha] ?? PROGRESSO_VAZIO;
}

function atualizar(estado: EstadoDeEstudo, trilha: string, mudar: (atual: ProgressoDaTrilha) => ProgressoDaTrilha): EstadoDeEstudo {
  return { ...estado, [trilha]: mudar(progressoDa(estado, trilha)) };
}

function comOuSem(lista: string[], slug: string, presente: boolean): string[] {
  const semSlug = lista.filter((item) => item !== slug);
  return presente ? [...semSlug, slug] : semSlug;
}

export function marcarLicao(estado: EstadoDeEstudo, trilha: string, modulo: string, lida: boolean): EstadoDeEstudo {
  return atualizar(estado, trilha, (atual) => ({ ...atual, licoes: comOuSem(atual.licoes, modulo, lida) }));
}

export function marcarDesafio(estado: EstadoDeEstudo, trilha: string, modulo: string, concluido: boolean): EstadoDeEstudo {
  return atualizar(estado, trilha, (atual) => ({ ...atual, desafios: comOuSem(atual.desafios, modulo, concluido) }));
}

/** Guarda a nota só se for a melhor até agora: refazer um teste nunca piora o resultado. */
export function registrarNota(estado: EstadoDeEstudo, trilha: string, item: string, nota: number): EstadoDeEstudo {
  const valida = Math.min(1, Math.max(0, nota));
  return atualizar(estado, trilha, (atual) => ({
    ...atual,
    notas: { ...atual.notas, [item]: Math.max(valida, atual.notas[item] ?? 0) },
  }));
}

export function moduloConcluido(progresso: ProgressoDaTrilha, modulo: string): boolean {
  return progresso.licoes.includes(modulo) && (progresso.notas[modulo] ?? 0) >= NOTA_MINIMA_DO_TESTE;
}

export function checkpointAprovado(progresso: ProgressoDaTrilha, checkpoint: string, notaMinima: number): boolean {
  return (progresso.notas[checkpoint] ?? -1) >= notaMinima;
}

export type ItemParaProgresso = { tipo: "modulo" | "checkpoint"; slug: string; notaMinima?: number };

export function itemConcluido(progresso: ProgressoDaTrilha, item: ItemParaProgresso): boolean {
  return item.tipo === "modulo"
    ? moduloConcluido(progresso, item.slug)
    : checkpointAprovado(progresso, item.slug, item.notaMinima ?? NOTA_MINIMA_DO_TESTE);
}

export function percentualConcluido(progresso: ProgressoDaTrilha, itens: ItemParaProgresso[]): number {
  if (itens.length === 0) return 0;
  const feitos = itens.filter((item) => itemConcluido(progresso, item)).length;
  return Math.round((feitos / itens.length) * 100);
}

/** O primeiro item que ainda não foi concluído, para o botão "Continuar". Sem pendência, devolve nada. */
export function proximoPendente(progresso: ProgressoDaTrilha, itens: ItemParaProgresso[]): ItemParaProgresso | null {
  return itens.find((item) => !itemConcluido(progresso, item)) ?? null;
}

export function lerEstado(armazenamento: Pick<Storage, "getItem"> | null): EstadoDeEstudo {
  try {
    const texto = armazenamento?.getItem(CHAVE_DO_ESTUDO);
    if (!texto) return ESTADO_VAZIO;
    return sanear(JSON.parse(texto));
  } catch {
    return ESTADO_VAZIO;
  }
}

export function gravarEstado(armazenamento: Pick<Storage, "setItem"> | null, estado: EstadoDeEstudo): boolean {
  try {
    armazenamento?.setItem(CHAVE_DO_ESTUDO, JSON.stringify(estado));
    return armazenamento !== null;
  } catch {
    return false;
  }
}

/** O que está no navegador pode ter sido editado ou ser de uma versão antiga: só entra o que tem o formato esperado. */
export function sanear(valor: unknown): EstadoDeEstudo {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) return ESTADO_VAZIO;

  const estado: EstadoDeEstudo = {};
  for (const [trilha, bruto] of Object.entries(valor)) {
    if (typeof bruto !== "object" || bruto === null) continue;
    const { licoes, notas, desafios } = bruto as Record<string, unknown>;
    estado[trilha] = {
      licoes: textos(licoes),
      desafios: textos(desafios),
      notas: numeros(notas),
    };
  }
  return estado;
}

function textos(valor: unknown): string[] {
  return Array.isArray(valor) ? valor.filter((item): item is string => typeof item === "string") : [];
}

function numeros(valor: unknown): Record<string, number> {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) return {};
  return Object.fromEntries(
    Object.entries(valor).filter((par): par is [string, number] => typeof par[1] === "number" && Number.isFinite(par[1]))
      .map(([chave, nota]) => [chave, Math.min(1, Math.max(0, nota))]),
  );
}

function uniao(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])].sort();
}

/** Junta dois estados: lições e desafios de qualquer um dos dois valem, e de cada nota fica a melhor. */
export function juntarEstados(a: EstadoDeEstudo, b: EstadoDeEstudo): EstadoDeEstudo {
  const resultado: EstadoDeEstudo = {};
  for (const trilha of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = progressoDa(a, trilha);
    const y = progressoDa(b, trilha);
    const notas: Record<string, number> = { ...x.notas };
    for (const [item, nota] of Object.entries(y.notas)) notas[item] = Math.max(nota, notas[item] ?? 0);
    resultado[trilha] = { licoes: uniao(x.licoes, y.licoes), notas, desafios: uniao(x.desafios, y.desafios) };
  }
  return resultado;
}

function normalizado(estado: EstadoDeEstudo): string {
  const trilhas = Object.keys(estado).sort().map((trilha) => {
    const progresso = estado[trilha];
    const notas = Object.keys(progresso.notas).sort().map((item) => [item, progresso.notas[item]]);
    return [trilha, [...progresso.licoes].sort(), notas, [...progresso.desafios].sort()];
  });
  return JSON.stringify(trilhas.filter(([, licoes, notas, desafios]) => (licoes as string[]).length + (notas as unknown[]).length + (desafios as string[]).length > 0));
}

export function estadosIguais(a: EstadoDeEstudo, b: EstadoDeEstudo): boolean {
  return normalizado(a) === normalizado(b);
}
