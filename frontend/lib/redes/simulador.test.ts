import { describe, expect, it } from "vitest";
import {
  adicionarCabo, adicionarDispositivo, atualizarDispositivo, atualizarInterface, interfaceOcupada, ligados, posicaoLivre, primeiraInterfaceLivre,
  removerCabo, removerDispositivo,
} from "./construcao";
import {
  analisarIp, enderecoDeRedeOuTransmissao, formatarIp, mascaraDoPrefixo, mascaraValida, mesmaRede, prefixoDaMascara, redeDe,
} from "./ip";
import { Simulador } from "./simulador";
import type { Rede, TipoDeDispositivo } from "./tipos";

function vazia(): Rede {
  return { dispositivos: [], cabos: [] };
}

function com(rede: Rede, tipo: TipoDeDispositivo): [Rede, string] {
  const nova = adicionarDispositivo(rede, tipo, 0, 0);
  return [nova, nova.dispositivos[nova.dispositivos.length - 1].id];
}

function ligar(rede: Rede, a: string, ia: string, b: string, ib: string): Rede {
  const resultado = adicionarCabo(rede, { dispositivo: a, interface: ia }, { dispositivo: b, interface: ib });
  if ("erro" in resultado) throw new Error(resultado.erro);
  return resultado.rede;
}

function configurar(rede: Rede, id: string, ip: string, mascara = "255.255.255.0", gateway = ""): Rede {
  const comIp = atualizarInterface(rede, id, "eth0", { ip, mascara });
  return atualizarDispositivo(comIp, id, (d) => ({ ...d, gateway }));
}

function configurarPorta(rede: Rede, id: string, porta: string, ip: string, mascara = "255.255.255.0"): Rede {
  return atualizarInterface(rede, id, porta, { ip, mascara });
}

function doisPcsNumSwitch() {
  let rede = vazia();
    const novo = (tipo: TipoDeDispositivo) => {
      rede = adicionarDispositivo(rede, tipo, 0, 0);
      return rede.dispositivos[rede.dispositivos.length - 1].id;
    };
  const pc1 = novo("pc");
  const pc2 = novo("pc");
  const sw = novo("switch");
  rede = ligar(rede, pc1, "eth0", sw, "Fa0/1");
  rede = ligar(rede, pc2, "eth0", sw, "Fa0/2");
  rede = configurar(rede, pc1, "192.168.0.10");
  rede = configurar(rede, pc2, "192.168.0.20");
  return { rede, pc1, pc2, sw };
}

function duasRedesComRoteador() {
  let rede = vazia();
    const novo = (tipo: TipoDeDispositivo) => {
      rede = adicionarDispositivo(rede, tipo, 0, 0);
      return rede.dispositivos[rede.dispositivos.length - 1].id;
    };
  const pc1 = novo("pc");
  const srv = novo("servidor");
  const sw1 = novo("switch");
  const sw2 = novo("switch");
  const r1 = novo("roteador");
  rede = ligar(rede, pc1, "eth0", sw1, "Fa0/1");
  rede = ligar(rede, sw1, "Fa0/2", r1, "Gi0/0");
  rede = ligar(rede, r1, "Gi0/1", sw2, "Fa0/1");
  rede = ligar(rede, sw2, "Fa0/2", srv, "eth0");
  rede = configurar(rede, pc1, "10.0.1.10", "255.255.255.0", "10.0.1.1");
  rede = configurar(rede, srv, "10.0.2.10", "255.255.255.0", "10.0.2.1");
  rede = configurarPorta(rede, r1, "Gi0/0", "10.0.1.1");
  rede = configurarPorta(rede, r1, "Gi0/1", "10.0.2.1");
  return { rede, pc1, srv, sw1, sw2, r1 };
}

describe("endereços IP", () => {
  it("converte entre texto e número", () => {
    expect(analisarIp("192.168.0.1")).toBe(3232235521);
    expect(formatarIp(3232235521)).toBe("192.168.0.1");
    expect(analisarIp("255.255.255.255")).toBe(2 ** 32 - 1);
  });

  it("rejeita endereços malformados", () => {
    for (const ruim of ["", "1.2.3", "1.2.3.4.5", "256.1.1.1", "a.b.c.d", "1.2.3.-4", "1..2.3"]) {
      expect(analisarIp(ruim), ruim).toBeNull();
    }
  });

  it("calcula o prefixo e valida a máscara", () => {
    expect(prefixoDaMascara("255.255.255.0")).toBe(24);
    expect(prefixoDaMascara("255.255.255.128")).toBe(25);
    expect(prefixoDaMascara("0.0.0.0")).toBe(0);
    expect(prefixoDaMascara("255.0.255.0")).toBeNull();
    expect(mascaraValida("255.255.255.7")).toBe(false);
    expect(mascaraDoPrefixo(26)).toBe("255.255.255.192");
    expect(mascaraDoPrefixo(0)).toBe("0.0.0.0");
    expect(mascaraDoPrefixo(32)).toBe("255.255.255.255");
  });

  it("descobre a rede e compara endereços", () => {
    expect(redeDe("192.168.1.77", "255.255.255.192")).toBe("192.168.1.64");
    expect(mesmaRede("192.168.1.10", "192.168.1.200", "255.255.255.0")).toBe(true);
    expect(mesmaRede("192.168.1.10", "192.168.1.200", "255.255.255.128")).toBe(false);
    expect(redeDe("10.0.0.1", "255.0.255.0")).toBeNull();
  });

  it("identifica endereço de rede e de transmissão", () => {
    expect(enderecoDeRedeOuTransmissao("192.168.1.0", "255.255.255.0")).toBe("rede");
    expect(enderecoDeRedeOuTransmissao("192.168.1.255", "255.255.255.0")).toBe("transmissao");
    expect(enderecoDeRedeOuTransmissao("192.168.1.9", "255.255.255.0")).toBeNull();
  });
});

describe("montagem da rede", () => {
  it("numera os dispositivos por tipo e gera MACs diferentes", () => {
    let rede = vazia();
    rede = adicionarDispositivo(rede, "pc", 0, 0);
    rede = adicionarDispositivo(rede, "pc", 0, 0);
    rede = adicionarDispositivo(rede, "switch", 0, 0);
    expect(rede.dispositivos.map((d) => d.nome)).toEqual(["PC1", "PC2", "Switch1"]);
    const macs = rede.dispositivos.flatMap((d) => d.interfaces.map((i) => i.mac));
    expect(new Set(macs).size).toBe(macs.length);
  });

  it("não deixa ligar a mesma interface duas vezes nem um dispositivo a si mesmo", () => {
    let rede = vazia();
    const novo = (tipo: TipoDeDispositivo) => {
      rede = adicionarDispositivo(rede, tipo, 0, 0);
      return rede.dispositivos[rede.dispositivos.length - 1].id;
    };
    const a = novo("pc");
    const b = novo("pc");
    const c = novo("pc");
    rede = ligar(rede, a, "eth0", b, "eth0");
    expect(interfaceOcupada(rede, { dispositivo: a, interface: "eth0" })).toBe(true);
    expect(adicionarCabo(rede, { dispositivo: a, interface: "eth0" }, { dispositivo: c, interface: "eth0" })).toHaveProperty("erro");
    expect(adicionarCabo(rede, { dispositivo: c, interface: "eth0" }, { dispositivo: c, interface: "eth0" })).toHaveProperty("erro");
    expect(adicionarCabo(rede, { dispositivo: c, interface: "eth9" }, { dispositivo: a, interface: "eth0" })).toHaveProperty("erro");
    expect(ligados(rede, a, b)).toBe(true);
    expect(ligados(rede, a, c)).toBe(false);
  });

  it("remove cabos junto com o dispositivo", () => {
    const { rede, pc1, sw } = doisPcsNumSwitch();
    const sem = removerDispositivo(rede, sw);
    expect(sem.cabos).toHaveLength(0);
    expect(sem.dispositivos.map((d) => d.id)).toContain(pc1);
    expect(removerCabo(rede, rede.cabos[0].id).cabos).toHaveLength(1);
  });
});

describe("ping na mesma rede", () => {
  it("faz ARP e depois o ping, e o switch aprende os MACs", () => {
    const { rede, pc1, pc2, sw } = doisPcsNumSwitch();
    const sim = new Simulador(rede);
    const resultado = sim.ping(pc1, "192.168.0.20");

    expect(resultado.sucesso).toBe(true);
    expect(resultado.tipo).toBe("resposta");
    expect(resultado.de).toBe("192.168.0.20");
    expect(resultado.ttl).toBe(128);
    const tipos = resultado.passos.map((p) => p.tipo);
    expect(tipos.slice(0, 2)).toEqual(["arp", "arp"]);
    expect(tipos).toContain("icmp");
    expect(sim.tabelaArp(pc1)).toEqual([{ ip: "192.168.0.20", mac: expect.any(String) }]);
    expect(sim.tabelaArp(pc2).map((e) => e.ip)).toEqual(["192.168.0.10"]);
    expect(sim.tabelaMac(sw)).toHaveLength(2);
  });

  it("não repete o ARP no segundo ping", () => {
    const { rede, pc1 } = doisPcsNumSwitch();
    const sim = new Simulador(rede);
    sim.ping(pc1, "192.168.0.20");
    const segundo = sim.ping(pc1, "192.168.0.20");
    expect(segundo.sucesso).toBe(true);
    expect(segundo.passos.every((p) => p.tipo === "icmp")).toBe(true);
  });

  it("funciona com um cabo direto entre dois PCs", () => {
    let rede = vazia();
    const novo = (tipo: TipoDeDispositivo) => {
      rede = adicionarDispositivo(rede, tipo, 0, 0);
      return rede.dispositivos[rede.dispositivos.length - 1].id;
    };
    const a = novo("pc");
    const b = novo("pc");
    rede = ligar(rede, a, "eth0", b, "eth0");
    rede = configurar(rede, a, "10.0.0.1");
    rede = configurar(rede, b, "10.0.0.2");
    expect(new Simulador(rede).ping(a, "10.0.0.2").sucesso).toBe(true);
  });

  it("falha por ARP sem resposta quando o IP não existe na rede", () => {
    const { rede, pc1 } = doisPcsNumSwitch();
    const resultado = new Simulador(rede).ping(pc1, "192.168.0.99");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.tipo).toBe("sem-resposta");
    expect(resultado.motivo).toContain("ARP");
  });

  it("falha quando o cabo está desligado", () => {
    const { rede, pc1 } = doisPcsNumSwitch();
    const sem = removerCabo(rede, rede.cabos[1].id);
    const resultado = new Simulador(sem).ping(pc1, "192.168.0.20");
    expect(resultado.sucesso).toBe(false);
  });

  it("avisa quando o PC de origem não tem IP", () => {
    const { rede, pc1 } = doisPcsNumSwitch();
    const sem = atualizarInterface(rede, pc1, "eth0", { ip: "", mascara: "" });
    const resultado = new Simulador(sem).ping(pc1, "192.168.0.20");
    expect(resultado.tipo).toBe("erro-local");
    expect(resultado.motivo).toContain("IP");
  });

  it("recusa destino inválido e origem que é switch", () => {
    const { rede, pc1, sw } = doisPcsNumSwitch();
    const sim = new Simulador(rede);
    expect(sim.ping(pc1, "999.1.1.1").tipo).toBe("erro-local");
    expect(sim.ping(sw, "192.168.0.10").tipo).toBe("erro-local");
    expect(sim.ping("inexistente", "192.168.0.10").tipo).toBe("erro-local");
  });

  it("responde ao próprio endereço sem usar a rede", () => {
    const { rede, pc1 } = doisPcsNumSwitch();
    const resultado = new Simulador(rede).ping(pc1, "192.168.0.10");
    expect(resultado.sucesso).toBe(true);
    expect(resultado.passos).toHaveLength(0);
  });
});

describe("máscara e gateway", () => {
  it("a máscara errada faz o destino parecer de outra rede", () => {
    const { rede, pc1 } = doisPcsNumSwitch();
    const errada = configurar(rede, pc1, "192.168.0.10", "255.255.255.252");
    const resultado = new Simulador(errada).ping(pc1, "192.168.0.20");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.motivo).toContain("gateway");
  });

  it("máscara inválida impede o envio", () => {
    const { rede, pc1 } = doisPcsNumSwitch();
    const ruim = configurar(rede, pc1, "192.168.0.10", "255.0.255.0");
    expect(new Simulador(ruim).ping(pc1, "192.168.0.20").tipo).toBe("erro-local");
  });

  it("exige que o gateway esteja na mesma rede", () => {
    const { rede, pc1 } = duasRedesComRoteador();
    const ruim = configurar(rede, pc1, "10.0.1.10", "255.255.255.0", "10.0.9.1");
    const resultado = new Simulador(ruim).ping(pc1, "10.0.2.10");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.motivo).toContain("10.0.9.1");
  });
});

describe("roteamento", () => {
  it("leva o ping de uma rede à outra por um roteador", () => {
    const { rede, pc1, r1 } = duasRedesComRoteador();
    const sim = new Simulador(rede);
    const resultado = sim.ping(pc1, "10.0.2.10");
    expect(resultado.sucesso).toBe(true);
    expect(resultado.de).toBe("10.0.2.10");
    expect(resultado.ttl).toBe(63);
    expect(sim.tabelaArp(r1).map((e) => e.ip).sort()).toEqual(["10.0.1.10", "10.0.2.10"]);
  });

  it("falha sem gateway no PC", () => {
    const { rede, pc1 } = duasRedesComRoteador();
    const sem = configurar(rede, pc1, "10.0.1.10", "255.255.255.0", "");
    const resultado = new Simulador(sem).ping(pc1, "10.0.2.10");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.motivo).toContain("gateway");
  });

  it("falha quando o servidor não tem gateway para responder", () => {
    const { rede, pc1, srv } = duasRedesComRoteador();
    const sem = configurar(rede, srv, "10.0.2.10", "255.255.255.0", "");
    const resultado = new Simulador(sem).ping(pc1, "10.0.2.10");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.descartes.some((d) => d.motivo.includes("gateway"))).toBe(true);
  });

  it("informa destino inacessível quando o roteador não tem rota", () => {
    const { rede, pc1 } = duasRedesComRoteador();
    const resultado = new Simulador(rede).ping(pc1, "172.16.0.5");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.tipo).toBe("inalcancavel");
    expect(resultado.de).toBe("10.0.1.1");
  });

  it("usa rotas estáticas e rota padrão para chegar a redes mais distantes", () => {
    let rede = vazia();
    const novo = (tipo: TipoDeDispositivo) => {
      rede = adicionarDispositivo(rede, tipo, 0, 0);
      return rede.dispositivos[rede.dispositivos.length - 1].id;
    };
    const pc = novo("pc");
    const srv = novo("servidor");
    const r1 = novo("roteador");
    const r2 = novo("roteador");
    rede = ligar(rede, pc, "eth0", r1, "Gi0/0");
    rede = ligar(rede, r1, "Gi0/1", r2, "Gi0/0");
    rede = ligar(rede, r2, "Gi0/1", srv, "eth0");
    rede = configurar(rede, pc, "10.1.0.10", "255.255.255.0", "10.1.0.1");
    rede = configurar(rede, srv, "10.3.0.10", "255.255.255.0", "10.3.0.1");
    rede = configurarPorta(rede, r1, "Gi0/0", "10.1.0.1");
    rede = configurarPorta(rede, r1, "Gi0/1", "10.2.0.1");
    rede = configurarPorta(rede, r2, "Gi0/0", "10.2.0.2");
    rede = configurarPorta(rede, r2, "Gi0/1", "10.3.0.1");

    expect(new Simulador(rede).ping(pc, "10.3.0.10").sucesso).toBe(false);

    const comRotas = atualizarDispositivo(
      atualizarDispositivo(rede, r1, (d) => ({ ...d, rotas: [{ rede: "10.3.0.0", mascara: "255.255.255.0", proximoSalto: "10.2.0.2" }] })),
      r2,
      (d) => ({ ...d, rotas: [{ rede: "0.0.0.0", mascara: "0.0.0.0", proximoSalto: "10.2.0.1" }] }),
    );
    const resultado = new Simulador(comRotas).ping(pc, "10.3.0.10");
    expect(resultado.sucesso).toBe(true);
    expect(resultado.ttl).toBe(62);
  });

  it("escolhe a rota mais específica", () => {
    let rede = vazia();
    const novo = (tipo: TipoDeDispositivo) => {
      rede = adicionarDispositivo(rede, tipo, 0, 0);
      return rede.dispositivos[rede.dispositivos.length - 1].id;
    };
    const pc = novo("pc");
    const r1 = novo("roteador");
    const r2 = novo("roteador");
    const r3 = novo("roteador");
    rede = ligar(rede, pc, "eth0", r1, "Gi0/0");
    rede = ligar(rede, r1, "Gi0/1", r2, "Gi0/0");
    rede = ligar(rede, r1, "Gi0/2", r3, "Gi0/0");
    rede = configurar(rede, pc, "10.1.0.10", "255.255.255.0", "10.1.0.1");
    rede = configurarPorta(rede, r1, "Gi0/0", "10.1.0.1");
    rede = configurarPorta(rede, r1, "Gi0/1", "10.2.0.1");
    rede = configurarPorta(rede, r1, "Gi0/2", "10.4.0.1");
    rede = configurarPorta(rede, r2, "Gi0/0", "10.2.0.2");
    rede = configurarPorta(rede, r3, "Gi0/0", "10.4.0.2");
    rede = atualizarDispositivo(rede, r1, (d) => ({
      ...d,
      rotas: [
        { rede: "0.0.0.0", mascara: "0.0.0.0", proximoSalto: "10.2.0.2" },
        { rede: "10.9.0.0", mascara: "255.255.0.0", proximoSalto: "10.4.0.2" },
      ],
    }));
    rede = atualizarDispositivo(rede, r3, (d) => ({ ...d, rotas: [{ rede: "10.1.0.0", mascara: "255.255.255.0", proximoSalto: "10.4.0.1" }] }));
    const sim = new Simulador(rede);
    const resultado = sim.ping(pc, "10.9.1.1");
    expect(resultado.tipo).toBe("inalcancavel");
    expect(resultado.de).toBe("10.4.0.2");
  });

  it("monta o traceroute salto a salto", () => {
    const { rede, pc1 } = duasRedesComRoteador();
    const resultado = new Simulador(rede).traceroute(pc1, "10.0.2.10");
    expect(resultado.chegou).toBe(true);
    expect(resultado.saltos.map((s) => s.de)).toEqual(["10.0.1.1", "10.0.2.10"]);
  });

  it("encerra o traceroute quando não há rota", () => {
    const { rede, pc1 } = duasRedesComRoteador();
    const resultado = new Simulador(rede).traceroute(pc1, "172.16.0.5");
    expect(resultado.chegou).toBe(false);
    expect(resultado.saltos[0].de).toBe("10.0.1.1");
  });
});

describe("VLANs", () => {
  it("isola portas de VLANs diferentes no mesmo switch", () => {
    const { rede, pc1, sw } = doisPcsNumSwitch();
    const separada = atualizarInterface(rede, sw, "Fa0/2", { vlan: 20 });
    const resultado = new Simulador(separada).ping(pc1, "192.168.0.20");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.tipo).toBe("sem-resposta");
  });

  it("deixa conversar quem está na mesma VLAN", () => {
    const { rede, pc1, sw } = doisPcsNumSwitch();
    const juntas = atualizarInterface(atualizarInterface(rede, sw, "Fa0/1", { vlan: 20 }), sw, "Fa0/2", { vlan: 20 });
    expect(new Simulador(juntas).ping(pc1, "192.168.0.20").sucesso).toBe(true);
  });
});

describe("laços", () => {
  it("detecta pacotes circulando entre switches ligados em anel", () => {
    let rede = vazia();
    const novo = (tipo: TipoDeDispositivo) => {
      rede = adicionarDispositivo(rede, tipo, 0, 0);
      return rede.dispositivos[rede.dispositivos.length - 1].id;
    };
    const pc = novo("pc");
    const a = novo("switch");
    const b = novo("switch");
    rede = ligar(rede, pc, "eth0", a, "Fa0/1");
    rede = ligar(rede, a, "Fa0/2", b, "Fa0/1");
    rede = ligar(rede, a, "Fa0/3", b, "Fa0/2");
    rede = configurar(rede, pc, "10.0.0.1");
    const resultado = new Simulador(rede).ping(pc, "10.0.0.2");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.motivo).toContain("laço");
  });
});

describe("laço de roteamento", () => {
  it("o TTL impede que o pacote circule para sempre", () => {
    let rede = vazia();
    const novo = (tipo: TipoDeDispositivo) => {
      rede = adicionarDispositivo(rede, tipo, 0, 0);
      return rede.dispositivos[rede.dispositivos.length - 1].id;
    };
    const pc = novo("pc");
    const r1 = novo("roteador");
    const r2 = novo("roteador");
    rede = ligar(rede, pc, "eth0", r1, "Gi0/0");
    rede = ligar(rede, r1, "Gi0/1", r2, "Gi0/0");
    rede = configurar(rede, pc, "10.1.0.10", "255.255.255.0", "10.1.0.1");
    rede = configurarPorta(rede, r1, "Gi0/0", "10.1.0.1");
    rede = configurarPorta(rede, r1, "Gi0/1", "10.2.0.1");
    rede = configurarPorta(rede, r2, "Gi0/0", "10.2.0.2");
    rede = atualizarDispositivo(rede, r1, (d) => ({ ...d, rotas: [{ rede: "0.0.0.0", mascara: "0.0.0.0", proximoSalto: "10.2.0.2" }] }));
    rede = atualizarDispositivo(rede, r2, (d) => ({ ...d, rotas: [{ rede: "0.0.0.0", mascara: "0.0.0.0", proximoSalto: "10.2.0.1" }] }));
    const resultado = new Simulador(rede).ping(pc, "8.8.8.8");
    expect(resultado.tipo).toBe("ttl-excedido");
  });
});

describe("auxiliares de montagem", () => {
  it("escolhe a primeira interface livre", () => {
    const { rede, sw } = doisPcsNumSwitch();
    expect(primeiraInterfaceLivre(rede, sw)).toBe("Fa0/3");
    expect(primeiraInterfaceLivre(rede, "nao-existe")).toBeNull();
    let cheio = rede;
    for (const porta of ["Fa0/3", "Fa0/4", "Fa0/5", "Fa0/6"]) {
      const [comPc, extra] = com(cheio, "pc");
      cheio = ligar(comPc, extra, "eth0", sw, porta);
    }
    expect(primeiraInterfaceLivre(cheio, sw)).toBeNull();
  });

  it("encontra uma posição que não colide com os dispositivos existentes", () => {
    let rede = vazia();
    const posicoes: Record<string, { x: number; y: number }> = {};
    for (let i = 0; i < 8; i++) {
      const livre = posicaoLivre(rede, posicoes);
      rede = adicionarDispositivo(rede, "pc", livre.x, livre.y);
    }
    const pontos = rede.dispositivos.map((d) => `${d.x},${d.y}`);
    expect(new Set(pontos).size).toBe(8);
  });
});
