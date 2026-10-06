import { construirRede } from "../rascunho";
import type { Laboratorio } from "./tipos";

export const DESAFIO_MASCARA: Laboratorio = {
  slug: "mascara-que-nao-fecha",
  tipo: "desafio",
  titulo: "A máscara que não fecha",
  resumo: "Três PCs no mesmo switch, e o PC1 não conversa com ninguém. Ache os dois erros de configuração.",
  nivel: "Iniciante",
  minutos: 10,
  conceitos: ["Máscara de rede", "Mesma rede", "Diagnóstico"],
  paleta: ["pc", "switch"],
  redeInicial: construirRede(
    [
      { tipo: "switch", numero: 1, x: 260, y: 280 },
      { tipo: "pc", numero: 1, x: 40, y: 40, config: { ip: "192.168.1.10", mascara: "255.255.255.252" } },
      { tipo: "pc", numero: 2, x: 260, y: 20, config: { ip: "192.168.1.20", mascara: "255.255.255.0" } },
      { tipo: "pc", numero: 3, x: 480, y: 40, config: { ip: "192.168.2.30", mascara: "255.255.255.0" } },
    ],
    [
      ["pc-1", "eth0", "switch-1", "Fa0/1"],
      ["pc-2", "eth0", "switch-1", "Fa0/2"],
      ["pc-3", "eth0", "switch-1", "Fa0/3"],
    ],
  ),
  objetivos: [
    { tipo: "ping", de: "pc-1", para: "pc-2", descricao: "O PC1 dá ping no PC2" },
    { tipo: "ping", de: "pc-1", para: "pc-3", descricao: "O PC1 dá ping no PC3" },
    { tipo: "ping", de: "pc-3", para: "pc-2", descricao: "O PC3 dá ping no PC2" },
  ],
  teoria: [
    { tipo: "p", texto: "O chamado: \"o PC1 não alcança ninguém, e o PC3 também some do mapa\". Os cabos estão certos e o switch está funcionando. Tudo o que pode estar errado é a configuração dos computadores." },
    { tipo: "lista", itens: [
      "Todos os PCs deveriam estar na rede 192.168.1.0/24.",
      "Use ipconfig em cada PC e compare IP e máscara.",
      "Rode ping e leia o diagnóstico: ele diz onde o pacote parou.",
    ] },
  ],
  dica: "Calcule a rede de cada PC: o PC1 usa a máscara 255.255.255.252 (/30), que só enxerga quatro endereços. E um dos PCs está numa rede de outro número.",
  solucao: [
    "PC1: troque a máscara para 255.255.255.0.",
    "PC3: troque o IP para 192.168.1.30 (ele estava na rede 192.168.2.0).",
  ],
};

export const DESAFIO_VLAN: Laboratorio = {
  slug: "vlan-trocada",
  tipo: "desafio",
  titulo: "A porta na VLAN errada",
  resumo: "O departamento financeiro perdeu a rede. A causa está numa porta do switch que foi parar na VLAN errada.",
  nivel: "Intermediário",
  minutos: 15,
  conceitos: ["VLAN", "Isolamento", "Portas de acesso"],
  paleta: ["pc", "switch"],
  redeInicial: construirRede(
    [
      { tipo: "switch", numero: 1, x: 260, y: 280, config: { portas: { "Fa0/1": { vlan: 10 }, "Fa0/2": { vlan: 10 }, "Fa0/3": { vlan: 20 }, "Fa0/4": { vlan: 10 } } } },
      { tipo: "pc", numero: 1, x: 20, y: 40, config: { ip: "10.10.0.11" } },
      { tipo: "pc", numero: 2, x: 180, y: 20, config: { ip: "10.10.0.12" } },
      { tipo: "pc", numero: 3, x: 340, y: 20, config: { ip: "10.20.0.13" } },
      { tipo: "pc", numero: 4, x: 500, y: 40, config: { ip: "10.20.0.14" } },
    ],
    [
      ["pc-1", "eth0", "switch-1", "Fa0/1"],
      ["pc-2", "eth0", "switch-1", "Fa0/2"],
      ["pc-3", "eth0", "switch-1", "Fa0/3"],
      ["pc-4", "eth0", "switch-1", "Fa0/4"],
    ],
  ),
  objetivos: [
    { tipo: "ping", de: "pc-1", para: "pc-2", descricao: "Vendas: o PC1 dá ping no PC2 (VLAN 10)" },
    { tipo: "ping", de: "pc-3", para: "pc-4", descricao: "Financeiro: o PC3 dá ping no PC4 (VLAN 20)" },
    { tipo: "ping", de: "pc-1", para: "pc-3", esperado: false, descricao: "Vendas e financeiro continuam isolados: o PC1 não alcança o PC3" },
  ],
  teoria: [
    { tipo: "p", texto: "Uma VLAN divide um mesmo switch em redes lógicas separadas. Portas na VLAN 10 só conversam com portas na VLAN 10, mesmo estando no mesmo equipamento. É assim que se separa o financeiro das vendas sem comprar outro switch." },
    { tipo: "p", texto: "Aqui, vendas usa a VLAN 10 (rede 10.10.0.0/24) e o financeiro, a VLAN 20 (rede 10.20.0.0/24). O PC3 e o PC4 são do financeiro e deveriam se enxergar. O isolamento entre os dois departamentos tem que continuar valendo." },
    { tipo: "lista", itens: [
      "No painel do switch você configura a VLAN de cada porta.",
      "O comando show vlan brief, no terminal do switch, lista as portas de cada VLAN.",
      "Uma porta fora da VLAN certa faz o computador sumir para os colegas, mesmo com cabo, IP e máscara perfeitos.",
    ] },
  ],
  dica: "Compare a rede de cada PC com a VLAN da porta onde ele está ligado. Use show vlan brief no switch.",
  solucao: [
    "Coloque a porta Fa0/4 do switch na VLAN 20 (o PC4 está na rede do financeiro, 10.20.0.0/24).",
  ],
};

export const DESAFIO_ROTA: Laboratorio = {
  slug: "filial-sem-rota",
  tipo: "desafio",
  titulo: "A filial sem rota",
  resumo: "Dois roteadores conectam a matriz à filial, mas o ping não passa. Configure as rotas estáticas.",
  nivel: "Intermediário",
  minutos: 20,
  conceitos: ["Rotas estáticas", "Próximo salto", "Rota padrão", "Tabela de roteamento"],
  paleta: ["pc", "servidor", "roteador"],
  redeInicial: construirRede(
    [
      { tipo: "pc", numero: 1, x: 10, y: 120, config: { ip: "10.1.0.10", gateway: "10.1.0.1" } },
      { tipo: "roteador", numero: 1, x: 260, y: 120, config: { portas: { "Gi0/0": { ip: "10.1.0.1", mascara: "255.255.255.0" }, "Gi0/1": { ip: "10.2.0.1", mascara: "255.255.255.0" } } } },
      { tipo: "roteador", numero: 2, x: 510, y: 120, config: { portas: { "Gi0/0": { ip: "10.2.0.2", mascara: "255.255.255.0" }, "Gi0/1": { ip: "10.3.0.1", mascara: "255.255.255.0" } } } },
      { tipo: "servidor", numero: 1, x: 760, y: 120, config: { ip: "10.3.0.10", gateway: "10.3.0.1" } },
    ],
    [
      ["pc-1", "eth0", "roteador-1", "Gi0/0"],
      ["roteador-1", "Gi0/1", "roteador-2", "Gi0/0"],
      ["roteador-2", "Gi0/1", "servidor-1", "eth0"],
    ],
  ),
  objetivos: [
    { tipo: "ping", de: "pc-1", para: "servidor-1", descricao: "O PC da matriz dá ping no servidor da filial" },
    { tipo: "ping", de: "servidor-1", para: "pc-1", descricao: "O servidor da filial responde, e alcança o PC da matriz" },
  ],
  teoria: [
    { tipo: "p", texto: "Um roteador só conhece, sozinho, as redes às quais está diretamente conectado. O Roteador1 sabe da 10.1.0.0/24 e da 10.2.0.0/24, e o Roteador2, da 10.2.0.0/24 e da 10.3.0.0/24. Nenhum dos dois sabe como chegar à rede do outro lado." },
    { tipo: "p", texto: "Uma rota estática diz: \"para chegar à rede X, entregue ao roteador vizinho Y\". Cada rota tem a rede de destino, a máscara e o próximo salto, que é o IP do vizinho. A rota padrão (0.0.0.0/0) é uma rota curinga: \"para qualquer coisa que eu não conheça, vá por aqui\"." },
    { tipo: "lista", itens: [
      "Abra o painel de cada roteador e leia as rotas. O terminal do roteador tem show ip route.",
      "Lembre-se de que o ping precisa de um caminho de ida e de volta: os dois roteadores precisam saber os dois lados.",
      "Quando o roteador não encontra rota, ele responde ao PC com \"destino inacessível\", e o diagnóstico do ping mostra quem respondeu.",
    ] },
  ],
  dica: "O Roteador1 precisa de uma rota para a 10.3.0.0/24 passando pelo 10.2.0.2. O Roteador2 precisa de uma para a 10.1.0.0/24 passando pelo 10.2.0.1.",
  solucao: [
    "Roteador1: rota 10.3.0.0, máscara 255.255.255.0, próximo salto 10.2.0.2.",
    "Roteador2: rota 10.1.0.0, máscara 255.255.255.0, próximo salto 10.2.0.1.",
    "No PC1: ping 10.3.0.10 e tracert 10.3.0.10.",
  ],
};
