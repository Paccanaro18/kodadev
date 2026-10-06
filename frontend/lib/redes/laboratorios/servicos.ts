import { construirRede } from "../rascunho";
import type { Laboratorio } from "./tipos";

export const AULA_DHCP: Laboratorio = {
  slug: "dhcp-enderecos-automaticos",
  tipo: "aula",
  titulo: "DHCP: endereços que chegam sozinhos",
  resumo: "Deixe de digitar IPs à mão: ligue o serviço DHCP em um servidor e veja os PCs receberem endereço, máscara, gateway e DNS automaticamente.",
  nivel: "Iniciante",
  minutos: 15,
  conceitos: ["DHCP", "Pool de endereços", "Concessão", "Endereço automático"],
  moduloDaTrilha: "dhcp-e-dns",
  paleta: ["pc", "servidor", "switch"],
  redeInicial: construirRede(
    [
      { tipo: "switch", numero: 1, x: 290, y: 280 },
      { tipo: "servidor", numero: 1, x: 290, y: 30, config: { ip: "192.168.50.2", servicoDhcp: { ativo: false, inicio: "192.168.50.100", fim: "192.168.50.150", mascara: "255.255.255.0", gateway: "192.168.50.1", dns: "192.168.50.2" } } },
      { tipo: "pc", numero: 1, x: 20, y: 130 },
      { tipo: "pc", numero: 2, x: 560, y: 130 },
    ],
    [
      ["servidor-1", "eth0", "switch-1", "Fa0/1"],
      ["pc-1", "eth0", "switch-1", "Fa0/2"],
      ["pc-2", "eth0", "switch-1", "Fa0/3"],
    ],
  ),
  objetivos: [
    { tipo: "dhcp", dispositivo: "pc-1", descricao: "O PC1 recebe um endereço do servidor DHCP" },
    { tipo: "dhcp", dispositivo: "pc-2", descricao: "O PC2 recebe um endereço do servidor DHCP" },
    { tipo: "ping", de: "pc-1", para: "pc-2", descricao: "O PC1 consegue dar ping no PC2" },
  ],
  teoria: [
    { tipo: "p", texto: "O servidor já tem endereço fixo e um conjunto de endereços (pool) pronto para distribuir, mas o serviço DHCP está desligado. Os PCs ainda não têm endereço nenhum." },
    { tipo: "numerada", itens: [
      "Clique no servidor, ligue o Servidor DHCP ativo e confira o pool.",
      "Clique em cada PC e ative Obter endereço automaticamente (DHCP).",
      "No terminal do PC1, rode ipconfig /renew e acompanhe discover, offer, request e ack.",
      "Dê ping do PC1 no endereço do PC2.",
    ] },
    { tipo: "dica", titulo: "A explicação completa está na trilha", texto: "A conversa DHCP, o pool, a concessão e o endereço automático 169.254.x.x estão na aula DHCP e DNS da trilha Redes de computadores." },
  ],
  solucao: [
    "Servidor: ligue o Servidor DHCP ativo.",
    "PC1 e PC2: ative Obter endereço automaticamente (DHCP).",
    "No PC1: ipconfig /renew e depois ping no endereço recebido pelo PC2.",
  ],
};

export const DESAFIO_POOL: Laboratorio = {
  slug: "pool-esgotado",
  tipo: "desafio",
  titulo: "O pool que acabou",
  resumo: "Quatro PCs pedem endereço ao mesmo servidor DHCP, mas só dois conseguem. Descubra por que os outros ficam com 169.254.x.x.",
  nivel: "Iniciante",
  minutos: 10,
  conceitos: ["DHCP", "Pool de endereços", "Endereço automático"],
  moduloDaTrilha: "dhcp-e-dns",
  paleta: ["pc", "servidor", "switch"],
  redeInicial: construirRede(
    [
      { tipo: "switch", numero: 1, x: 290, y: 250 },
      { tipo: "servidor", numero: 1, x: 580, y: 250, config: { ip: "192.168.50.2", servicoDhcp: { ativo: true, inicio: "192.168.50.100", fim: "192.168.50.101", mascara: "255.255.255.0", gateway: "192.168.50.1", dns: "192.168.50.2" } } },
      { tipo: "pc", numero: 1, x: 20, y: 20, config: { dhcp: true } },
      { tipo: "pc", numero: 2, x: 210, y: 20, config: { dhcp: true } },
      { tipo: "pc", numero: 3, x: 400, y: 20, config: { dhcp: true } },
      { tipo: "pc", numero: 4, x: 590, y: 20, config: { dhcp: true } },
    ],
    [
      ["servidor-1", "eth0", "switch-1", "Fa0/1"],
      ["pc-1", "eth0", "switch-1", "Fa0/2"],
      ["pc-2", "eth0", "switch-1", "Fa0/3"],
      ["pc-3", "eth0", "switch-1", "Fa0/4"],
      ["pc-4", "eth0", "switch-1", "Fa0/5"],
    ],
  ),
  objetivos: [
    { tipo: "dhcp", dispositivo: "pc-1", descricao: "O PC1 recebe um endereço do servidor DHCP" },
    { tipo: "dhcp", dispositivo: "pc-2", descricao: "O PC2 recebe um endereço do servidor DHCP" },
    { tipo: "dhcp", dispositivo: "pc-3", descricao: "O PC3 recebe um endereço do servidor DHCP" },
    { tipo: "dhcp", dispositivo: "pc-4", descricao: "O PC4 recebe um endereço do servidor DHCP" },
    { tipo: "ping", de: "pc-1", para: "pc-4", descricao: "O PC1 consegue dar ping no PC4" },
  ],
  teoria: [
    { tipo: "p", texto: "O chamado: \"os PCs 3 e 4 chegaram hoje e não acessam nada\". O servidor DHCP está ligado, os cabos estão certos e os dois primeiros PCs funcionam." },
    { tipo: "lista", itens: [
      "Rode ipconfig nos PCs que falharam e compare com os que funcionam.",
      "Um endereço 169.254.x.x quer dizer que nenhum servidor DHCP concedeu um endereço.",
      "No servidor, confira o pool: quantos endereços há entre o primeiro e o último?",
    ] },
  ],
  dica: "O pool vai de .100 a .101: são só dois endereços, e cada PC consome um. Quatro PCs precisam de pelo menos quatro.",
  solucao: [
    "Servidor: aumente o último endereço do pool, por exemplo para 192.168.50.150.",
    "Nos PCs sem endereço: ipconfig /renew.",
  ],
};

export const DESAFIO_DNS: Laboratorio = {
  slug: "nome-que-nao-resolve",
  tipo: "desafio",
  titulo: "O nome que não resolve",
  resumo: "O PC1 precisa abrir loja.koda.local, mas o nome não vira endereço. Há dois defeitos escondidos, um no PC e outro no servidor DNS.",
  nivel: "Intermediário",
  minutos: 15,
  conceitos: ["DNS", "Registro A", "Servidor DNS", "nslookup"],
  moduloDaTrilha: "dhcp-e-dns",
  paleta: ["pc", "servidor", "switch"],
  redeInicial: construirRede(
    [
      { tipo: "switch", numero: 1, x: 300, y: 270 },
      { tipo: "pc", numero: 1, x: 20, y: 40, config: { ip: "10.0.0.10" } },
      { tipo: "servidor", numero: 1, x: 300, y: 40, config: { ip: "10.0.0.2", servicoDns: { ativo: true, registros: [{ nome: "loja.koda.local", ip: "10.0.0.99" }] } } },
      { tipo: "servidor", numero: 2, x: 580, y: 40, config: { ip: "10.0.0.30" } },
    ],
    [
      ["pc-1", "eth0", "switch-1", "Fa0/1"],
      ["servidor-1", "eth0", "switch-1", "Fa0/2"],
      ["servidor-2", "eth0", "switch-1", "Fa0/3"],
    ],
  ),
  objetivos: [
    { tipo: "dns", de: "pc-1", nome: "loja.koda.local", resposta: "10.0.0.30", descricao: "O PC1 resolve loja.koda.local para o endereço do Servidor2" },
    { tipo: "ping", de: "pc-1", para: "loja.koda.local", descricao: "O PC1 consegue dar ping em loja.koda.local pelo nome" },
  ],
  teoria: [
    { tipo: "p", texto: "O chamado: \"a loja não abre pelo nome, mas o endereço direto funciona\". O Servidor2 (10.0.0.30) está de pé, e o Servidor1 deveria ser o DNS da rede." },
    { tipo: "lista", itens: [
      "No terminal do PC1, rode nslookup loja.koda.local e leia o diagnóstico.",
      "Um problema pode esconder o outro: depois de corrigir o primeiro, teste de novo.",
      "Compare o endereço que o DNS devolve com o endereço real do Servidor2.",
    ] },
  ],
  dica: "O PC1 não sabe quem é o servidor DNS, e, quando souber, o registro loja.koda.local ainda aponta para um endereço antigo.",
  solucao: [
    "PC1: configure o Servidor DNS como 10.0.0.2.",
    "Servidor1: corrija o registro loja.koda.local para 10.0.0.30.",
    "No PC1: nslookup loja.koda.local e ping loja.koda.local.",
  ],
};
