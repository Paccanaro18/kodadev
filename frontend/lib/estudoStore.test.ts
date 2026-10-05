import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  assinarEstudo, CHAVE_DO_DONO_DO_ESTUDO, instantaneoDoEstudo, iniciarEstudo, mudarEstudo, reiniciarEstudoParaTestes,
} from "./estudoStore";
import * as api from "./api";
import { CHAVE_DO_ESTUDO, marcarLicao, registrarNota } from "./progressoDeEstudo";

vi.mock("./api", async (importarOriginal) => {
  const original = await importarOriginal<typeof import("./api")>();
  return { ...original, buscarPerfil: vi.fn(), buscarEstudo: vi.fn(), importarEstudo: vi.fn(), registrarEstudo: vi.fn() };
});

const perfil = vi.mocked(api.buscarPerfil);
const buscarEstudo = vi.mocked(api.buscarEstudo);
const importarEstudo = vi.mocked(api.importarEstudo);
const registrarEstudo = vi.mocked(api.registrarEstudo);

const SEM_NADA: api.EstudoNoServidor = { trilhas: {} };
const COM_JAVA: api.EstudoNoServidor = { trilhas: { java: { licoes: ["m1"], notas: { m1: 0.8 }, desafios: [] } } };

function guardarLocal(estado: unknown, dono?: string) {
  window.localStorage.setItem(CHAVE_DO_ESTUDO, JSON.stringify(estado));
  if (dono) window.localStorage.setItem(CHAVE_DO_DONO_DO_ESTUDO, dono);
}

async function esperarOrigem(origem: "conta" | "navegador") {
  await vi.waitFor(() => expect(instantaneoDoEstudo().origem).toBe(origem));
}

beforeEach(() => {
  window.localStorage.clear();
  reiniciarEstudoParaTestes();
  vi.resetAllMocks();
  perfil.mockResolvedValue({ login: "ana" } as api.Perfil);
  buscarEstudo.mockResolvedValue(SEM_NADA);
  importarEstudo.mockImplementation(async (estado) => estado);
  registrarEstudo.mockResolvedValue(undefined);
});

afterEach(() => reiniciarEstudoParaTestes());

describe("sem sessão", () => {
  it("usa só o navegador e não fala com o servidor de estudo", async () => {
    perfil.mockResolvedValue(null);
    guardarLocal({ java: { licoes: ["m1"], notas: {}, desafios: [] } });

    iniciarEstudo();

    expect(instantaneoDoEstudo().carregado).toBe(true);
    expect(instantaneoDoEstudo().estado.java.licoes).toEqual(["m1"]);
    await vi.waitFor(() => expect(perfil).toHaveBeenCalled());
    expect(buscarEstudo).not.toHaveBeenCalled();

    mudarEstudo((e) => registrarNota(e, "java", "m1", 0.9), "java", "m1", { nota: 0.9 });
    expect(instantaneoDoEstudo().estado.java.notas.m1).toBe(0.9);
    expect(registrarEstudo).not.toHaveBeenCalled();
    expect(instantaneoDoEstudo().origem).toBe("navegador");
  });

  it("segue no navegador quando a consulta do perfil falha", async () => {
    perfil.mockRejectedValue(new api.ErroApi(500, "erro"));

    iniciarEstudo();
    await vi.waitFor(() => expect(perfil).toHaveBeenCalled());
    await esperarOrigem("navegador");
  });
});

describe("com sessão", () => {
  it("leva para a conta o que a pessoa já tinha feito antes de entrar", async () => {
    guardarLocal({ java: { licoes: ["m2"], notas: { m2: 0.7 }, desafios: [] } });
    buscarEstudo.mockResolvedValue(COM_JAVA);

    iniciarEstudo();
    await esperarOrigem("conta");

    expect(importarEstudo).toHaveBeenCalledWith({ trilhas: { java: { licoes: ["m1", "m2"], notas: { m1: 0.8, m2: 0.7 }, desafios: [] } } });
    expect(instantaneoDoEstudo().estado.java.licoes).toEqual(["m1", "m2"]);
    expect(window.localStorage.getItem(CHAVE_DO_DONO_DO_ESTUDO)).toBe("ana");
  });

  it("não reenvia nada quando a conta já tem tudo", async () => {
    guardarLocal({ java: { licoes: ["m1"], notas: { m1: 0.5 }, desafios: [] } }, "ana");
    buscarEstudo.mockResolvedValue(COM_JAVA);

    iniciarEstudo();
    await esperarOrigem("conta");

    expect(importarEstudo).not.toHaveBeenCalled();
    expect(instantaneoDoEstudo().estado.java.notas.m1).toBe(0.8);
  });

  it("descarta o progresso do navegador que era de outra pessoa", async () => {
    guardarLocal({ java: { licoes: ["segredo"], notas: {}, desafios: [] } }, "bia");
    buscarEstudo.mockResolvedValue(COM_JAVA);

    iniciarEstudo();
    await esperarOrigem("conta");

    expect(importarEstudo).not.toHaveBeenCalled();
    expect(instantaneoDoEstudo().estado.java.licoes).toEqual(["m1"]);
    expect(window.localStorage.getItem(CHAVE_DO_DONO_DO_ESTUDO)).toBe("ana");
  });

  it("envia cada mudança feita depois para a conta", async () => {
    iniciarEstudo();
    await esperarOrigem("conta");

    mudarEstudo((e) => marcarLicao(e, "java", "m1", true), "java", "m1", { licaoLida: true });
    mudarEstudo((e) => registrarNota(e, "java", "m1", 1), "java", "m1", { nota: 1 });

    expect(registrarEstudo).toHaveBeenNthCalledWith(1, "java", "m1", { licaoLida: true });
    expect(registrarEstudo).toHaveBeenNthCalledWith(2, "java", "m1", { nota: 1 });
    expect(JSON.parse(window.localStorage.getItem(CHAVE_DO_ESTUDO) ?? "{}").java.licoes).toEqual(["m1"]);
  });

  it("avisa quando não consegue salvar e some o aviso quando volta a conseguir", async () => {
    iniciarEstudo();
    await esperarOrigem("conta");
    registrarEstudo.mockRejectedValueOnce(new api.ErroApi(500, "erro"));

    mudarEstudo((e) => marcarLicao(e, "java", "m1", true), "java", "m1", { licaoLida: true });
    await vi.waitFor(() => expect(instantaneoDoEstudo().falhaAoSalvar).toBe(true));

    mudarEstudo((e) => marcarLicao(e, "java", "m2", true), "java", "m2", { licaoLida: true });
    await vi.waitFor(() => expect(instantaneoDoEstudo().falhaAoSalvar).toBe(false));
  });

  it("também leva à conta o que foi feito enquanto a sincronização ainda rodava", async () => {
    let liberar: (estudo: api.EstudoNoServidor) => void = () => undefined;
    buscarEstudo.mockReturnValue(new Promise((resolver) => { liberar = resolver; }));

    iniciarEstudo();
    mudarEstudo((e) => marcarLicao(e, "java", "m3", true), "java", "m3", { licaoLida: true });
    expect(registrarEstudo).not.toHaveBeenCalled();
    liberar(SEM_NADA);
    await esperarOrigem("conta");

    expect(importarEstudo).toHaveBeenCalledWith({ trilhas: { java: { licoes: ["m3"], notas: {}, desafios: [] } } });
  });

  it("ficou no navegador quando o servidor responde com erro", async () => {
    buscarEstudo.mockRejectedValue(new api.ErroApi(500, "erro"));

    iniciarEstudo();
    await vi.waitFor(() => expect(buscarEstudo).toHaveBeenCalled());

    expect(instantaneoDoEstudo().origem).toBe("navegador");
  });

  it("ignora a sessão expirada no meio do caminho", async () => {
    buscarEstudo.mockRejectedValue(new api.ErroApi(401, "sem sessão"));

    iniciarEstudo();
    await vi.waitFor(() => expect(buscarEstudo).toHaveBeenCalled());

    expect(instantaneoDoEstudo().origem).toBe("navegador");
  });
});

describe("assinaturas e outras abas", () => {
  it("avisa quem assinou e para de avisar ao cancelar", () => {
    iniciarEstudo();
    const ouvinte = vi.fn();
    const cancelar = assinarEstudo(ouvinte);

    mudarEstudo((e) => marcarLicao(e, "java", "m1", true), "java", "m1", { licaoLida: true });
    expect(ouvinte).toHaveBeenCalled();

    ouvinte.mockClear();
    cancelar();
    mudarEstudo((e) => marcarLicao(e, "java", "m2", true), "java", "m2", { licaoLida: true });
    expect(ouvinte).not.toHaveBeenCalled();
  });

  it("recarrega quando outra aba muda o progresso", () => {
    perfil.mockResolvedValue(null);
    iniciarEstudo();

    guardarLocal({ java: { licoes: ["vindo-da-outra-aba"], notas: {}, desafios: [] } });
    window.dispatchEvent(new StorageEvent("storage", { key: CHAVE_DO_ESTUDO }));
    window.dispatchEvent(new StorageEvent("storage", { key: "outra-chave" }));

    expect(instantaneoDoEstudo().estado.java.licoes).toEqual(["vindo-da-outra-aba"]);
  });

  it("só inicia uma vez", () => {
    perfil.mockResolvedValue(null);
    iniciarEstudo();
    iniciarEstudo();

    expect(perfil).toHaveBeenCalledTimes(1);
  });
});
