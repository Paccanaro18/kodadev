import { ipValido, prefixoDaMascara, redeDe } from "./ip";
import { Simulador } from "./simulador";
import { ehHost, type Dispositivo, type Passo, type Rede, type ResultadoDoPing } from "./tipos";

export type SaidaDoTerminal = {
  linhas: string[];
  passos: Passo[];
  limpar?: boolean;
};

const AJUDA_DE_HOST = [
  "Comandos disponíveis:",
  "  ipconfig              mostra o endereço IP, a máscara, o gateway, o DNS e o MAC",
  "  ipconfig /renew       pede um endereço novo ao servidor DHCP",
  "  ping <ip ou nome>     envia quatro pedidos de eco (ICMP)",
  "  nslookup <nome>       pergunta ao servidor DNS qual o IP de um nome",
  "  tracert <ip>          mostra os roteadores no caminho até o destino",
  "  arp -a                mostra a tabela ARP (IP → MAC já descobertos)",
  "  clear                 limpa a tela",
];

const AJUDA_DE_ROTEADOR = [
  "Comandos disponíveis:",
  "  show ip interface brief   interfaces, endereços e estado",
  "  show ip route             tabela de roteamento",
  "  show arp                  tabela ARP",
  "  ping <ip>                 envia quatro pedidos de eco (ICMP)",
  "  traceroute <ip>           mostra os roteadores no caminho",
  "  clear                     limpa a tela",
];

const AJUDA_DE_SWITCH = [
  "Comandos disponíveis:",
  "  show mac address-table    endereços MAC aprendidos em cada porta",
  "  show vlan brief           portas de cada VLAN",
  "  show interfaces status    portas com cabo conectado",
  "  clear                     limpa a tela",
];

function linhasDoPing(simulador: Simulador, origem: Dispositivo, destino: string, apelido?: string): SaidaDoTerminal {
  const linhas = [`Disparando contra ${apelido ? `${apelido} [${destino}]` : destino} com 32 bytes de dados:`];
  let recebidos = 0;
  let passos: Passo[] = [];
  let ultimo: ResultadoDoPing | null = null;
  for (let i = 0; i < 4; i++) {
    const resultado = simulador.ping(origem.id, destino);
    if (i === 0) passos = resultado.passos;
    ultimo = resultado;
    if (resultado.sucesso) {
      recebidos++;
      linhas.push(`Resposta de ${resultado.de}: bytes=32 tempo<1ms TTL=${resultado.ttl}`);
    } else if (resultado.tipo === "inalcancavel") {
      linhas.push(`Resposta de ${resultado.de}: Host de destino inacessível.`);
    } else if (resultado.tipo === "ttl-excedido") {
      linhas.push(`Resposta de ${resultado.de}: Tempo de vida (TTL) excedido em trânsito.`);
    } else if (resultado.tipo === "erro-local") {
      linhas.push("Falha geral.");
    } else {
      linhas.push("Esgotado o tempo limite do pedido.");
    }
  }
  const perdidos = 4 - recebidos;
  linhas.push("", `Estatísticas do ping para ${destino}:`, `    Pacotes: enviados = 4, recebidos = ${recebidos}, perdidos = ${perdidos} (${perdidos * 25}% de perda)`);
  if (ultimo && !ultimo.sucesso) linhas.push("", `Diagnóstico: ${ultimo.motivo}`);
  return { linhas, passos };
}

function linhasDoTraceroute(simulador: Simulador, origem: Dispositivo, destino: string): SaidaDoTerminal {
  const resultado = simulador.traceroute(origem.id, destino);
  const linhas = [`Rastreando a rota para ${destino} com no máximo 8 saltos:`, ""];
  for (const salto of resultado.saltos) {
    linhas.push(salto.de ? `  ${salto.salto}    <1 ms    ${salto.de}` : `  ${salto.salto}     *        Esgotado o tempo limite do pedido.`);
  }
  linhas.push("", resultado.chegou ? "Rastreamento concluído." : "O destino não foi alcançado.");
  return { linhas, passos: resultado.passos.slice(0, 40) };
}

function pingPorNome(simulador: Simulador, host: Dispositivo, nome: string): SaidaDoTerminal {
  if (ipValido(nome)) return linhasDoPing(simulador, host, nome);
  const resolucao = simulador.resolverNome(host.id, nome);
  if (!resolucao.sucesso || !resolucao.ip) {
    return {
      linhas: [`Não foi possível encontrar o host ${nome}. Verifique o nome e tente novamente.`, "", `Diagnóstico: ${resolucao.motivo}`],
      passos: resolucao.passos,
    };
  }
  const saida = linhasDoPing(simulador, host, resolucao.ip, nome);
  return { linhas: saida.linhas, passos: [...resolucao.passos, ...saida.passos] };
}

function linhasDoNslookup(simulador: Simulador, host: Dispositivo, nome: string): SaidaDoTerminal {
  const resolucao = simulador.resolverNome(host.id, nome);
  const dns = simulador.configuracaoDe(host.id).dns;
  if (resolucao.sucesso) {
    return { linhas: [`Servidor:  ${dns}`, `Endereço:  ${dns}`, "", `Nome:      ${nome}`, `Endereço:  ${resolucao.ip}`], passos: resolucao.passos };
  }
  return { linhas: [`*** Não foi possível resolver ${nome}.`, "", `Diagnóstico: ${resolucao.motivo}`], passos: resolucao.passos };
}

function comandosDeHost(simulador: Simulador, host: Dispositivo, partes: string[]): SaidaDoTerminal | null {
  const [comando, ...argumentos] = partes;
  const efetivo = simulador.dispositivo(host.id) ?? host;
  const interfaceLocal = efetivo.interfaces[0];
  if ((comando === "ipconfig" || comando === "ifconfig") && argumentos[0] === "/renew") {
    if (!host.usaDhcp) return { linhas: ["Esta interface usa endereço fixo. Ative a opção DHCP na configuração do dispositivo."], passos: [] };
    const resultado = simulador.resultadoDoDhcp(host.id);
    if (!resultado) return { linhas: ["Não foi possível renovar a concessão."], passos: [] };
    return {
      linhas: ["Renovando a concessão de endereço...", resultado.sucesso ? resultado.motivo : `Falha: ${resultado.motivo}`],
      passos: resultado.passos,
    };
  }
  if (comando === "ipconfig" || comando === "ifconfig") {
    const configuracao = simulador.configuracaoDe(host.id);
    const linhas = [
      "Configuração IP",
      `   DHCP habilitado . . . . : ${host.usaDhcp ? "Sim" : "Não"}`,
      `   Endereço IPv4 . . . . . : ${interfaceLocal.ip || "(não configurado)"}`,
      `   Máscara de sub-rede . . : ${interfaceLocal.mascara || "(não configurada)"}`,
      `   Gateway padrão  . . . . : ${efetivo.gateway || "(não configurado)"}`,
      `   Servidor DNS  . . . . . : ${configuracao.dns || "(não configurado)"}`,
      `   Endereço físico (MAC) . : ${interfaceLocal.mac}`,
    ];
    if (configuracao.origem === "apipa") linhas.push("", "   Endereço 169.254.x.x: nenhum servidor DHCP respondeu, e o computador se atribuiu um endereço automático.");
    return { linhas, passos: [] };
  }
  if (comando === "nslookup") {
    if (!argumentos[0]) return { linhas: ["Uso: nslookup <nome>"], passos: [] };
    return linhasDoNslookup(simulador, host, argumentos[0]);
  }
  if (comando === "dhcp" && argumentos[0] === "leases" && host.tipo === "servidor") {
    const concessoes = simulador.arrendamentosDo(host.id);
    return { linhas: concessoes.length === 0 ? ["Nenhuma concessão DHCP ativa."] : ["Endereço IP        Endereço físico", ...concessoes.map((c) => `${c.ip.padEnd(18)} ${c.mac}`)], passos: [] };
  }
  if (comando === "arp" && argumentos[0] === "-a") {
    const entradas = simulador.tabelaArp(host.id);
    if (entradas.length === 0) return { linhas: ["Nenhuma entrada ARP. Envie um ping para a rede descobrir os vizinhos."], passos: [] };
    return { linhas: ["Endereço IP        Endereço físico", ...entradas.map((e) => `${e.ip.padEnd(18)} ${e.mac}`)], passos: [] };
  }
  if (comando === "ping" || comando === "tracert" || comando === "traceroute") {
    if (!argumentos[0]) return { linhas: [`Uso: ${comando} <endereço ip>`], passos: [] };
    return comando === "ping" ? pingPorNome(simulador, host, argumentos[0]) : linhasDoTraceroute(simulador, host, argumentos[0]);
  }
  return null;
}

function comandosDeRoteador(rede: Rede, simulador: Simulador, roteador: Dispositivo, partes: string[]): SaidaDoTerminal | null {
  const texto = partes.join(" ");
  if (texto === "show ip interface brief") {
    return {
      linhas: [
        "Interface    Endereço IP       Máscara           Estado",
        ...roteador.interfaces.map((i) => {
          const comCabo = rede.cabos.some((c) => (c.a.dispositivo === roteador.id && c.a.interface === i.nome) || (c.b.dispositivo === roteador.id && c.b.interface === i.nome));
          return `${i.nome.padEnd(12)} ${(i.ip || "não definido").padEnd(17)} ${(i.mascara || "-").padEnd(17)} ${i.ip && comCabo ? "ativa" : comCabo ? "ativa, sem IP" : "sem cabo"}`;
        }),
      ],
      passos: [],
    };
  }
  if (texto === "show ip route") {
    const linhas = ["Códigos: C - conectada, S - estática", ""];
    for (const i of roteador.interfaces) {
      const rede = i.ip ? redeDe(i.ip, i.mascara) : null;
      const prefixo = prefixoDaMascara(i.mascara);
      if (rede && prefixo !== null) linhas.push(`C    ${rede}/${prefixo} está diretamente conectada, ${i.nome}`);
    }
    for (const r of roteador.rotas) {
      const prefixo = prefixoDaMascara(r.mascara);
      linhas.push(`S${prefixo === 0 ? "*" : " "}   ${r.rede}/${prefixo ?? "?"} via ${r.proximoSalto}`);
    }
    if (linhas.length === 2) linhas.push("(tabela vazia: configure o IP de uma interface)");
    return { linhas, passos: [] };
  }
  if (texto === "show arp") {
    const entradas = simulador.tabelaArp(roteador.id);
    return { linhas: entradas.length === 0 ? ["Tabela ARP vazia."] : ["Endereço IP        Endereço físico", ...entradas.map((e) => `${e.ip.padEnd(18)} ${e.mac}`)], passos: [] };
  }
  const [comando, alvo] = partes;
  if (comando === "ping" || comando === "traceroute") {
    if (!alvo) return { linhas: [`Uso: ${comando} <endereço ip>`], passos: [] };
    return comando === "ping" ? linhasDoPing(simulador, roteador, alvo) : linhasDoTraceroute(simulador, roteador, alvo);
  }
  return null;
}

function comandosDeSwitch(rede: Rede, simulador: Simulador, comutador: Dispositivo, partes: string[]): SaidaDoTerminal | null {
  const texto = partes.join(" ");
  if (texto === "show mac address-table") {
    const entradas = simulador.tabelaMac(comutador.id);
    if (entradas.length === 0) return { linhas: ["A tabela está vazia: o switch ainda não viu nenhum quadro."], passos: [] };
    return { linhas: ["VLAN   Endereço MAC         Porta", ...entradas.map((e) => `${String(e.vlan).padEnd(6)} ${e.mac.padEnd(18)} ${e.porta}`)], passos: [] };
  }
  if (texto === "show vlan brief") {
    const porVlan = new Map<number, string[]>();
    for (const i of comutador.interfaces) porVlan.set(i.vlan, [...(porVlan.get(i.vlan) ?? []), i.nome]);
    return { linhas: ["VLAN   Portas", ...[...porVlan.entries()].sort((a, b) => a[0] - b[0]).map(([vlan, portas]) => `${String(vlan).padEnd(6)} ${portas.join(", ")}`)], passos: [] };
  }
  if (texto === "show interfaces status") {
    return {
      linhas: [
        "Porta     Estado",
        ...comutador.interfaces.map((i) => {
          const comCabo = rede.cabos.some((c) => (c.a.dispositivo === comutador.id && c.a.interface === i.nome) || (c.b.dispositivo === comutador.id && c.b.interface === i.nome));
          return `${i.nome.padEnd(9)} ${comCabo ? "conectada" : "sem cabo"}`;
        }),
      ],
      passos: [],
    };
  }
  return null;
}

export function executarComando(rede: Rede, simulador: Simulador, dispositivoId: string, linha: string): SaidaDoTerminal {
  const dispositivo = rede.dispositivos.find((d) => d.id === dispositivoId);
  if (!dispositivo) return { linhas: ["Dispositivo não encontrado."], passos: [] };
  const partes = linha.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return { linhas: [], passos: [] };
  if (partes[0] === "clear" || partes[0] === "cls") return { linhas: [], passos: [], limpar: true };
  if (partes[0] === "help" || partes[0] === "ajuda" || partes[0] === "?") {
    const ajuda = ehHost(dispositivo.tipo) ? AJUDA_DE_HOST : dispositivo.tipo === "roteador" ? AJUDA_DE_ROTEADOR : AJUDA_DE_SWITCH;
    return { linhas: ajuda, passos: [] };
  }
  const saida = ehHost(dispositivo.tipo)
    ? comandosDeHost(simulador, dispositivo, partes)
    : dispositivo.tipo === "roteador"
      ? comandosDeRoteador(rede, simulador, dispositivo, partes)
      : comandosDeSwitch(rede, simulador, dispositivo, partes);
  return saida ?? { linhas: [`Comando não reconhecido: "${linha.trim()}". Digite help para ver os comandos.`], passos: [] };
}
