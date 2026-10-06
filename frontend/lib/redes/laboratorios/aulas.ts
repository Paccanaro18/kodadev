import { construirRede } from "../rascunho";
import type { Laboratorio } from "./tipos";

export const AULA_PRIMEIRO_CABO: Laboratorio = {
  slug: "primeiro-cabo",
  tipo: "aula",
  titulo: "Seu primeiro cabo: dois PCs conversando",
  resumo: "Ligue dois computadores, dê um endereço IP a cada um e faça o primeiro ping da sua vida de rede.",
  nivel: "Iniciante",
  minutos: 10,
  conceitos: ["Endereço IP", "Máscara de rede", "Ping (ICMP)", "ARP"],
  paleta: ["pc"],
  redeInicial: construirRede([
    { tipo: "pc", numero: 1, x: 80, y: 120 },
    { tipo: "pc", numero: 2, x: 420, y: 120 },
  ]),
  objetivos: [
    { tipo: "cabo", entre: ["pc-1", "pc-2"], descricao: "Ligar o PC1 ao PC2 com um cabo" },
    { tipo: "ip", dispositivo: "pc-1", naRede: { rede: "192.168.0.0", mascara: "255.255.255.0" }, descricao: "Dar ao PC1 um IP da rede 192.168.0.0 com máscara 255.255.255.0" },
    { tipo: "ip", dispositivo: "pc-2", naRede: { rede: "192.168.0.0", mascara: "255.255.255.0" }, descricao: "Dar ao PC2 um IP da mesma rede, com a mesma máscara" },
    { tipo: "ping", de: "pc-1", para: "pc-2", descricao: "O PC1 consegue dar ping no PC2" },
  ],
  moduloDaTrilha: "enderecos-ip-mascaras-e-ping",
  teoria: [
    { tipo: "p", texto: "Ligue os dois PCs com um cabo, dê a cada um um endereço IP da mesma rede e dispare o primeiro ping. É o menor laboratório possível, e já mostra o ARP e o ICMP trabalhando." },
    { tipo: "numerada", itens: [
      "Arraste do círculo de cabo do PC1 até o PC2.",
      "Clique em cada PC e configure IP e máscara: a mesma rede, endereços diferentes.",
      "Abra o Terminal do PC1 e dê ping no PC2. Veja o ARP e depois o ICMP percorrendo o cabo.",
    ] },
    { tipo: "dica", titulo: "A explicação completa está na trilha", texto: "O que é o IP, como a máscara separa rede e dispositivo e por que o ping começa com um ARP ficam na aula da trilha Redes de computadores." },
  ],
  solucao: [
    "Arraste de uma porta do PC1 até a porta do PC2.",
    "PC1: IP 192.168.0.10, máscara 255.255.255.0.",
    "PC2: IP 192.168.0.20, máscara 255.255.255.0.",
    "No terminal do PC1: ping 192.168.0.20.",
  ],
};

export const AULA_SWITCH: Laboratorio = {
  slug: "switch-e-tabela-mac",
  tipo: "aula",
  titulo: "O switch: aprendendo quem está em cada porta",
  resumo: "Conecte três PCs a um switch e veja como ele aprende endereços MAC e deixa de inundar a rede.",
  nivel: "Iniciante",
  minutos: 15,
  conceitos: ["Switch", "Endereço MAC", "Tabela MAC", "Flooding"],
  paleta: ["pc", "switch"],
  redeInicial: construirRede([
    { tipo: "switch", numero: 1, x: 260, y: 280 },
    { tipo: "pc", numero: 1, x: 40, y: 40, config: { ip: "192.168.10.11" } },
    { tipo: "pc", numero: 2, x: 260, y: 20, config: { ip: "192.168.10.12" } },
    { tipo: "pc", numero: 3, x: 480, y: 40, config: { ip: "192.168.10.13" } },
  ]),
  objetivos: [
    { tipo: "cabo", entre: ["pc-1", "switch-1"], descricao: "Ligar o PC1 ao switch" },
    { tipo: "cabo", entre: ["pc-2", "switch-1"], descricao: "Ligar o PC2 ao switch" },
    { tipo: "cabo", entre: ["pc-3", "switch-1"], descricao: "Ligar o PC3 ao switch" },
    { tipo: "ping", de: "pc-1", para: "pc-3", descricao: "O PC1 consegue dar ping no PC3" },
    { tipo: "mac-aprendido", comutador: "switch-1", minimo: 2, descricao: "O switch aprendeu pelo menos dois endereços MAC" },
  ],
  moduloDaTrilha: "switches-mac-e-vlans",
  teoria: [
    { tipo: "p", texto: "Ligue três PCs a um switch e observe como ele aprende o endereço MAC de cada um e deixa de inundar a rede. Os PCs já vêm com IP configurado." },
    { tipo: "numerada", itens: [
      "Ligue cada PC a uma porta do switch.",
      "No Terminal do switch, rode show mac address-table: a tabela está vazia.",
      "No PC1, dê ping no 192.168.10.13 e volte a olhar a tabela do switch.",
    ] },
    { tipo: "dica", titulo: "A explicação completa está na trilha", texto: "Quadros, MACs, flooding e VLANs estão na aula da trilha Redes de computadores." },
  ],
  solucao: [
    "Cabos: PC1, PC2 e PC3 em portas livres do switch.",
    "No terminal do PC1: ping 192.168.10.13.",
    "No terminal do switch: show mac address-table.",
  ],
};

export const AULA_ROTEADOR: Laboratorio = {
  slug: "gateway-e-roteador",
  tipo: "aula",
  titulo: "Duas redes e um roteador",
  resumo: "Faça um PC falar com um servidor em outra rede: entenda o gateway padrão e o papel do roteador.",
  nivel: "Iniciante",
  minutos: 20,
  conceitos: ["Roteador", "Gateway padrão", "TTL", "Traceroute"],
  paleta: ["pc", "servidor", "switch", "roteador"],
  redeInicial: construirRede(
    [
      { tipo: "pc", numero: 1, x: 20, y: 60, config: { ip: "10.0.1.10" } },
      { tipo: "switch", numero: 1, x: 250, y: 60 },
      { tipo: "roteador", numero: 1, x: 480, y: 230, config: { portas: { "Gi0/0": { ip: "10.0.1.1", mascara: "255.255.255.0" }, "Gi0/1": { ip: "10.0.2.1", mascara: "255.255.255.0" } } } },
      { tipo: "switch", numero: 2, x: 710, y: 60 },
      { tipo: "servidor", numero: 1, x: 940, y: 60, config: { ip: "10.0.2.10" } },
    ],
    [
      ["pc-1", "eth0", "switch-1", "Fa0/1"],
      ["switch-1", "Fa0/2", "roteador-1", "Gi0/0"],
      ["roteador-1", "Gi0/1", "switch-2", "Fa0/1"],
      ["switch-2", "Fa0/2", "servidor-1", "eth0"],
    ],
  ),
  objetivos: [
    { tipo: "ping", de: "pc-1", para: "servidor-1", descricao: "O PC1 consegue dar ping no servidor" },
    { tipo: "ping", de: "servidor-1", para: "pc-1", descricao: "O servidor consegue responder ao PC1 (e iniciar um ping para ele)" },
  ],
  moduloDaTrilha: "roteadores-gateways-e-rotas",
  teoria: [
    { tipo: "p", texto: "O PC1 e o servidor estão em redes diferentes, ligadas por um roteador que já tem os seus endereços. Falta dizer aos dois quem é o gateway deles." },
    { tipo: "numerada", itens: [
      "Configure o gateway do PC1 com o endereço do roteador na rede do PC1.",
      "Configure o gateway do servidor com o endereço do roteador na rede do servidor.",
      "Dê ping do PC1 no servidor e rode tracert para ver o roteador no caminho.",
    ] },
    { tipo: "dica", titulo: "A explicação completa está na trilha", texto: "Gateway padrão, tabela de roteamento, TTL e traceroute estão na aula da trilha Redes de computadores." },
  ],
  solucao: [
    "PC1: gateway 10.0.1.1.",
    "Servidor: gateway 10.0.2.1.",
    "No terminal do PC1: ping 10.0.2.10 e tracert 10.0.2.10.",
  ],
};
