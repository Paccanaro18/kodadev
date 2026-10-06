import { describe, expect, it } from "vitest";
import { laboratorioPorSlug } from "./laboratorios";
import { Simulador } from "./simulador";
import { executarComando } from "./terminal";

function usar(slug: string) {
  const rede = laboratorioPorSlug(slug)!.redeInicial;
  const simulador = new Simulador(rede);
  return (dispositivo: string, linha: string) => executarComando(rede, simulador, dispositivo, linha);
}

describe("terminal dos dispositivos", () => {
  it("mostra a configuração IP do PC", () => {
    const executar = usar("gateway-e-roteador");
    const texto = executar("pc-1", "ipconfig").linhas.join("\n");
    expect(texto).toContain("10.0.1.10");
    expect(texto).toContain("255.255.255.0");
    expect(texto).toContain("(não configurado)");
  });

  it("faz quatro pings e informa a falha com diagnóstico", () => {
    const executar = usar("gateway-e-roteador");
    const saida = executar("pc-1", "ping 10.0.2.10");
    expect(saida.linhas.filter((l) => l.startsWith("Falha geral"))).toHaveLength(4);
    expect(saida.linhas.join("\n")).toContain("perdidos = 4 (100% de perda)");
    expect(saida.linhas.join("\n")).toContain("Diagnóstico:");
  });

  it("mostra respostas com TTL quando há conectividade", () => {
    const rede = laboratorioPorSlug("switch-e-tabela-mac")!.redeInicial;
    const montada = {
      ...rede,
      cabos: [
        { id: "cabo-1", a: { dispositivo: "pc-1", interface: "eth0" }, b: { dispositivo: "switch-1", interface: "Fa0/1" } },
        { id: "cabo-2", a: { dispositivo: "pc-3", interface: "eth0" }, b: { dispositivo: "switch-1", interface: "Fa0/3" } },
      ],
    };
    const simulador = new Simulador(montada);
    const saida = executarComando(montada, simulador, "pc-1", "ping 192.168.10.13");
    expect(saida.linhas.filter((l) => l.includes("TTL=128"))).toHaveLength(4);
    expect(saida.passos.some((p) => p.tipo === "arp")).toBe(true);
    expect(executarComando(montada, simulador, "pc-1", "arp -a").linhas.join("\n")).toContain("192.168.10.13");
    expect(executarComando(montada, simulador, "switch-1", "show mac address-table").linhas).toHaveLength(3);
  });

  it("lista as rotas e interfaces do roteador", () => {
    const executar = usar("filial-sem-rota");
    expect(executar("roteador-1", "show ip route").linhas.join("\n")).toContain("C    10.1.0.0/24");
    expect(executar("roteador-1", "show ip interface brief").linhas.join("\n")).toContain("Gi0/1");
    expect(executar("roteador-1", "show arp").linhas).toEqual(["Tabela ARP vazia."]);
  });

  it("mostra as portas por VLAN no switch", () => {
    const executar = usar("vlan-trocada");
    const texto = executar("switch-1", "show vlan brief").linhas.join("\n");
    expect(texto).toContain("10");
    expect(texto).toContain("Fa0/4");
    expect(executar("switch-1", "show interfaces status").linhas.join("\n")).toContain("conectada");
  });

  it("faz traceroute e mostra onde o rastreio parou", () => {
    const rede = laboratorioPorSlug("filial-sem-rota")!.redeInicial;
    const saida = executarComando(rede, new Simulador(rede), "pc-1", "tracert 10.3.0.10");
    expect(saida.linhas.join("\n")).toContain("O destino não foi alcançado.");
    expect(saida.linhas.join("\n")).toContain("10.1.0.1");
  });

  it("trata ajuda, limpar, comando vazio e comando desconhecido", () => {
    const executar = usar("gateway-e-roteador");
    expect(executar("pc-1", "help").linhas[0]).toContain("Comandos");
    expect(executar("roteador-1", "help").linhas.join("\n")).toContain("show ip route");
    expect(executar("switch-1", "help").linhas.join("\n")).toContain("mac address-table");
    expect(executar("pc-1", "clear").limpar).toBe(true);
    expect(executar("pc-1", "   ").linhas).toEqual([]);
    expect(executar("pc-1", "formatar c:").linhas[0]).toContain("não reconhecido");
    expect(executar("pc-1", "ping").linhas[0]).toContain("Uso:");
    expect(executar("fantasma", "ping 1.1.1.1").linhas[0]).toContain("não encontrado");
  });
});
