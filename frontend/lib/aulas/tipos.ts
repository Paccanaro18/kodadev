export type Trilha = "java" | "typescript" | "python" | "seguranca" | "carreira";

export type Bloco =
  | { tipo: "p"; texto: string }
  | { tipo: "h"; texto: string }
  | { tipo: "h3"; texto: string }
  | { tipo: "lista"; itens: string[] }
  | { tipo: "numerada"; itens: string[] }
  | { tipo: "codigo"; linguagem: string; texto: string; legenda?: string }
  | { tipo: "dica"; titulo: string; texto: string }
  | { tipo: "alerta"; titulo: string; texto: string }
  | { tipo: "tabela"; cabecalho: string[]; linhas: string[][]; legenda?: string };

export type Referencia = { titulo: string; url: string };

export type Aula = {
  slug: string;
  titulo: string;
  resumo: string;
  trilha: Trilha;
  nivel: "Iniciante" | "Júnior" | "Intermediário";
  leitura: string;
  /** O que a pessoa precisa saber antes de ler. */
  preRequisitos?: string[];
  /** O essencial do artigo em poucas linhas, mostrado logo no começo. */
  pontosChave?: string[];
  blocos: Bloco[];
  /** Tarefas para fazer sozinha depois de ler, de preferência no próprio projeto. */
  exercicios?: string[];
  /** Fontes oficiais para se aprofundar. */
  referencias?: Referencia[];
};
