export type NivelDeProjeto = "Iniciante" | "Júnior" | "Intermediário" | "Avançado";

export type AreaDeProjeto = "open-source" | "backend" | "dados-ia" | "nuvem-devops" | "seguranca" | "redes" | "frontend";

/** Um achado de pesquisa ou de relatório do setor, escrito com as nossas palavras e sempre com a fonte. */
export type Evidencia = {
  id: string;
  titulo: string;
  fonte: string;
  ano: number;
  url: string;
  achado: string;
  /** Quão forte é a fonte: pesquisa com método, relatório de empresa ou orientação de mercado. */
  forca: "pesquisa" | "relatorio" | "orientacao";
};

export type LigacaoComOKoda = { rotulo: string; href: string };

export type IdeiaDeProjeto = {
  slug: string;
  titulo: string;
  gancho: string;
  nivel: NivelDeProjeto;
  area: AreaDeProjeto;
  tempo: string;
  /** Por que este projeto não é um exercício genérico: a dor real que ele resolve. */
  problema: string;
  /** O escopo mínimo que já conta como projeto concluído. */
  construir: string[];
  /** O que separa a versão comum da que chama atenção. */
  diferencial: string[];
  /** O que publicar, o material que uma pessoa de fora consegue avaliar. */
  entregaveis: string[];
  /** Ações concretas para o projeto ser encontrado e lembrado. */
  comoSerVisto: string[];
  /** O que o projeto sinaliza para quem contrata, ligado às evidências. */
  sinalNaCarreira: string;
  habilidades: string[];
  tecnologias: string[];
  evidencias: string[];
  estudarNoKoda: LigacaoComOKoda[];
  cuidado?: string;
};

export const ROTULO_DA_AREA: Record<AreaDeProjeto, string> = {
  "open-source": "Código aberto",
  backend: "Back-end",
  "dados-ia": "Dados e IA",
  "nuvem-devops": "Nuvem e DevOps",
  seguranca: "Segurança",
  redes: "Redes",
  frontend: "Front-end",
};

export const NIVEIS_DE_PROJETO: NivelDeProjeto[] = ["Iniciante", "Júnior", "Intermediário", "Avançado"];
