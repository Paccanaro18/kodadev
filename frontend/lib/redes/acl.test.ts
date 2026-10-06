import { describe, expect, it } from "vitest";
import { cidrValido, pertenceACidr } from "./ip";
import { construirRede } from "./rascunho";
import { Simulador } from "./simulador";
import { executarComando } from "./terminal";
import type { Rede, RegraDeAcl } from "./tipos";

function rede(acl?: Record<string, RegraDeAcl[]>): Rede {
  return construirRede(
    [
      { tipo: "switch", numero: 1, x: 0, y: 0 },
      { tipo: "pc", numero: 1, x: 0, y: 0, config: { ip: "10.0.1.10", gateway: "10.0.1.1" } },
      { tipo: "pc", numero: 2, x: 0, y: 0, config: { ip: "10.0.1.20", gateway: "10.0.1.1" } },
      { tipo: "roteador", numero: 1, x: 0, y: 0, config: { portas: { "Gi0/0": { ip: "10.0.1.1" }, "Gi0/1": { ip: "10.0.2.1" } }, acl } },
      { tipo: "servidor", numero: 1, x: 0, y: 0, config: { ip: "10.0.2.10", gateway: "10.0.2.1" } },
    ],
    [
      ["pc-1", "eth0", "switch-1", "Fa0/1"],
      ["pc-2", "eth0", "switch-1", "Fa0/2"],
      ["switch-1", "Fa0/3", "roteador-1", "Gi0/0"],
      ["roteador-1", "Gi0/1", "servidor-1", "eth0"],
    ],
  );
}

const PERMITIR_TUDO: RegraDeAcl = { acao: "permitir", protocolo: "qualquer", origem: "qualquer", destino: "qualquer" };
const NEGAR_PC2: RegraDeAcl = { acao: "negar", protocolo: "icmp", origem: "10.0.1.20", destino: "10.0.2.10" };

describe("endereços com prefixo", () => {
  it("valida e compara", () => {
    for (const bom of ["qualquer", "10.0.0.0/8", "10.0.1.20", "192.168.0.0/32", "0.0.0.0/0"]) expect(cidrValido(bom), bom).toBe(true);
    for (const ruim of ["", "10.0.0/8", "10.0.0.0/33", "10.0.0.0/a", "10.0.0.0/8/8", "host"]) expect(cidrValido(ruim), ruim).toBe(false);
    expect(pertenceACidr("10.0.1.77", "10.0.1.0/24")).toBe(true);
    expect(pertenceACidr("10.0.2.77", "10.0.1.0/24")).toBe(false);
    expect(pertenceACidr("10.0.1.20", "10.0.1.20")).toBe(true);
    expect(pertenceACidr("10.0.1.21", "10.0.1.20")).toBe(false);
    expect(pertenceACidr("1.2.3.4", "qualquer")).toBe(true);
    expect(pertenceACidr("1.2.3.4", "lixo")).toBe(false);
  });
});

describe("ACL de entrada no roteador", () => {
  it("sem ACL, tudo passa", () => {
    const sim = new Simulador(rede());
    expect(sim.ping("pc-1", "10.0.2.10").sucesso).toBe(true);
    expect(sim.ping("pc-2", "10.0.2.10").sucesso).toBe(true);
  });

  it("nega só o host indicado e permite o resto com a regra final", () => {
    const sim = new Simulador(rede({ "Gi0/0": [NEGAR_PC2, PERMITIR_TUDO] }));
    expect(sim.ping("pc-1", "10.0.2.10").sucesso).toBe(true);
    const bloqueado = sim.ping("pc-2", "10.0.2.10");
    expect(bloqueado.sucesso).toBe(false);
    expect(bloqueado.tipo).toBe("inalcancavel");
    expect(bloqueado.de).toBe("10.0.1.1");
    expect(bloqueado.motivo).toContain("regra 1: negar icmp 10.0.1.20 → 10.0.2.10");
  });

  it("aplica o negar implícito quando nenhuma regra casa", () => {
    const sim = new Simulador(rede({ "Gi0/0": [NEGAR_PC2] }));
    const resultado = sim.ping("pc-1", "10.0.2.10");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.motivo).toContain("negar implícito");
  });

  it("a regra vale na ordem: a primeira que casa decide", () => {
    const sim = new Simulador(rede({ "Gi0/0": [PERMITIR_TUDO, NEGAR_PC2] }));
    expect(sim.ping("pc-2", "10.0.2.10").sucesso).toBe(true);
  });

  it("é sem estado: a resposta também precisa ser permitida na interface de volta", () => {
    const apenasIda: RegraDeAcl[] = [{ acao: "permitir", protocolo: "icmp", origem: "10.0.1.0/24", destino: "10.0.2.10" }];
    const volta: RegraDeAcl[] = [{ acao: "permitir", protocolo: "icmp", origem: "10.0.2.10", destino: "10.0.9.0/24" }];
    const quebrada = new Simulador(rede({ "Gi0/0": apenasIda, "Gi0/1": volta }));
    expect(quebrada.ping("pc-1", "10.0.2.10").sucesso).toBe(false);

    const certa = new Simulador(rede({ "Gi0/0": apenasIda, "Gi0/1": [{ ...volta[0], destino: "10.0.1.0/24" }] }));
    expect(certa.ping("pc-1", "10.0.2.10").sucesso).toBe(true);
  });

  it("filtra por protocolo: nega só o DNS e deixa o ping passar", () => {
    const sim = new Simulador(rede({ "Gi0/0": [{ acao: "negar", protocolo: "dns", origem: "qualquer", destino: "qualquer" }, PERMITIR_TUDO] }));
    expect(sim.ping("pc-1", "10.0.2.10").sucesso).toBe(true);
  });

  it("lista as ACLs no terminal do roteador", () => {
    const r = rede({ "Gi0/0": [NEGAR_PC2, PERMITIR_TUDO] });
    const sim = new Simulador(r);
    const texto = executarComando(r, sim, "roteador-1", "show access-lists").linhas.join("\n");
    expect(texto).toContain("ACL de entrada em Gi0/0:");
    expect(texto).toContain("1  negar icmp 10.0.1.20 → 10.0.2.10");
    expect(texto).toContain("negar tudo o que não casou (implícito)");
    const vazia = rede();
    expect(executarComando(vazia, new Simulador(vazia), "roteador-1", "show access-lists").linhas[0]).toContain("Nenhuma ACL");
  });
});
