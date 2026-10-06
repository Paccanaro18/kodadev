import { adicionarCabo, criarDispositivo } from "./construcao";
import type { RegistroDns, Rede, ServicoDhcp, TipoDeDispositivo } from "./tipos";

type Config = {
  ip?: string;
  mascara?: string;
  gateway?: string;
  portas?: Record<string, { ip?: string; mascara?: string; vlan?: number }>;
  rotas?: { rede: string; mascara: string; proximoSalto: string }[];
  dhcp?: boolean;
  dns?: string;
  servicoDhcp?: Partial<ServicoDhcp> & { ativo: boolean };
  servicoDns?: { ativo: boolean; registros: RegistroDns[] };
};

export type DispositivoDoRascunho = {
  tipo: TipoDeDispositivo;
  numero: number;
  x: number;
  y: number;
  config?: Config;
};

export type CaboDoRascunho = [string, string, string, string];

export function construirRede(dispositivos: DispositivoDoRascunho[], cabos: CaboDoRascunho[] = []): Rede {
  let rede: Rede = {
    dispositivos: dispositivos.map((d) => {
      const base = criarDispositivo(d.tipo, d.numero, d.x, d.y);
      const config = d.config ?? {};
      return {
        ...base,
        gateway: config.gateway ?? "",
        rotas: config.rotas ?? [],
        ...(d.tipo === "pc" || d.tipo === "servidor" ? { usaDhcp: config.dhcp ?? false, dnsServidor: config.dns ?? "" } : {}),
        ...(d.tipo === "servidor" ? {
          servicos: {
            dhcp: { ...base.servicos!.dhcp, ...config.servicoDhcp },
            dns: config.servicoDns ?? base.servicos!.dns,
          },
        } : {}),
        interfaces: base.interfaces.map((i, indice) => {
          const porta = config.portas?.[i.nome];
          const principal = indice === 0 && (d.tipo === "pc" || d.tipo === "servidor");
          return {
            ...i,
            ip: porta?.ip ?? (principal ? config.ip ?? "" : ""),
            mascara: porta?.mascara ?? (porta?.ip || (principal && config.ip) ? config.mascara ?? "255.255.255.0" : ""),
            vlan: porta?.vlan ?? 1,
          };
        }),
      };
    }),
    cabos: [],
  };
  for (const [a, ia, b, ib] of cabos) {
    const resultado = adicionarCabo(rede, { dispositivo: a, interface: ia }, { dispositivo: b, interface: ib });
    if ("erro" in resultado) throw new Error(`Rascunho inválido: ${resultado.erro}`);
    rede = resultado.rede;
  }
  return rede;
}
