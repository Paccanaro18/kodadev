import { analisarIp, ipValido, mesmaRede, prefixoDaMascara, redeDe } from "./ip";
import {
  MAC_DE_TRANSMISSAO, ehHost,
  type CargaArp, type CargaIp, type Descarte, type Dispositivo, type EntradaDeArp, type EntradaDeMac, type Interface,
  type Passo, type Ponta, type Quadro, type Rede, type ResultadoDoPing, type ResultadoDoTraceroute, type SaltoDoTraceroute,
  type TipoIcmp,
} from "./tipos";

const LIMITE_DE_PASSOS = 300;
const TTL_INICIAL: Record<Dispositivo["tipo"], number> = { pc: 128, servidor: 64, switch: 0, roteador: 255 };

type Entrega = { dispositivo: Dispositivo; interfaceNome: string; quadro: Quadro };
type Pendente = { interfaceNome: string; pacote: CargaIp };

type Execucao = {
  origemId: string;
  passos: Passo[];
  descartes: Descarte[];
  fila: Entrega[];
  pendentes: Map<string, Pendente[]>;
  recebidos: CargaIp[];
  estourou: boolean;
};

type Caminho = { interfaceNome: string; proximoSalto: string } | { erro: string };

function novaExecucao(origemId: string): Execucao {
  return { origemId, passos: [], descartes: [], fila: [], pendentes: new Map(), recebidos: [], estourou: false };
}

export class Simulador {
  private readonly dispositivos: Map<string, Dispositivo>;
  private readonly arp = new Map<string, Map<string, string>>();
  private readonly macs = new Map<string, Map<string, string>>();
  private proximoIdentificador = 1;

  constructor(private readonly rede: Rede) {
    this.dispositivos = new Map(rede.dispositivos.map((d) => [d.id, d]));
  }

  tabelaArp(dispositivoId: string): EntradaDeArp[] {
    return [...(this.arp.get(dispositivoId) ?? new Map()).entries()].map(([ip, mac]) => ({ ip, mac }));
  }

  tabelaMac(dispositivoId: string): EntradaDeMac[] {
    return [...(this.macs.get(dispositivoId) ?? new Map()).entries()].map(([chave, porta]) => {
      const [vlan, mac] = chave.split("|");
      return { vlan: Number(vlan), mac, porta };
    });
  }

  ping(origemId: string, destino: string, ttl?: number): ResultadoDoPing {
    const origem = this.dispositivos.get(origemId);
    if (!origem || origem.tipo === "switch") return this.falhaLocal("Este dispositivo não envia pacotes IP.");
    if (!ipValido(destino)) return this.falhaLocal(`Endereço de destino inválido: ${destino}`);
    if (origem.interfaces.some((i) => i.ip === destino)) {
      return { sucesso: true, tipo: "resposta", de: destino, ttl: TTL_INICIAL[origem.tipo], motivo: "Resposta do próprio dispositivo.", passos: [], descartes: [] };
    }

    const execucao = novaExecucao(origem.id);
    const ipDeOrigem = this.ipDeSaida(origem, destino);
    if (!ipDeOrigem) {
      return this.falhaLocal(`${origem.nome}: sem endereço IP configurado.`);
    }
    const pacote: CargaIp = {
      tipo: "ip", origem: ipDeOrigem, destino, ttl: ttl ?? TTL_INICIAL[origem.tipo], icmp: "echo",
      identificador: this.proximoIdentificador++,
    };
    this.enviarPacote(execucao, origem, pacote);
    this.processarFila(execucao);
    return this.concluir(execucao, pacote.identificador, origem);
  }

  traceroute(origemId: string, destino: string, maximo = 8): ResultadoDoTraceroute {
    const saltos: SaltoDoTraceroute[] = [];
    const passos: Passo[] = [];
    let chegou = false;
    for (let salto = 1; salto <= maximo && !chegou; salto++) {
      const resultado = this.ping(origemId, destino, salto);
      passos.push(...resultado.passos);
      chegou = resultado.tipo === "resposta";
      saltos.push({ salto, de: resultado.de, chegou });
      if (resultado.tipo === "erro-local" || resultado.tipo === "inalcancavel") break;
    }
    return { saltos, chegou, passos };
  }

  private falhaLocal(motivo: string): ResultadoDoPing {
    return { sucesso: false, tipo: "erro-local", de: null, ttl: null, motivo, passos: [], descartes: [] };
  }

  private ipDeSaida(origem: Dispositivo, destino: string): string | null {
    const caminho = this.rotear(origem, destino);
    if ("erro" in caminho) {
      const primeira = origem.interfaces.find((i) => i.ip);
      return primeira?.ip ?? null;
    }
    return origem.interfaces.find((i) => i.nome === caminho.interfaceNome)?.ip ?? null;
  }

  private concluir(execucao: Execucao, identificador: number, origem: Dispositivo): ResultadoDoPing {
    const base = { passos: execucao.passos, descartes: execucao.descartes };
    const resposta = execucao.recebidos.find((pacote) => pacote.identificador === identificador);
    if (resposta) {
      if (resposta.icmp === "resposta") {
        return { ...base, sucesso: true, tipo: "resposta", de: resposta.origem, ttl: resposta.ttl, motivo: `Resposta de ${resposta.origem}.` };
      }
      if (resposta.icmp === "ttl-excedido") {
        return { ...base, sucesso: false, tipo: "ttl-excedido", de: resposta.origem, ttl: resposta.ttl, motivo: `Tempo de vida excedido em ${resposta.origem}.` };
      }
      return { ...base, sucesso: false, tipo: "inalcancavel", de: resposta.origem, ttl: resposta.ttl, motivo: `Host de destino inacessível (resposta de ${resposta.origem}).` };
    }
    if (execucao.estourou) {
      return { ...base, sucesso: false, tipo: "sem-resposta", de: null, ttl: null, motivo: "Os pacotes não pararam de circular: provável laço na rede (sem STP, dois caminhos entre switches formam um laço)." };
    }
    const primeiro = execucao.descartes[0];
    if (primeiro) {
      const local = primeiro.dispositivo === origem.nome;
      return { ...base, sucesso: false, tipo: local ? "erro-local" : "sem-resposta", de: null, ttl: null, motivo: `${primeiro.dispositivo}: ${primeiro.motivo}` };
    }
    const [chave] = [...execucao.pendentes.keys()];
    if (chave) {
      const ip = chave.split("|")[1];
      return { ...base, sucesso: false, tipo: "sem-resposta", de: null, ttl: null, motivo: `Sem resposta ARP de ${ip}: ninguém ali tem esse endereço, ou o caminho até lá está cortado (cabo, VLAN).` };
    }
    return { ...base, sucesso: false, tipo: "sem-resposta", de: null, ttl: null, motivo: "Esgotado o tempo limite do pedido." };
  }

  private processarFila(execucao: Execucao) {
    while (execucao.fila.length > 0 && !execucao.estourou) {
      const entrega = execucao.fila.shift()!;
      this.receber(execucao, entrega);
    }
  }

  private descartar(execucao: Execucao, dispositivo: Dispositivo, motivo: string) {
    execucao.descartes.push({ dispositivo: dispositivo.nome, motivo });
  }

  private caboDa(dispositivoId: string, interfaceNome: string) {
    return this.rede.cabos.find(
      (c) => (c.a.dispositivo === dispositivoId && c.a.interface === interfaceNome)
        || (c.b.dispositivo === dispositivoId && c.b.interface === interfaceNome),
    );
  }

  private temCabo(dispositivo: Dispositivo, interfaceNome: string): boolean {
    return this.caboDa(dispositivo.id, interfaceNome) !== undefined;
  }

  private transmitir(execucao: Execucao, dispositivo: Dispositivo, interfaceNome: string, quadro: Quadro) {
    const cabo = this.caboDa(dispositivo.id, interfaceNome);
    if (!cabo) {
      this.descartar(execucao, dispositivo, `a interface ${interfaceNome} não tem cabo conectado.`);
      return;
    }
    if (execucao.passos.length >= LIMITE_DE_PASSOS) {
      execucao.estourou = true;
      return;
    }
    const aqui: Ponta = { dispositivo: dispositivo.id, interface: interfaceNome };
    const lado: Ponta = cabo.a.dispositivo === dispositivo.id && cabo.a.interface === interfaceNome ? cabo.b : cabo.a;
    const destino = this.dispositivos.get(lado.dispositivo);
    if (!destino) return;
    execucao.passos.push({
      caboId: cabo.id, de: aqui, para: lado,
      tipo: quadro.carga.tipo === "arp" ? "arp" : "icmp",
      rotulo: rotuloDoQuadro(quadro),
    });
    execucao.fila.push({ dispositivo: destino, interfaceNome: lado.interface, quadro });
  }

  private receber(execucao: Execucao, entrega: Entrega) {
    const { dispositivo, interfaceNome, quadro } = entrega;
    if (dispositivo.tipo === "switch") {
      this.receberNoSwitch(execucao, dispositivo, interfaceNome, quadro);
      return;
    }
    const interfaceLocal = dispositivo.interfaces.find((i) => i.nome === interfaceNome);
    if (!interfaceLocal || !interfaceLocal.ip) return;
    if (quadro.destinoMac !== interfaceLocal.mac && quadro.destinoMac !== MAC_DE_TRANSMISSAO) return;
    if (quadro.carga.tipo === "arp") {
      this.receberArp(execucao, dispositivo, interfaceLocal, quadro.carga);
    } else {
      this.receberIp(execucao, dispositivo, interfaceLocal, quadro.carga);
    }
  }

  private receberNoSwitch(execucao: Execucao, comutador: Dispositivo, portaEntrada: string, quadro: Quadro) {
    const entrada = comutador.interfaces.find((i) => i.nome === portaEntrada);
    if (!entrada) return;
    const vlan = entrada.vlan;
    const tabela = this.macs.get(comutador.id) ?? new Map<string, string>();
    this.macs.set(comutador.id, tabela);
    tabela.set(`${vlan}|${quadro.origemMac}`, portaEntrada);
    const noVlan: Quadro = { ...quadro, vlan };

    const conhecida = quadro.destinoMac === MAC_DE_TRANSMISSAO ? undefined : tabela.get(`${vlan}|${quadro.destinoMac}`);
    if (conhecida) {
      if (conhecida !== portaEntrada) this.transmitir(execucao, comutador, conhecida, noVlan);
      return;
    }
    for (const porta of comutador.interfaces) {
      if (porta.nome === portaEntrada || porta.vlan !== vlan || !this.temCabo(comutador, porta.nome)) continue;
      this.transmitir(execucao, comutador, porta.nome, noVlan);
    }
  }

  private aprender(dispositivo: Dispositivo, ip: string, mac: string) {
    const tabela = this.arp.get(dispositivo.id) ?? new Map<string, string>();
    this.arp.set(dispositivo.id, tabela);
    tabela.set(ip, mac);
  }

  private receberArp(execucao: Execucao, dispositivo: Dispositivo, local: Interface, arp: CargaArp) {
    if (arp.operacao === "pedido") {
      if (arp.ipAlvo !== local.ip) return;
      this.aprender(dispositivo, arp.ipOrigem, arp.macOrigem);
      const resposta: CargaArp = { tipo: "arp", operacao: "resposta", ipOrigem: local.ip, macOrigem: local.mac, ipAlvo: arp.ipOrigem };
      this.transmitir(execucao, dispositivo, local.nome, { origemMac: local.mac, destinoMac: arp.macOrigem, vlan: 0, carga: resposta });
      return;
    }
    this.aprender(dispositivo, arp.ipOrigem, arp.macOrigem);
    const chave = `${dispositivo.id}|${arp.ipOrigem}`;
    const espera = execucao.pendentes.get(chave) ?? [];
    execucao.pendentes.delete(chave);
    for (const pendente of espera) {
      this.enviarQuadroIp(execucao, dispositivo, pendente.interfaceNome, pendente.pacote, arp.macOrigem);
    }
  }

  private receberIp(execucao: Execucao, dispositivo: Dispositivo, local: Interface, pacote: CargaIp) {
    const meu = dispositivo.interfaces.some((i) => i.ip === pacote.destino);
    if (meu) {
      if (pacote.icmp === "echo") {
        this.enviarPacote(execucao, dispositivo, {
          tipo: "ip", origem: pacote.destino, destino: pacote.origem, ttl: TTL_INICIAL[dispositivo.tipo],
          icmp: "resposta", identificador: pacote.identificador,
        });
      } else if (dispositivo.id === execucao.origemId) {
        execucao.recebidos.push(pacote);
      }
      return;
    }
    if (dispositivo.tipo !== "roteador") {
      this.descartar(execucao, dispositivo, `recebeu um pacote para ${pacote.destino}, que não é o seu endereço.`);
      return;
    }
    const restante = pacote.ttl - 1;
    if (restante <= 0) {
      this.descartar(execucao, dispositivo, `o TTL do pacote para ${pacote.destino} chegou a zero.`);
      this.responderErro(execucao, dispositivo, local, pacote, "ttl-excedido");
      return;
    }
    const caminho = this.rotear(dispositivo, pacote.destino);
    if ("erro" in caminho) {
      this.descartar(execucao, dispositivo, caminho.erro);
      this.responderErro(execucao, dispositivo, local, pacote, "inalcancavel");
      return;
    }
    this.enviarPacote(execucao, dispositivo, { ...pacote, ttl: restante });
  }

  private responderErro(execucao: Execucao, roteador: Dispositivo, entrada: Interface, original: CargaIp, tipo: TipoIcmp) {
    if (original.icmp !== "echo") return;
    this.enviarPacote(execucao, roteador, {
      tipo: "ip", origem: entrada.ip, destino: original.origem, ttl: TTL_INICIAL.roteador,
      icmp: tipo, identificador: original.identificador,
    });
  }

  private rotear(dispositivo: Dispositivo, destino: string): Caminho {
    if (ehHost(dispositivo.tipo)) return this.rotearHost(dispositivo, destino);
    return this.rotearRoteador(dispositivo, destino);
  }

  private rotearHost(host: Dispositivo, destino: string): Caminho {
    const interfaceLocal = host.interfaces[0];
    if (!interfaceLocal?.ip || prefixoDaMascara(interfaceLocal.mascara) === null) {
      return { erro: "sem endereço IP ou máscara válidos configurados." };
    }
    if (mesmaRede(destino, interfaceLocal.ip, interfaceLocal.mascara)) {
      return { interfaceNome: interfaceLocal.nome, proximoSalto: destino };
    }
    const rede = redeDe(interfaceLocal.ip, interfaceLocal.mascara);
    const prefixo = prefixoDaMascara(interfaceLocal.mascara);
    if (!host.gateway) {
      return { erro: `${destino} está fora da rede ${rede}/${prefixo} e nenhum gateway padrão foi configurado.` };
    }
    if (!ipValido(host.gateway) || !mesmaRede(host.gateway, interfaceLocal.ip, interfaceLocal.mascara)) {
      return { erro: `o gateway ${host.gateway} não está na mesma rede (${rede}/${prefixo}) e não pode ser alcançado.` };
    }
    return { interfaceNome: interfaceLocal.nome, proximoSalto: host.gateway };
  }

  private rotearRoteador(roteador: Dispositivo, destino: string): Caminho {
    let melhor = null as { prefixo: number; interfaceNome: string; proximoSalto: string } | null;
    const considerar = (prefixo: number, interfaceNome: string, proximoSalto: string) => {
      if (!melhor || prefixo > melhor.prefixo) melhor = { prefixo, interfaceNome, proximoSalto };
    };

    for (const i of roteador.interfaces) {
      const prefixo = prefixoDaMascara(i.mascara);
      if (i.ip && prefixo !== null && mesmaRede(destino, i.ip, i.mascara)) considerar(prefixo, i.nome, destino);
    }
    for (const rota of roteador.rotas) {
      const prefixo = prefixoDaMascara(rota.mascara);
      if (prefixo === null || analisarIp(rota.rede) === null || !ipValido(rota.proximoSalto)) continue;
      const rotaAplica = prefixo === 0 || mesmaRede(destino, rota.rede, rota.mascara);
      if (!rotaAplica) continue;
      const saida = roteador.interfaces.find((i) => i.ip && prefixoDaMascara(i.mascara) !== null && mesmaRede(rota.proximoSalto, i.ip, i.mascara));
      if (saida) considerar(prefixo, saida.nome, rota.proximoSalto);
    }
    if (!melhor) return { erro: `não há rota para ${destino}.` };
    return { interfaceNome: melhor.interfaceNome, proximoSalto: melhor.proximoSalto };
  }

  private enviarPacote(execucao: Execucao, dispositivo: Dispositivo, pacote: CargaIp) {
    const caminho = this.rotear(dispositivo, pacote.destino);
    if ("erro" in caminho) {
      this.descartar(execucao, dispositivo, caminho.erro);
      return;
    }
    const mac = this.arp.get(dispositivo.id)?.get(caminho.proximoSalto);
    if (mac) {
      this.enviarQuadroIp(execucao, dispositivo, caminho.interfaceNome, pacote, mac);
      return;
    }
    const chave = `${dispositivo.id}|${caminho.proximoSalto}`;
    const espera = execucao.pendentes.get(chave) ?? [];
    espera.push({ interfaceNome: caminho.interfaceNome, pacote });
    execucao.pendentes.set(chave, espera);
    if (espera.length > 1) return;
    const local = dispositivo.interfaces.find((i) => i.nome === caminho.interfaceNome)!;
    const pedido: CargaArp = { tipo: "arp", operacao: "pedido", ipOrigem: local.ip, macOrigem: local.mac, ipAlvo: caminho.proximoSalto };
    this.transmitir(execucao, dispositivo, local.nome, { origemMac: local.mac, destinoMac: MAC_DE_TRANSMISSAO, vlan: 0, carga: pedido });
  }

  private enviarQuadroIp(execucao: Execucao, dispositivo: Dispositivo, interfaceNome: string, pacote: CargaIp, macDestino: string) {
    const local = dispositivo.interfaces.find((i) => i.nome === interfaceNome);
    if (!local) return;
    this.transmitir(execucao, dispositivo, interfaceNome, { origemMac: local.mac, destinoMac: macDestino, vlan: 0, carga: pacote });
  }
}

function rotuloDoQuadro(quadro: Quadro): string {
  const carga = quadro.carga;
  if (carga.tipo === "arp") {
    return carga.operacao === "pedido"
      ? `ARP: quem tem ${carga.ipAlvo}? Diga a ${carga.ipOrigem}`
      : `ARP: ${carga.ipOrigem} está em ${carga.macOrigem}`;
  }
  const nomes: Record<TipoIcmp, string> = {
    echo: "ICMP echo (ping)", resposta: "ICMP resposta", inalcancavel: "ICMP destino inacessível", "ttl-excedido": "ICMP tempo excedido",
  };
  return `${nomes[carga.icmp]}: ${carga.origem} → ${carga.destino} (TTL ${carga.ttl})`;
}
