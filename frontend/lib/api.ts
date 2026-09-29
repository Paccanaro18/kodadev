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

export async function sair(): Promise<void> {
  const csrf = await requisitar<{ cabecalho: string; token: string }>(
    "/api/csrf",
  );
  await requisitar<void>("/api/logout", {
    method: "POST",
    headers: { [csrf.cabecalho]: csrf.token },
  });
}
