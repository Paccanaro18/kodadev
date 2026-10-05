import type { Bloco, Referencia } from "@/lib/aulas/tipos";

export type SlugDeTrilha = "java" | "typescript" | "python" | "aws-cloud-practitioner" | "llm-mcp-mvp";

/** Em qual seção da página inicial do Aprenda a trilha aparece. */
export type GrupoDeTrilha = "linguagem" | "certificacao" | "ia";

/** Uma pergunta de múltipla escolha, com uma única resposta certa e a explicação de cada caso. */
export type Questao = {
  enunciado: string;
  opcoes: string[];
  /** Posição, em opcoes, da resposta certa. */
  correta: number;
  /** Mostrada depois de a pessoa responder, acertando ou errando. */
  explicacao: string;
};

/** Uma tarefa para fazer no próprio computador. A conclusão é declarada pela pessoa. */
export type DesafioPratico = {
  titulo: string;
  enunciado: string;
  requisitos: string[];
  criterios: string[];
  dica?: string;
};

export type Nivel = "Iniciante" | "Júnior" | "Intermediário";

export type Modulo = {
  tipo: "modulo";
  slug: string;
  titulo: string;
  resumo: string;
  nivel: Nivel;
  leitura: string;
  /** "Ao final deste módulo você será capaz de..." */
  objetivos: string[];
  preRequisitos?: string[];
  pontosChave: string[];
  blocos: Bloco[];
  questoes: Questao[];
  desafio: DesafioPratico;
  referencias?: Referencia[];
};

/** Uma prova que reúne vários módulos. Não trava nada: serve para a pessoa saber onde está. */
export type Checkpoint = {
  tipo: "checkpoint";
  slug: string;
  titulo: string;
  resumo: string;
  /** Os slugs dos módulos cobertos. */
  cobre: string[];
  questoes: Questao[];
  /** Fração de acertos para considerar aprovado, de 0 a 1. */
  notaMinima: number;
};

export type Item = Modulo | Checkpoint;

export type Etapa = {
  titulo: string;
  descricao: string;
  itens: Item[];
};

/** Um módulo que está no roteiro, mas ainda não foi escrito. Aparece como "em breve". */
export type ModuloPlanejado = { titulo: string; resumo: string };

export type Trilha = {
  slug: SlugDeTrilha;
  grupo: GrupoDeTrilha;
  titulo: string;
  descricao: string;
  /** Para quem é a trilha e o que ela exige de quem começa. */
  publico: string;
  etapas: Etapa[];
  planejados: ModuloPlanejado[];
};

/** O suficiente para desenhar o roteiro sem levar o conteúdo dos módulos para o navegador. */
export type ResumoDeItem = {
  tipo: Item["tipo"];
  slug: string;
  titulo: string;
  resumo: string;
  detalhe: string;
  questoes: number;
  /** Só nos módulos: o nível e o tempo de leitura, como estão no módulo. */
  nivel?: Nivel;
  leitura?: string;
  /** Só nos checkpoints: a fração de acertos para ser aprovado. */
  notaMinima?: number;
};

export type ResumoDeTrilha = {
  slug: SlugDeTrilha;
  grupo: GrupoDeTrilha;
  titulo: string;
  descricao: string;
  publico: string;
  etapas: { titulo: string; descricao: string; itens: ResumoDeItem[] }[];
  planejados: ModuloPlanejado[];
};
