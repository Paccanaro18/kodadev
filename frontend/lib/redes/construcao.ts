import { ehHost, type Cabo, type Dispositivo, type Interface, type Ponta, type Rede, type Servicos, type TipoDeDispositivo } from "./tipos";

const CODIGO_DO_TIPO: Record<TipoDeDispositivo, number> = { pc: 1, servidor: 2, switch: 3, roteador: 4 };
const ROTULO_DO_TIPO: Record<TipoDeDispositivo, string> = { pc: "PC", servidor: "Servidor", switch: "Switch", roteador: "Roteador" };

function hex(valor: number): string {
  return valor.toString(16).padStart(2, "0");
}

function nomesDasInterfaces(tipo: TipoDeDispositivo): string[] {
  if (ehHost(tipo)) return ["eth0"];
  if (tipo === "switch") return [1, 2, 3, 4, 5, 6].map((n) => `Fa0/${n}`);
  return [0, 1, 2].map((n) => `Gi0/${n}`);
}

export function servicosPadrao(): Servicos {
  return {
    dhcp: { ativo: false, inicio: "", fim: "", mascara: "255.255.255.0", gateway: "", dns: "" },
    dns: { ativo: false, registros: [] },
  };
}

export function criarInterfaces(tipo: TipoDeDispositivo, numero: number): Interface[] {
  return nomesDasInterfaces(tipo).map((nome, indice) => ({
    nome,
    mac: `02:00:00:${hex(CODIGO_DO_TIPO[tipo])}:${hex(numero)}:${hex(indice)}`,
    ip: "",
    mascara: "",
    vlan: 1,
  }));
}

export function proximoNumero(rede: Rede, tipo: TipoDeDispositivo): number {
  const usados = rede.dispositivos.filter((d) => d.tipo === tipo).map((d) => Number(d.id.split("-")[1]));
  return usados.length === 0 ? 1 : Math.max(...usados) + 1;
}

export function criarDispositivo(tipo: TipoDeDispositivo, numero: number, x: number, y: number): Dispositivo {
  return {
    id: `${tipo}-${numero}`,
    nome: `${ROTULO_DO_TIPO[tipo]}${numero}`,
    tipo,
    interfaces: criarInterfaces(tipo, numero),
    gateway: "",
    rotas: [],
    x,
    y,
    ...(ehHost(tipo) ? { usaDhcp: false, dnsServidor: "" } : {}),
    ...(tipo === "servidor" ? { servicos: servicosPadrao() } : {}),
  };
}

export function adicionarDispositivo(rede: Rede, tipo: TipoDeDispositivo, x: number, y: number): Rede {
  const dispositivo = criarDispositivo(tipo, proximoNumero(rede, tipo), x, y);
  return { ...rede, dispositivos: [...rede.dispositivos, dispositivo] };
}

export function removerDispositivo(rede: Rede, id: string): Rede {
  return {
    dispositivos: rede.dispositivos.filter((d) => d.id !== id),
    cabos: rede.cabos.filter((c) => c.a.dispositivo !== id && c.b.dispositivo !== id),
  };
}

export function atualizarDispositivo(rede: Rede, id: string, mudar: (d: Dispositivo) => Dispositivo): Rede {
  return { ...rede, dispositivos: rede.dispositivos.map((d) => (d.id === id ? mudar(d) : d)) };
}

export function atualizarInterface(rede: Rede, id: string, interfaceNome: string, mudanca: Partial<Interface>): Rede {
  return atualizarDispositivo(rede, id, (d) => ({
    ...d,
    interfaces: d.interfaces.map((i) => (i.nome === interfaceNome ? { ...i, ...mudanca } : i)),
  }));
}

export function interfaceOcupada(rede: Rede, ponta: Ponta): boolean {
  return rede.cabos.some(
    (c) => (c.a.dispositivo === ponta.dispositivo && c.a.interface === ponta.interface)
      || (c.b.dispositivo === ponta.dispositivo && c.b.interface === ponta.interface),
  );
}

export type ResultadoDeCabo = { rede: Rede } | { erro: string };

export function adicionarCabo(rede: Rede, a: Ponta, b: Ponta): ResultadoDeCabo {
  if (a.dispositivo === b.dispositivo) return { erro: "Um cabo precisa ligar dois dispositivos diferentes." };
  for (const ponta of [a, b]) {
    const dispositivo = rede.dispositivos.find((d) => d.id === ponta.dispositivo);
    if (!dispositivo?.interfaces.some((i) => i.nome === ponta.interface)) return { erro: "Interface inexistente." };
    if (interfaceOcupada(rede, ponta)) return { erro: `${dispositivo.nome} ${ponta.interface} já tem um cabo.` };
  }
  const numero = Math.max(0, ...rede.cabos.map((c) => Number(c.id.split("-")[1]) || 0)) + 1;
  const cabo: Cabo = { id: `cabo-${numero}`, a, b };
  return { rede: { ...rede, cabos: [...rede.cabos, cabo] } };
}

export function removerCabo(rede: Rede, id: string): Rede {
  return { ...rede, cabos: rede.cabos.filter((c) => c.id !== id) };
}

export function ligados(rede: Rede, a: string, b: string): boolean {
  return rede.cabos.some(
    (c) => (c.a.dispositivo === a && c.b.dispositivo === b) || (c.a.dispositivo === b && c.b.dispositivo === a),
  );
}

export function primeiraInterfaceLivre(rede: Rede, dispositivoId: string): string | null {
  const dispositivo = rede.dispositivos.find((d) => d.id === dispositivoId);
  const livre = dispositivo?.interfaces.find((i) => !interfaceOcupada(rede, { dispositivo: dispositivoId, interface: i.nome }));
  return livre?.nome ?? null;
}

export type Posicao = { x: number; y: number };

export function posicaoLivre(rede: Rede, posicoes: Record<string, Posicao>): Posicao {
  const ocupadas = rede.dispositivos.map((d) => posicoes[d.id] ?? { x: d.x, y: d.y });
  for (let linha = 0; linha < 20; linha++) {
    for (let coluna = 0; coluna < 6; coluna++) {
      const candidata = { x: 40 + coluna * 160, y: 30 + linha * 140 };
      if (ocupadas.every((o) => Math.abs(o.x - candidata.x) > 120 || Math.abs(o.y - candidata.y) > 110)) return candidata;
    }
  }
  return { x: 40, y: 30 };
}
