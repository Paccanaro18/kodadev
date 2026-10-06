export type Perfil = {
  login: string;
  nome: string | null;
  avatarUrl: string;
};

export type Repositorio = {
  id: number;
  nome: string;
  nomeCompleto: string;
  descricao: string | null;
  linguagem: string | null;
  url: string;
  branchPadrao: string;
  atualizadoEm: string | null;
};

export type StatusAnalise = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA" | "FALHOU";

export type Tecnologia = "POSTGRESQL" | "RABBITMQ" | "REDIS";

export type Linguagem = "JAVA" | "TYPESCRIPT" | "JAVASCRIPT" | "PYTHON";

export type EndpointDetectado = {
  metodoHttp: string;
  caminho: string;
  controller: string;
};

export type ResultadoAnalise = {
  linguagem: Linguagem;
  framework: string | null;
  temCodigo: boolean;
  versaoLinguagem: string | null;
  versaoFramework: string | null;
  ferramentaDeBuild: string | null;
  dependencias: string[];
  tecnologias: Tecnologia[];
  imagensDocker: string[];
  controllers: string[];
  services: string[];
  repositories: string[];
  entidades: string[];
  testes: string[];
  endpoints: EndpointDetectado[];
  parcial: boolean;
};

export type Arquitetura = "EM_CAMADAS" | "POR_FEATURE" | "HEXAGONAL" | "INDEFINIDA";

export type ContextoProjeto = {
  versaoEsquema: number;
  linguagem: Linguagem;
  framework: string | null;
  versaoLinguagem: string | null;
  versaoFramework: string | null;
  ferramentaDeBuild: string;
  arquitetura: Arquitetura;
  dominios: string[];
  tecnologias: Tecnologia[];
  features: string[];
  endpoints: EndpointDetectado[];
  componentes: {
    controllers: string[];
    services: string[];
    repositories: string[];
    entidades: string[];
    dtos: string[];
    excecoes: string[];
    temTratadorDeErros: boolean;
  };
  testes: {
    total: number;
    servicesSemTeste: string[];
    controllersSemTeste: string[];
  };
  infra: { temDockerfile: boolean; temCompose: boolean };
  parcial: boolean;
  truncado: boolean;
  itensDescartados: number;
};

export type AnaliseResumo = {
  id: string;
  status: StatusAnalise;
  dono: string;
  nome: string;
  linguagem: Linguagem | null;
  framework: string | null;
  versaoLinguagem: string | null;
  tecnologias: Tecnologia[];
  parcial: boolean;
  mensagemErro: string | null;
  criadoEm: string;
  concluidaEm: string | null;
};

export type AnaliseDetalhe = {
  id: string;
  status: StatusAnalise;
  dono: string;
  nome: string;
  resultado: ResultadoAnalise | null;
  contexto: ContextoProjeto | null;
  mensagemErro: string | null;
  criadoEm: string;
  concluidaEm: string | null;
};

export type TipoDesafio = "FEATURE" | "BUG" | "TESTING";

export type TipoPedido = TipoDesafio | "ALEATORIO";

export type StatusGeracao = "PENDENTE" | "EM_ANDAMENTO" | "PRONTO" | "FALHOU";

export type StatusProgresso = "NAO_INICIADO" | "EM_ANDAMENTO" | "CONCLUIDO";

export type ConteudoDesafio = {
  titulo: string;
  contexto: string;
  cenarioAtual: string;
  objetivo: string;
  regrasDeNegocio: string[];
  requisitosTecnicos: string[];
  criteriosDeAceite: string[];
  testesEsperados: string[];
  restricoes: string[];
  habilidades: string[];
};

export type DesafioDetalhe = {
  id: string;
  analiseId: string;
  numero: number;
  codigo: string;
  tipo: TipoDesafio;
  nivel: "JUNIOR";
  statusGeracao: StatusGeracao;
  titulo: string | null;
  conteudo: ConteudoDesafio | null;
  mensagemErro: string | null;
  criadoEm: string;
  concluidoEm: string | null;
  statusProgresso: StatusProgresso;
  iniciadoEm: string | null;
  finalizadoEm: string | null;
};

export type DesafioResumo = {
  id: string;
  numero: number;
  codigo: string;
  tipo: TipoDesafio;
  statusGeracao: StatusGeracao;
  statusProgresso: StatusProgresso;
  titulo: string | null;
  mensagemErro: string | null;
  criadoEm: string;
};

export type DesafioRecente = {
  id: string;
  analiseId: string;
  numero: number;
  codigo: string;
  tipo: TipoDesafio;
  statusGeracao: StatusGeracao;
  statusProgresso: StatusProgresso;
  titulo: string | null;
  habilidades: string[];
  criadoEm: string;
};

export type DesafiosRecentes = {
  totalGerados: number;
  cotaUsada: number;
  cotaLimite: number;
  recentes: DesafioRecente[];
};

export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
  }
}

async function requisitar<T>(caminho: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(caminho, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });

  if (!resposta.ok) {
    const problema = await resposta.json().catch(() => null);
    throw new ErroApi(
      resposta.status,
      problema?.detail ?? "Não foi possível concluir a requisição.",
    );
  }

  const texto = await resposta.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}

async function enviar<T>(caminho: string, corpo?: unknown, metodo: "POST" | "PATCH" | "PUT" = "POST"): Promise<T> {
  const csrf = await requisitar<{ cabecalho: string; token: string }>("/api/csrf");
  const headers: Record<string, string> = { [csrf.cabecalho]: csrf.token };
  if (corpo !== undefined) headers["Content-Type"] = "application/json";

  return requisitar<T>(caminho, {
    method: metodo,
    headers,
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
}

/** Devolve o perfil do usuário logado, ou null se não houver sessão. */
export async function buscarPerfil(): Promise<Perfil | null> {
  try {
    return await requisitar<Perfil>("/api/eu");
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status === 401) return null;
    throw erro;
  }
}

export function listarRepositorios(): Promise<Repositorio[]> {
  return requisitar<Repositorio[]>("/api/repositorios");
}

export function iniciarAnalise(dono: string, nome: string): Promise<{ id: string; status: StatusAnalise }> {
  return enviar("/api/analises", { dono, nome });
}

export function buscarAnalise(id: string): Promise<AnaliseDetalhe> {
  return requisitar<AnaliseDetalhe>(`/api/analises/${encodeURIComponent(id)}`);
}

export function listarAnalises(): Promise<AnaliseResumo[]> {
  return requisitar<AnaliseResumo[]>("/api/analises");
}

export function iniciarDesafio(
  analiseId: string,
  tipo: TipoPedido,
): Promise<{ id: string; statusGeracao: StatusGeracao }> {
  return enviar(`/api/analises/${encodeURIComponent(analiseId)}/desafios`, { tipo });
}

export function buscarDesafio(id: string): Promise<DesafioDetalhe> {
  return requisitar<DesafioDetalhe>(`/api/desafios/${encodeURIComponent(id)}`);
}

export function listarDesafios(analiseId: string): Promise<DesafioResumo[]> {
  return requisitar<DesafioResumo[]>(`/api/analises/${encodeURIComponent(analiseId)}/desafios`);
}

export function listarDesafiosRecentes(): Promise<DesafiosRecentes> {
  return requisitar<DesafiosRecentes>("/api/desafios");
}

export type ProgressoDesafio = {
  statusProgresso: StatusProgresso;
  iniciadoEm: string | null;
  finalizadoEm: string | null;
};

export type Dica = {
  nivel: number;
  texto: string;
  criadoEm: string;
};

export type Dicas = {
  dicas: Dica[];
  maximoPorDesafio: number;
  usadasHoje: number;
  limiteDiario: number;
};

export function mudarProgresso(id: string, status: StatusProgresso): Promise<ProgressoDesafio> {
  return enviar(`/api/desafios/${encodeURIComponent(id)}/progresso`, { status }, "PATCH");
}

export function listarDicas(id: string): Promise<Dicas> {
  return requisitar<Dicas>(`/api/desafios/${encodeURIComponent(id)}/dicas`);
}

export function pedirDica(id: string): Promise<Dica> {
  return enviar(`/api/desafios/${encodeURIComponent(id)}/dicas`);
}

export type ItemHistorico = {
  id: string;
  analiseId: string;
  repositorio: string;
  numero: number;
  codigo: string;
  tipo: TipoDesafio;
  statusGeracao: StatusGeracao;
  statusProgresso: StatusProgresso;
  titulo: string | null;
  dicasUsadas: number;
  criadoEm: string;
  finalizadoEm: string | null;
};

export type PaginaHistorico = {
  itens: ItemHistorico[];
  pagina: number;
  tamanho: number;
  total: number;
  totalPaginas: number;
};

export type FiltrosDoHistorico = {
  status?: StatusProgresso;
  tipo?: TipoDesafio;
  pagina?: number;
  tamanho?: number;
};

export type HabilidadePraticada = {
  nome: string;
  total: number;
};

export type ResumoDoProgresso = {
  naoIniciados: number;
  emAndamento: number;
  concluidos: number;
  dicasUsadas: number;
  habilidades: HabilidadePraticada[];
};

export type TipoDeEvento =
  | "DESAFIO_PRONTO"
  | "DESAFIO_FALHOU"
  | "PROGRESSO_INICIADO"
  | "PROGRESSO_CONCLUIDO"
  | "PROGRESSO_REABERTO"
  | "DICA_USADA";

export type Notificacao = {
  id: string;
  tipo: TipoDeEvento;
  desafioId: string;
  codigo: string;
  titulo: string | null;
  lida: boolean;
  criadoEm: string;
};

export type Notificacoes = {
  naoLidas: number;
  itens: Notificacao[];
};

/** Todos os desafios que ainda estão em aberto, de todos os projetos. */
export function listarDesafiosEmAberto(): Promise<ItemHistorico[]> {
  return requisitar<ItemHistorico[]>("/api/historico/abertos");
}

export function listarHistorico(filtros: FiltrosDoHistorico = {}): Promise<PaginaHistorico> {
  const parametros = new URLSearchParams();
  if (filtros.status) parametros.set("status", filtros.status);
  if (filtros.tipo) parametros.set("tipo", filtros.tipo);
  if (filtros.pagina !== undefined) parametros.set("pagina", String(filtros.pagina));
  if (filtros.tamanho !== undefined) parametros.set("tamanho", String(filtros.tamanho));
  const consulta = parametros.toString();

  return requisitar<PaginaHistorico>(`/api/historico${consulta ? `?${consulta}` : ""}`);
}

export function buscarResumoDoProgresso(): Promise<ResumoDoProgresso> {
  return requisitar<ResumoDoProgresso>("/api/progresso");
}

export function listarNotificacoes(): Promise<Notificacoes> {
  return requisitar<Notificacoes>("/api/notificacoes");
}

export async function marcarTodasComoLidas(): Promise<void> {
  await enviar<void>("/api/notificacoes/lidas");
}

export async function marcarComoLida(id: string): Promise<void> {
  await enviar<void>(`/api/notificacoes/${encodeURIComponent(id)}/lida`);
}

export async function sair(): Promise<void> {
  await enviar<void>("/api/logout");
}

export type TrilhaDeEstudoNoServidor = { licoes: string[]; notas: Record<string, number>; desafios: string[] };

export type EstudoNoServidor = { trilhas: Record<string, TrilhaDeEstudoNoServidor> };

export type MudancaDeEstudo = { licaoLida?: boolean; nota?: number; desafioDeclarado?: boolean };

export function buscarEstudo(): Promise<EstudoNoServidor> {
  return requisitar<EstudoNoServidor>("/api/estudo");
}

export function registrarEstudo(trilha: string, item: string, mudanca: MudancaDeEstudo): Promise<void> {
  return enviar(`/api/estudo/${encodeURIComponent(trilha)}/${encodeURIComponent(item)}`, mudanca, "PUT");
}

export function importarEstudo(estado: EstudoNoServidor): Promise<EstudoNoServidor> {
  return enviar("/api/estudo/importacao", estado);
}

export type CategoriaDeSeguranca = "LOGS" | "CRIPTOGRAFIA" | "SEGREDOS" | "WEB";

export type DificuldadeDeSeguranca = "FACIL" | "MEDIO" | "DIFICIL";

export type ResumoDeSeguranca = {
  slug: string;
  titulo: string;
  categoria: CategoriaDeSeguranca;
  dificuldade: DificuldadeDeSeguranca;
  pontos: number;
  resumo: string;
  resolvido: boolean;
};

export type ArtefatoDeSeguranca = { nome: string; linguagem: string; conteudo: string };

export type DetalheDeSeguranca = ResumoDeSeguranca & {
  enunciado: string[];
  formatoDaFlag: string;
  artefatos: ArtefatoDeSeguranca[];
  dicas: string[];
  solucao: string[] | null;
};

export type ResultadoDaFlag = { correta: boolean; jaResolvido: boolean; pontosGanhos: number };

export type PosicaoNoPlacar = { posicao: number; login: string; pontos: number; resolvidos: number };

export type PlacarDeSeguranca = { melhores: PosicaoNoPlacar[]; voce: PosicaoNoPlacar | null };

export function listarDesafiosDeSeguranca(): Promise<ResumoDeSeguranca[]> {
  return requisitar<ResumoDeSeguranca[]>("/api/seguranca/desafios");
}

export function buscarDesafioDeSeguranca(slug: string): Promise<DetalheDeSeguranca> {
  return requisitar<DetalheDeSeguranca>(`/api/seguranca/desafios/${encodeURIComponent(slug)}`);
}

export function enviarFlag(slug: string, flag: string): Promise<ResultadoDaFlag> {
  return enviar(`/api/seguranca/desafios/${encodeURIComponent(slug)}/flag`, { flag });
}

export function buscarPlacarDeSeguranca(): Promise<PlacarDeSeguranca> {
  return requisitar<PlacarDeSeguranca>("/api/seguranca/placar");
}
