export type TipoDeDispositivo = "pc" | "servidor" | "switch" | "roteador";

export type Interface = {
  nome: string;
  mac: string;
  ip: string;
  mascara: string;
  vlan: number;
};

export type Rota = {
  rede: string;
  mascara: string;
  proximoSalto: string;
};

export type Dispositivo = {
  id: string;
  nome: string;
  tipo: TipoDeDispositivo;
  interfaces: Interface[];
  gateway: string;
  rotas: Rota[];
  x: number;
  y: number;
};

export type Ponta = {
  dispositivo: string;
  interface: string;
};

export type Cabo = {
  id: string;
  a: Ponta;
  b: Ponta;
};

export type Rede = {
  dispositivos: Dispositivo[];
  cabos: Cabo[];
};

export const MAC_DE_TRANSMISSAO = "ff:ff:ff:ff:ff:ff";

export type CargaArp = {
  tipo: "arp";
  operacao: "pedido" | "resposta";
  ipOrigem: string;
  macOrigem: string;
  ipAlvo: string;
};

export type TipoIcmp = "echo" | "resposta" | "inalcancavel" | "ttl-excedido";

export type CargaIp = {
  tipo: "ip";
  origem: string;
  destino: string;
  ttl: number;
  icmp: TipoIcmp;
  identificador: number;
};

export type Quadro = {
  origemMac: string;
  destinoMac: string;
  vlan: number;
  carga: CargaArp | CargaIp;
};

export type Passo = {
  caboId: string;
  de: Ponta;
  para: Ponta;
  tipo: "arp" | "icmp";
  rotulo: string;
};

export type Descarte = {
  dispositivo: string;
  motivo: string;
};

export type ResultadoDoPing = {
  sucesso: boolean;
  tipo: "resposta" | "inalcancavel" | "ttl-excedido" | "sem-resposta" | "erro-local";
  de: string | null;
  ttl: number | null;
  motivo: string;
  passos: Passo[];
  descartes: Descarte[];
};

export type SaltoDoTraceroute = {
  salto: number;
  de: string | null;
  chegou: boolean;
};

export type ResultadoDoTraceroute = {
  saltos: SaltoDoTraceroute[];
  chegou: boolean;
  passos: Passo[];
};

export type EntradaDeArp = { ip: string; mac: string };
export type EntradaDeMac = { vlan: number; mac: string; porta: string };

export const TIPOS_DE_DISPOSITIVO: { tipo: TipoDeDispositivo; rotulo: string }[] = [
  { tipo: "pc", rotulo: "PC" },
  { tipo: "servidor", rotulo: "Servidor" },
  { tipo: "switch", rotulo: "Switch" },
  { tipo: "roteador", rotulo: "Roteador" },
];

export function ehHost(tipo: TipoDeDispositivo): boolean {
  return tipo === "pc" || tipo === "servidor";
}
