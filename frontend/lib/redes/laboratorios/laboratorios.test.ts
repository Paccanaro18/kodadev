import { describe, expect, it } from "vitest";
import { adicionarCabo, atualizarDispositivo, atualizarInterface } from "../construcao";
import type { Rede } from "../tipos";
import { itemPorSlug, trilhaPorSlug } from "@/lib/trilhas";
import { AULAS_DE_REDES, DESAFIOS_DE_REDES, LABORATORIOS, avaliarObjetivos, laboratorioPorSlug, tudoCumprido } from "./index";

function cabos(rede: Rede, ligacoes: [string, string, string, string][]): Rede {
  let atual = rede;
  for (const [a, ia, b, ib] of ligacoes) {
    const resultado = adicionarCabo(atual, { dispositivo: a, interface: ia }, { dispositivo: b, interface: ib });
    if ("erro" in resultado) throw new Error(resultado.erro);
    atual = resultado.rede;
  }
  return atual;
}

function ip(rede: Rede, id: string, endereco: string, mascara = "255.255.255.0", gateway?: string): Rede {
  const comIp = atualizarInterface(rede, id, "eth0", { ip: endereco, mascara });
  return gateway === undefined ? comIp : atualizarDispositivo(comIp, id, (d) => ({ ...d, gateway }));
}

const SOLUCOES: Record<string, (rede: Rede) => Rede> = {
  "primeiro-cabo": (rede) => ip(ip(cabos(rede, [["pc-1", "eth0", "pc-2", "eth0"]]), "pc-1", "192.168.0.10"), "pc-2", "192.168.0.20"),
  "switch-e-tabela-mac": (rede) => cabos(rede, [
    ["pc-1", "eth0", "switch-1", "Fa0/1"], ["pc-2", "eth0", "switch-1", "Fa0/2"], ["pc-3", "eth0", "switch-1", "Fa0/3"],
  ]),
  "gateway-e-roteador": (rede) => ip(ip(rede, "pc-1", "10.0.1.10", "255.255.255.0", "10.0.1.1"), "servidor-1", "10.0.2.10", "255.255.255.0", "10.0.2.1"),
  "mascara-que-nao-fecha": (rede) => ip(ip(rede, "pc-1", "192.168.1.10"), "pc-3", "192.168.1.30"),
  "vlan-trocada": (rede) => atualizarInterface(rede, "switch-1", "Fa0/4", { vlan: 20 }),
  "filial-sem-rota": (rede) => atualizarDispositivo(
    atualizarDispositivo(rede, "roteador-1", (d) => ({ ...d, rotas: [{ rede: "10.3.0.0", mascara: "255.255.255.0", proximoSalto: "10.2.0.2" }] })),
    "roteador-2",
    (d) => ({ ...d, rotas: [{ rede: "10.1.0.0", mascara: "255.255.255.0", proximoSalto: "10.2.0.1" }] }),
  ),
};

describe("laboratórios de redes", () => {
  it("tem identificadores únicos e válidos para o servidor", () => {
    const slugs = LABORATORIOS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(AULAS_DE_REDES.every((l) => l.tipo === "aula")).toBe(true);
    expect(DESAFIOS_DE_REDES.every((l) => l.tipo === "desafio")).toBe(true);
  });

  it("liga cada laboratório a um módulo que existe na trilha Redes de computadores", () => {
    const trilha = trilhaPorSlug("redes-de-computadores")!;
    for (const lab of LABORATORIOS) {
      expect(itemPorSlug(trilha, lab.moduloDaTrilha)?.tipo, lab.slug).toBe("modulo");
    }
  });

  it("encontra o laboratório pelo slug", () => {
    expect(laboratorioPorSlug("vlan-trocada")?.titulo).toContain("VLAN");
    expect(laboratorioPorSlug("nao-existe")).toBeUndefined();
  });

  it("cada laboratório começa incompleto e termina completo com a solução", () => {
    for (const lab of LABORATORIOS) {
      const solucao = SOLUCOES[lab.slug];
      expect(solucao, `solução de ${lab.slug}`).toBeDefined();
      expect(tudoCumprido(avaliarObjetivos(lab.redeInicial, lab.objetivos)), `${lab.slug} inicial`).toBe(false);
      const resolvida = avaliarObjetivos(solucao(lab.redeInicial), lab.objetivos);
      expect(resolvida.filter((r) => !r.cumprido), `${lab.slug} resolvido`).toEqual([]);
    }
  });

  it("os desafios já vêm com a topologia ligada", () => {
    for (const lab of DESAFIOS_DE_REDES) {
      expect(lab.redeInicial.cabos.length).toBeGreaterThan(0);
    }
  });

  it("a resolução parcial não conclui o laboratório", () => {
    const lab = laboratorioPorSlug("mascara-que-nao-fecha")!;
    const parcial = ip(lab.redeInicial, "pc-1", "192.168.1.10");
    const resultados = avaliarObjetivos(parcial, lab.objetivos);
    expect(tudoCumprido(resultados)).toBe(false);
    expect(resultados.some((r) => r.cumprido)).toBe(true);
  });

  it("trocar a máscara do PC1 para /16 sem corrigir o PC3 não resolve", () => {
    const lab = laboratorioPorSlug("mascara-que-nao-fecha")!;
    const esperto = ip(lab.redeInicial, "pc-1", "192.168.1.10", "255.255.0.0");
    expect(tudoCumprido(avaliarObjetivos(esperto, lab.objetivos))).toBe(false);
  });

  it("o isolamento das VLANs é parte do objetivo", () => {
    const lab = laboratorioPorSlug("vlan-trocada")!;
    const tudoNaMesma = [1, 2, 3, 4].reduce((rede, n) => atualizarInterface(rede, "switch-1", `Fa0/${n}`, { vlan: 10 }), lab.redeInicial);
    const unida = [3, 4].reduce((rede, n) => atualizarInterface(rede, `pc-${n}`, "eth0", { ip: `10.10.0.${10 + n}` }), tudoNaMesma);
    const resultados = avaliarObjetivos(unida, lab.objetivos);
    expect(resultados[2].cumprido).toBe(false);
    expect(resultados[2].detalhe).toContain("comunicação");
  });

  it("mostra o motivo quando o ping falha", () => {
    const lab = laboratorioPorSlug("gateway-e-roteador")!;
    const resultados = avaliarObjetivos(lab.redeInicial, lab.objetivos);
    expect(resultados[0].cumprido).toBe(false);
    expect(resultados[0].detalhe).toContain("gateway");
  });

  it("diz quando o dispositivo de um objetivo não existe", () => {
    const resultados = avaliarObjetivos({ dispositivos: [], cabos: [] }, [
      { tipo: "ip", dispositivo: "pc-9", naRede: { rede: "10.0.0.0", mascara: "255.255.255.0" }, descricao: "ip" },
      { tipo: "ping", de: "pc-1", para: "pc-2", descricao: "ping" },
      { tipo: "existe", dispositivo: "roteador", minimo: 1, descricao: "existe" },
    ]);
    expect(resultados.map((r) => r.cumprido)).toEqual([false, false, false]);
    expect(tudoCumprido([])).toBe(false);
  });
});
