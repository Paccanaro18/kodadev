import {
  buscarEstudo, buscarPerfil, ErroApi, importarEstudo, registrarEstudo,
  type EstudoNoServidor, type MudancaDeEstudo,
} from "@/lib/api";
import {
  CHAVE_DO_ESTUDO, ESTADO_VAZIO, estadosIguais, gravarEstado, juntarEstados, lerEstado,
  type EstadoDeEstudo,
} from "@/lib/progressoDeEstudo";

export const CHAVE_DO_DONO_DO_ESTUDO = "koda-estudo-dono";

export type OrigemDoEstudo = "navegador" | "conta";

export type InstantaneoDoEstudo = {
  estado: EstadoDeEstudo;
  carregado: boolean;
  origem: OrigemDoEstudo;
  falhaAoSalvar: boolean;
};

const INICIAL: InstantaneoDoEstudo = { estado: ESTADO_VAZIO, carregado: false, origem: "navegador", falhaAoSalvar: false };

let instantaneo: InstantaneoDoEstudo = INICIAL;
let iniciado = false;
let removerOuvinteDeArmazenamento: (() => void) | null = null;
const ouvintes = new Set<() => void>();

function armazenamento(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function publicar(parcial: Partial<InstantaneoDoEstudo>) {
  instantaneo = { ...instantaneo, ...parcial };
  ouvintes.forEach((ouvinte) => ouvinte());
}

function doServidor(estudo: EstudoNoServidor): EstadoDeEstudo {
  return { ...estudo.trilhas };
}

function paraServidor(estado: EstadoDeEstudo): EstudoNoServidor {
  return { trilhas: { ...estado } };
}

function lerDono(): string | null {
  try {
    return armazenamento()?.getItem(CHAVE_DO_DONO_DO_ESTUDO) ?? null;
  } catch {
    return null;
  }
}

function gravarDono(login: string) {
  try {
    armazenamento()?.setItem(CHAVE_DO_DONO_DO_ESTUDO, login);
  } catch {
    return;
  }
}

async function sincronizar() {
  try {
    const perfil = await buscarPerfil();
    if (!perfil) return;

    const servidor = doServidor(await buscarEstudo());
    const dono = lerDono();
    const deOutraPessoa = dono !== null && dono !== perfil.login;
    const local = deOutraPessoa ? ESTADO_VAZIO : instantaneo.estado;
    const juntado = juntarEstados(local, servidor);
    const final = estadosIguais(juntado, servidor) ? juntado : juntarEstados(juntado, doServidor(await importarEstudo(paraServidor(juntado))));

    const aposMudancasDuranteASincronizacao = deOutraPessoa ? final : juntarEstados(final, instantaneo.estado);
    if (!estadosIguais(aposMudancasDuranteASincronizacao, final)) {
      await importarEstudo(paraServidor(aposMudancasDuranteASincronizacao));
    }

    gravarDono(perfil.login);
    gravarEstado(armazenamento(), aposMudancasDuranteASincronizacao);
    publicar({ estado: aposMudancasDuranteASincronizacao, origem: "conta", falhaAoSalvar: false });
  } catch (erro) {
    if (erro instanceof ErroApi && erro.status !== 401) publicar({ origem: "navegador" });
  }
}

export function iniciarEstudo() {
  if (iniciado || typeof window === "undefined") return;
  iniciado = true;
  publicar({ estado: lerEstado(armazenamento()), carregado: true });

  const aoMudarEmOutraAba = (evento: StorageEvent) => {
    if (evento.key === CHAVE_DO_ESTUDO) publicar({ estado: lerEstado(armazenamento()) });
  };
  window.addEventListener("storage", aoMudarEmOutraAba);
  removerOuvinteDeArmazenamento = () => window.removeEventListener("storage", aoMudarEmOutraAba);

  void sincronizar();
}

export function assinarEstudo(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

export function instantaneoDoEstudo(): InstantaneoDoEstudo {
  return instantaneo;
}

export function instantaneoInicialDoEstudo(): InstantaneoDoEstudo {
  return INICIAL;
}

export function mudarEstudo(mudar: (atual: EstadoDeEstudo) => EstadoDeEstudo, trilha: string, item: string, mudanca: MudancaDeEstudo) {
  const novo = mudar(instantaneo.estado);
  gravarEstado(armazenamento(), novo);
  publicar({ estado: novo });

  if (instantaneo.origem !== "conta") return;
  registrarEstudo(trilha, item, mudanca)
    .then(() => {
      if (instantaneo.falhaAoSalvar) publicar({ falhaAoSalvar: false });
    })
    .catch(() => publicar({ falhaAoSalvar: true }));
}

export function reiniciarEstudoParaTestes() {
  removerOuvinteDeArmazenamento?.();
  removerOuvinteDeArmazenamento = null;
  iniciado = false;
  instantaneo = INICIAL;
  ouvintes.clear();
}
