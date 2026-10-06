import { describe, expect, it } from "vitest";
import { construirRede } from "./rascunho";
import { Simulador } from "./simulador";
import { executarComando } from "./terminal";
import type { Rede } from "./tipos";

const POOL = { ativo: true, inicio: "192.168.50.100", fim: "192.168.50.102", mascara: "255.255.255.0", gateway: "192.168.50.1", dns: "192.168.50.2" };

function redeComDhcp(extra: { pool?: Partial<typeof POOL>; semCabo?: boolean } = {}): Rede {
  const cabos: [string, string, string, string][] = [
    ["servidor-1", "eth0", "switch-1", "Fa0/1"],
    ["pc-1", "eth0", "switch-1", "Fa0/2"],
    ["pc-2", "eth0", "switch-1", "Fa0/3"],
  ];
  return construirRede(
    [
      { tipo: "switch", numero: 1, x: 0, y: 0 },
      { tipo: "servidor", numero: 1, x: 0, y: 0, config: { ip: "192.168.50.2", servicoDhcp: { ...POOL, ...extra.pool } } },
      { tipo: "pc", numero: 1, x: 0, y: 0, config: { dhcp: true } },
      { tipo: "pc", numero: 2, x: 0, y: 0, config: { dhcp: true } },
    ],
    extra.semCabo ? cabos.slice(0, 2) : cabos,
  );
}

describe("DHCP", () => {
  it("entrega endereços do pool, com máscara, gateway e DNS, e os clientes passam a se alcançar", () => {
    const sim = new Simulador(redeComDhcp());
    const a = sim.configuracaoDe("pc-1");
    const b = sim.configuracaoDe("pc-2");
    expect(a).toMatchObject({ ip: "192.168.50.100", mascara: "255.255.255.0", gateway: "192.168.50.1", dns: "192.168.50.2", origem: "dhcp", servidorDhcp: "192.168.50.2" });
    expect(b.ip).toBe("192.168.50.101");
    expect(sim.ping("pc-1", "192.168.50.101").sucesso).toBe(true);
    expect(sim.arrendamentosDo("servidor-1")).toHaveLength(2);
  });

  it("registra os quatro quadros da conversa DHCP", () => {
    const sim = new Simulador(redeComDhcp());
    const rotulos = sim.resultadoDoDhcp("pc-1")!.passos.filter((p) => p.tipo === "dhcp").map((p) => p.rotulo.split(":")[0]);
    for (const fase of ["DHCP discover", "DHCP offer", "DHCP request", "DHCP ack"]) expect(rotulos).toContain(fase);
    expect(sim.resultadoDoDhcp("pc-1")!.sucesso).toBe(true);
  });

  it("nunca entrega um endereço que já está em uso por outro dispositivo", () => {
    const sim = new Simulador(redeComDhcp({ pool: { inicio: "192.168.50.2", fim: "192.168.50.4" } }));
    expect(sim.configuracaoDe("pc-1").ip).toBe("192.168.50.3");
    expect(sim.configuracaoDe("pc-2").ip).toBe("192.168.50.4");
  });

  it("deixa o cliente com endereço automático quando o pool esgota", () => {
    const sim = new Simulador(redeComDhcp({ pool: { fim: "192.168.50.100" } }));
    expect(sim.configuracaoDe("pc-1").origem).toBe("dhcp");
    const segundo = sim.configuracaoDe("pc-2");
    expect(segundo.origem).toBe("apipa");
    expect(segundo.ip).toMatch(/^169\.254\./);
    expect(segundo.mascara).toBe("255.255.0.0");
    expect(sim.resultadoDoDhcp("pc-2")!.motivo).toContain("esgotado");
  });

  it("não concede nada com o serviço desligado ou sem cabo até o servidor", () => {
    expect(new Simulador(redeComDhcp({ pool: { ativo: false } })).configuracaoDe("pc-1").origem).toBe("apipa");
    const semCabo = new Simulador(redeComDhcp({ semCabo: true }));
    expect(semCabo.configuracaoDe("pc-2").origem).toBe("apipa");
    expect(semCabo.resultadoDoDhcp("pc-2")!.motivo).toContain("não tem cabo");
  });

  it("o endereço automático não alcança a rede do servidor", () => {
    const sim = new Simulador(redeComDhcp({ pool: { ativo: false } }));
    expect(sim.ping("pc-1", "192.168.50.2").sucesso).toBe(false);
  });

  it("não atravessa roteador: sem relay, o cliente de outra rede fica sem endereço", () => {
    const rede = construirRede(
      [
        { tipo: "servidor", numero: 1, x: 0, y: 0, config: { ip: "10.0.1.2", servicoDhcp: { ...POOL, inicio: "10.0.1.100", fim: "10.0.1.110" } } },
        { tipo: "roteador", numero: 1, x: 0, y: 0, config: { portas: { "Gi0/0": { ip: "10.0.1.1" }, "Gi0/1": { ip: "10.0.2.1" } } } },
        { tipo: "pc", numero: 1, x: 0, y: 0, config: { dhcp: true } },
      ],
      [["servidor-1", "eth0", "roteador-1", "Gi0/0"], ["pc-1", "eth0", "roteador-1", "Gi0/1"]],
    );
    expect(new Simulador(rede).configuracaoDe("pc-1").origem).toBe("apipa");
  });

  it("não mexe nos dispositivos com endereço fixo", () => {
    const sim = new Simulador(redeComDhcp());
    expect(sim.configuracaoDe("servidor-1")).toMatchObject({ ip: "192.168.50.2", origem: "estatica", servidorDhcp: null });
    expect(sim.resultadoDoDhcp("servidor-1")).toBeNull();
  });
});

function redeComDns(extra: { dnsNoCliente?: string; registro?: string; ativo?: boolean } = {}): Rede {
  return construirRede(
    [
      { tipo: "switch", numero: 1, x: 0, y: 0 },
      { tipo: "pc", numero: 1, x: 0, y: 0, config: { ip: "10.0.0.10", dns: extra.dnsNoCliente ?? "10.0.0.2" } },
      {
        tipo: "servidor", numero: 1, x: 0, y: 0,
        config: { ip: "10.0.0.2", servicoDns: { ativo: extra.ativo ?? true, registros: [{ nome: "loja.koda.local", ip: extra.registro ?? "10.0.0.30" }] } },
      },
      { tipo: "servidor", numero: 2, x: 0, y: 0, config: { ip: "10.0.0.30" } },
    ],
    [["pc-1", "eth0", "switch-1", "Fa0/1"], ["servidor-1", "eth0", "switch-1", "Fa0/2"], ["servidor-2", "eth0", "switch-1", "Fa0/3"]],
  );
}

describe("DNS", () => {
  it("resolve um nome consultando o servidor DNS e mostra a pergunta e a resposta", () => {
    const resultado = new Simulador(redeComDns()).resolverNome("pc-1", "loja.koda.local");
    expect(resultado).toMatchObject({ sucesso: true, ip: "10.0.0.30", servidor: "10.0.0.2" });
    expect([...new Set(resultado.passos.filter((p) => p.tipo === "dns").map((p) => p.rotulo))]).toEqual([
      "DNS: qual o IP de loja.koda.local? (10.0.0.10 → 10.0.0.2)",
      "DNS: loja.koda.local é 10.0.0.30",
    ]);
  });

  it("ignora maiúsculas e espaços no nome", () => {
    expect(new Simulador(redeComDns()).resolverNome("pc-1", "LOJA.Koda.Local ").ip).toBe("10.0.0.30");
  });

  it("explica quando o nome não existe, quando falta servidor DNS e quando o serviço está desligado", () => {
    const sim = new Simulador(redeComDns());
    expect(sim.resolverNome("pc-1", "outro.koda.local").motivo).toContain("não existe");
    expect(new Simulador(redeComDns({ dnsNoCliente: "" })).resolverNome("pc-1", "loja.koda.local").motivo).toContain("nenhum servidor DNS");
    expect(new Simulador(redeComDns({ ativo: false })).resolverNome("pc-1", "loja.koda.local").motivo).toContain("serviço DNS");
    expect(new Simulador(redeComDns({ dnsNoCliente: "10.0.0.99" })).resolverNome("pc-1", "loja.koda.local").sucesso).toBe(false);
    expect(sim.resolverNome("switch-1", "x").motivo).toContain("não resolve");
  });

  it("resolve através de um roteador, usando o gateway", () => {
    const rede = construirRede(
      [
        { tipo: "pc", numero: 1, x: 0, y: 0, config: { ip: "10.0.1.10", gateway: "10.0.1.1", dns: "10.0.2.2" } },
        { tipo: "roteador", numero: 1, x: 0, y: 0, config: { portas: { "Gi0/0": { ip: "10.0.1.1" }, "Gi0/1": { ip: "10.0.2.1" } } } },
        { tipo: "servidor", numero: 1, x: 0, y: 0, config: { ip: "10.0.2.2", gateway: "10.0.2.1", servicoDns: { ativo: true, registros: [{ nome: "app.local", ip: "10.0.2.9" }] } } },
      ],
      [["pc-1", "eth0", "roteador-1", "Gi0/0"], ["servidor-1", "eth0", "roteador-1", "Gi0/1"]],
    );
    expect(new Simulador(rede).resolverNome("pc-1", "app.local").ip).toBe("10.0.2.9");
  });

  it("o cliente DHCP recebe o DNS junto com o endereço", () => {
    const rede = redeComDhcp({ pool: { dns: "192.168.50.2" } });
    const servidor = rede.dispositivos.find((d) => d.id === "servidor-1")!;
    servidor.servicos!.dns = { ativo: true, registros: [{ nome: "wiki.local", ip: "192.168.50.2" }] };
    expect(new Simulador(rede).resolverNome("pc-1", "wiki.local").ip).toBe("192.168.50.2");
  });
});

describe("terminal com DHCP e DNS", () => {
  function terminal(rede: Rede) {
    const sim = new Simulador(rede);
    return (id: string, linha: string) => executarComando(rede, sim, id, linha);
  }

  it("mostra o endereço recebido no ipconfig e renova a concessão", () => {
    const executar = terminal(redeComDhcp());
    const texto = executar("pc-1", "ipconfig").linhas.join("\n");
    expect(texto).toContain("DHCP habilitado . . . . : Sim");
    expect(texto).toContain("192.168.50.100");
    expect(texto).toContain("Servidor DNS  . . . . . : 192.168.50.2");
    const renovar = executar("pc-1", "ipconfig /renew");
    expect(renovar.linhas.join("\n")).toContain("Endereço 192.168.50.100 concedido por 192.168.50.2");
    expect(renovar.passos.length).toBeGreaterThan(0);
  });

  it("avisa sobre endereço automático e sobre interface de endereço fixo", () => {
    const executar = terminal(redeComDhcp({ pool: { ativo: false } }));
    expect(executar("pc-1", "ipconfig").linhas.join("\n")).toContain("nenhum servidor DHCP respondeu");
    expect(executar("pc-1", "ipconfig /renew").linhas.join("\n")).toContain("Falha:");
    expect(executar("servidor-1", "ipconfig /renew").linhas[0]).toContain("endereço fixo");
  });

  it("lista as concessões no servidor", () => {
    const executar = terminal(redeComDhcp());
    expect(executar("servidor-1", "dhcp leases").linhas).toHaveLength(3);
    expect(terminal(redeComDhcp({ pool: { ativo: false } }))("servidor-1", "dhcp leases").linhas).toEqual(["Nenhuma concessão DHCP ativa."]);
  });

  it("resolve nomes com nslookup e ping, e explica as falhas", () => {
    const executar = terminal(redeComDns());
    expect(executar("pc-1", "nslookup loja.koda.local").linhas.join("\n")).toContain("Endereço:  10.0.0.30");
    const ping = executar("pc-1", "ping loja.koda.local");
    expect(ping.linhas[0]).toBe("Disparando contra loja.koda.local [10.0.0.30] com 32 bytes de dados:");
    expect(ping.linhas.filter((l) => l.includes("Resposta de 10.0.0.30"))).toHaveLength(4);
    expect(ping.passos.some((p) => p.tipo === "dns")).toBe(true);

    const falha = executar("pc-1", "ping nada.local");
    expect(falha.linhas[0]).toContain("Não foi possível encontrar o host nada.local");
    expect(falha.linhas.join("\n")).toContain("não existe");
    expect(executar("pc-1", "nslookup nada.local").linhas[0]).toContain("Não foi possível resolver");
    expect(executar("pc-1", "nslookup").linhas[0]).toContain("Uso:");
  });

  it("ping por IP continua funcionando", () => {
    expect(terminal(redeComDns())("pc-1", "ping 10.0.0.30").linhas.filter((l) => l.includes("TTL=64"))).toHaveLength(4);
  });
});
