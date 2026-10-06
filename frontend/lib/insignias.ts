import type { ResumoDeSeguranca } from "@/lib/api";
import { CATEGORIAS } from "@/lib/seguranca";
import type { ResumoDeTrilha } from "@/lib/trilhas";
import { checkpointAprovado, percentualConcluido, progressoDa, type EstadoDeEstudo, type ItemParaProgresso } from "@/lib/progressoDeEstudo";

const TRILHA_DE_REDES = "redes";
const TRILHA_DE_IDEIAS = "ideias";

export type CategoriaDeInsignia = "estudo" | "redes" | "seguranca" | "tickets" | "projetos";
export type NivelDeInsignia = "bronze" | "prata" | "ouro";
export type IconeDeInsignia = "livro" | "estrela" | "trofeu" | "rede" | "escudo" | "bandeira" | "alvo" | "chave" | "diploma" | "raio" | "mapa";

export type Insignia = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaDeInsignia;
  nivel: NivelDeInsignia;
  icone: IconeDeInsignia;
  atual: number;
  total: number;
  conquistada: boolean;
};

/** O que existe para ser conquistado. Vem do servidor, para o navegador não carregar o conteúdo das lições. */
export type CatalogoDeInsignias = {
  trilhas: ResumoDeTrilha[];
  laboratoriosDeRedes: { aulas: string[]; desafios: string[] };
  ideias: { slug: string; nivel: string }[];
};

export type EntradaDeInsignias = {
  catalogo: CatalogoDeInsignias;
  estudo: EstadoDeEstudo;
  seguranca: ResumoDeSeguranca[] | null;
  ticketsConcluidos: number | null;
};

export const CATEGORIAS_DE_INSIGNIA: { valor: CategoriaDeInsignia; rotulo: string }[] = [
  { valor: "estudo", rotulo: "Estudo" },
  { valor: "redes", rotulo: "Redes" },
  { valor: "seguranca", rotulo: "Segurança" },
  { valor: "tickets", rotulo: "Tickets" },
  { valor: "projetos", rotulo: "Projetos" },
];

function marco(
  id: string, categoria: CategoriaDeInsignia, nivel: NivelDeInsignia, icone: IconeDeInsignia,
  titulo: string, descricao: string, atual: number, total: number,
): Insignia {
  const limitado = Math.max(0, Math.min(atual, total));
  return { id, titulo, descricao, categoria, nivel, icone, atual: limitado, total, conquistada: limitado >= total };
}

function insigniasDeEstudo(estudo: EstadoDeEstudo, trilhas: ResumoDeTrilha[]): Insignia[] {
  let licoes = 0;
  let notaMaxima = 0;
  let trilhasIniciadas = 0;
  let checkpoints = 0;
  const porTrilha: Insignia[] = [];

  for (const trilha of trilhas) {
    const progresso = progressoDa(estudo, trilha.slug);
    const todos = trilha.etapas.flatMap((etapa) => etapa.itens);
    const modulos = todos.filter((item) => item.tipo === "modulo").map((m) => m.slug);
    const lidas = progresso.licoes.filter((slug) => modulos.includes(slug)).length;
    licoes += lidas;
    if (lidas > 0) trilhasIniciadas++;
    notaMaxima += todos.filter((item) => progresso.notas[item.slug] === 1).length;
    checkpoints += todos.filter((c) => c.tipo === "checkpoint" && checkpointAprovado(progresso, c.slug, c.notaMinima ?? 0)).length;

    const itens: ItemParaProgresso[] = todos.map((item) => ({ tipo: item.tipo, slug: item.slug, notaMinima: item.notaMinima }));
    const percentual = percentualConcluido(progresso, itens);
    porTrilha.push(marco(`trilha-${trilha.slug}`, "estudo", "ouro", "diploma", `Trilha completa: ${trilha.titulo}`,
      `Conclua todos os módulos e checkpoints da trilha ${trilha.titulo}.`, percentual, 100));
  }

  return [
    marco("primeira-licao", "estudo", "bronze", "livro", "Primeira lição", "Marque a sua primeira lição como lida.", licoes, 1),
    marco("dez-licoes", "estudo", "prata", "livro", "Leitor dedicado", "Leia 10 lições nas trilhas.", licoes, 10),
    marco("vinte-e-cinco-licoes", "estudo", "ouro", "livro", "Estudioso incansável", "Leia 25 lições nas trilhas.", licoes, 25),
    marco("nota-maxima", "estudo", "prata", "estrela", "Nota máxima", "Acerte todas as questões de um teste.", notaMaxima, 1),
    marco("checkpoint-aprovado", "estudo", "prata", "bandeira", "Checkpoint aprovado", "Seja aprovado em um checkpoint de trilha.", checkpoints, 1),
    marco("tres-trilhas", "estudo", "prata", "mapa", "Explorador", "Comece três trilhas diferentes.", trilhasIniciadas, 3),
    ...porTrilha,
  ];
}

function insigniasDeRedes(estudo: EstadoDeEstudo, laboratorios: CatalogoDeInsignias["laboratoriosDeRedes"]): Insignia[] {
  const feitos = new Set(progressoDa(estudo, TRILHA_DE_REDES).desafios);
  const quantos = (slugs: string[]) => slugs.filter((slug) => feitos.has(slug)).length;
  const todosOsLaboratorios = [...laboratorios.aulas, ...laboratorios.desafios];
  const todos = quantos(todosOsLaboratorios);
  return [
    marco("redes-primeiro-cabo", "redes", "bronze", "rede", "Primeiro cabo", "Conclua o laboratório Seu primeiro cabo.", feitos.has("primeiro-cabo") ? 1 : 0, 1),
    marco("redes-tres-laboratorios", "redes", "prata", "rede", "Pé na rede", "Conclua 3 laboratórios de Redes.", todos, 3),
    marco("redes-todas-as-aulas", "redes", "ouro", "diploma", "Engenheiro de redes", "Conclua todas as aulas interativas de Redes.", quantos(laboratorios.aulas), laboratorios.aulas.length),
    marco("redes-consertador", "redes", "prata", "raio", "Consertador de redes", "Resolva 3 desafios de Redes.", quantos(laboratorios.desafios), 3),
    marco("redes-todos", "redes", "ouro", "trofeu", "Rede completa", "Conclua todos os laboratórios de Redes.", todos, todosOsLaboratorios.length),
  ];
}

function insigniasDeSeguranca(desafios: ResumoDeSeguranca[] | null): Insignia[] {
  const lista = desafios ?? [];
  const resolvidos = lista.filter((d) => d.resolvido);
  const pontos = resolvidos.reduce((soma, d) => soma + d.pontos, 0);
  const porCategoria = CATEGORIAS.map(({ valor, rotulo }) => {
    const daCategoria = lista.filter((d) => d.categoria === valor);
    return marco(`seguranca-${valor.toLowerCase()}`, "seguranca", "prata", "chave", `Especialista em ${rotulo.toLowerCase()}`,
      `Resolva todos os desafios de ${rotulo.toLowerCase()}.`, daCategoria.filter((d) => d.resolvido).length, Math.max(daCategoria.length, 1));
  });
  return [
    marco("seguranca-primeira-flag", "seguranca", "bronze", "bandeira", "Primeira flag", "Resolva o seu primeiro desafio de segurança.", resolvidos.length, 1),
    marco("seguranca-cinco-flags", "seguranca", "prata", "escudo", "Caçador de falhas", "Resolva 5 desafios de segurança.", resolvidos.length, 5),
    marco("seguranca-mil-pontos", "seguranca", "prata", "alvo", "Mil pontos", "Some 1000 pontos nos desafios de segurança.", pontos, 1000),
    ...porCategoria,
    marco("seguranca-todos", "seguranca", "ouro", "trofeu", "Lenda do CTF", "Resolva todos os desafios de segurança.", resolvidos.length, Math.max(lista.length, 1)),
  ];
}

function insigniasDeProjetos(estudo: EstadoDeEstudo, ideias: CatalogoDeInsignias["ideias"]): Insignia[] {
  const feitos = new Set(progressoDa(estudo, TRILHA_DE_IDEIAS).desafios);
  const concluidas = ideias.filter((i) => feitos.has(i.slug));
  const niveisDistintos = new Set(concluidas.map((i) => i.nivel)).size;
  return [
    marco("projetos-primeiro", "projetos", "bronze", "bandeira", "Mãos à obra", "Conclua o seu primeiro projeto das ideias.", concluidas.length, 1),
    marco("projetos-tres", "projetos", "prata", "mapa", "Portfólio de verdade", "Conclua 3 projetos das ideias.", concluidas.length, 3),
    marco("projetos-niveis", "projetos", "prata", "raio", "Subindo de nível", "Conclua projetos em 3 níveis diferentes.", niveisDistintos, 3),
    marco("projetos-avancado", "projetos", "ouro", "trofeu", "Nível avançado", "Conclua um projeto de nível avançado.", concluidas.filter((i) => i.nivel === "Avançado").length, 1),
  ];
}

function insigniasDeTickets(concluidos: number | null): Insignia[] {
  const feitos = concluidos ?? 0;
  return [
    marco("tickets-primeiro", "tickets", "bronze", "bandeira", "Primeiro ticket", "Conclua o seu primeiro ticket gerado pelo Koda.", feitos, 1),
    marco("tickets-cinco", "tickets", "prata", "alvo", "Mão na massa", "Conclua 5 tickets.", feitos, 5),
    marco("tickets-vinte", "tickets", "ouro", "trofeu", "Dev de verdade", "Conclua 20 tickets.", feitos, 20),
  ];
}

export function calcularInsignias(entrada: EntradaDeInsignias): Insignia[] {
  return [
    ...insigniasDeEstudo(entrada.estudo, entrada.catalogo.trilhas),
    ...insigniasDeRedes(entrada.estudo, entrada.catalogo.laboratoriosDeRedes),
    ...insigniasDeSeguranca(entrada.seguranca),
    ...insigniasDeTickets(entrada.ticketsConcluidos),
    ...insigniasDeProjetos(entrada.estudo, entrada.catalogo.ideias),
  ];
}

export function resumirInsignias(insignias: Insignia[]): { conquistadas: number; total: number; porNivel: Record<NivelDeInsignia, number> } {
  const conquistadas = insignias.filter((i) => i.conquistada);
  const porNivel: Record<NivelDeInsignia, number> = { bronze: 0, prata: 0, ouro: 0 };
  for (const i of conquistadas) porNivel[i.nivel]++;
  return { conquistadas: conquistadas.length, total: insignias.length, porNivel };
}

export function proximasInsignias(insignias: Insignia[], quantas = 3): Insignia[] {
  return insignias
    .filter((i) => !i.conquistada && i.atual > 0)
    .sort((a, b) => b.atual / b.total - a.atual / a.total)
    .slice(0, quantas);
}
