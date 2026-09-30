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

export type EndpointDetectado = {
  metodoHttp: string;
  caminho: string;
  controller: string;
};

export type ResultadoAnalise = {
  temCodigoJava: boolean;
  springBoot: boolean;
  versaoJava: string | null;
  versaoSpringBoot: string | null;
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

export type AnaliseResumo = {
  id: string;
  status: StatusAnalise;
  dono: string;
  nome: string;
  springBoot: boolean;
  versaoJava: string | null;
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
  mensagemErro: string | null;
  criadoEm: string;
  concluidaEm: string | null;
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

async function enviar<T>(caminho: string, corpo?: unknown): Promise<T> {
  const csrf = await requisitar<{ cabecalho: string; token: string }>("/api/csrf");
  const headers: Record<string, string> = { [csrf.cabecalho]: csrf.token };
  if (corpo !== undefined) headers["Content-Type"] = "application/json";

  return requisitar<T>(caminho, {
    method: "POST",
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

export async function sair(): Promise<void> {
  await enviar<void>("/api/logout");
}
