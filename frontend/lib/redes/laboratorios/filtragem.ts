import { construirRede } from "../rascunho";
import type { Laboratorio } from "./tipos";

const POSICOES = {
  pc1: { x: 20, y: 20 },
  pc2: { x: 210, y: 20 },
  comutador: { x: 110, y: 250 },
  roteador: { x: 420, y: 250 },
  servidor: { x: 720, y: 250 },
};

const CABOS: [string, string, string, string][] = [
  ["pc-1", "eth0", "switch-1", "Fa0/1"],
  ["pc-2", "eth0", "switch-1", "Fa0/2"],
  ["switch-1", "Fa0/3", "roteador-1", "Gi0/0"],
  ["roteador-1", "Gi0/1", "servidor-1", "eth0"],
];

export const AULA_ACL: Laboratorio = {
  slug: "acl-filtrando-trafego",
  tipo: "aula",
  titulo: "ACL: quem pode falar com quem",
  resumo: "Barre apenas um computador no roteador, sem derrubar os demais, e descubra por que toda ACL termina com um negar escondido.",
  nivel: "Intermediário",
  minutos: 15,
  conceitos: ["ACL", "Ordem das regras", "Negar implícito", "Filtragem"],
  moduloDaTrilha: "acls-e-firewall",
  paleta: ["pc", "servidor", "switch", "roteador"],
  redeInicial: construirRede(
    [
      { tipo: "pc", numero: 1, ...POSICOES.pc1, config: { ip: "10.0.1.10", gateway: "10.0.1.1" } },
      { tipo: "pc", numero: 2, ...POSICOES.pc2, config: { ip: "10.0.1.20", gateway: "10.0.1.1" } },
      { tipo: "switch", numero: 1, ...POSICOES.comutador },
      { tipo: "roteador", numero: 1, ...POSICOES.roteador, config: { portas: { "Gi0/0": { ip: "10.0.1.1" }, "Gi0/1": { ip: "10.0.2.1" } } } },
      { tipo: "servidor", numero: 1, ...POSICOES.servidor, config: { ip: "10.0.2.10", gateway: "10.0.2.1" } },
    ],
    CABOS,
  ),
  objetivos: [
    { tipo: "ping", de: "pc-1", para: "servidor-1", descricao: "O PC1 continua alcançando o servidor" },
    { tipo: "ping", de: "pc-2", para: "servidor-1", esperado: false, descricao: "O PC2 não alcança mais o servidor" },
  ],
  teoria: [
    { tipo: "p", texto: "Hoje todos da rede 10.0.1.0/24 alcançam o servidor. O pedido: o PC2 (10.0.1.20) não pode mais falar com o servidor, mas o PC1 e o resto precisam continuar normalmente." },
    { tipo: "numerada", itens: [
      "Abra o Roteador1 e, na interface Gi0/0 (por onde o tráfego dos PCs entra), adicione uma regra: negar icmp de 10.0.1.20 para 10.0.2.10.",
      "Teste: o PC2 não alcança mais o servidor, mas o PC1 também parou. Rode show access-lists no roteador e descubra o motivo.",
      "Adicione uma segunda regra, depois da primeira: permitir qualquer de qualquer para qualquer.",
    ] },
    { tipo: "dica", titulo: "A explicação completa está na trilha", texto: "A ordem das regras, o negar implícito e o fato de a ACL não guardar estado estão na aula ACLs e firewall da trilha Redes de computadores." },
  ],
  solucao: [
    "Roteador1, interface Gi0/0, ACL de entrada: regra 1, negar icmp, origem 10.0.1.20, destino 10.0.2.10.",
    "Mesma ACL: regra 2, permitir qualquer, origem qualquer, destino qualquer (sem ela o negar implícito derruba todo mundo).",
  ],
};

export const DESAFIO_ACL: Laboratorio = {
  slug: "acl-que-bloqueou-a-volta",
  tipo: "desafio",
  titulo: "A ACL que bloqueou a volta",
  resumo: "O ping do PC1 ao servidor está permitido na ida, mas não funciona. A ACL não guarda estado, e algo na volta está errado.",
  nivel: "Intermediário",
  minutos: 15,
  conceitos: ["ACL", "Tráfego de volta", "Sem estado", "Diagnóstico"],
  moduloDaTrilha: "acls-e-firewall",
  paleta: ["pc", "servidor", "switch", "roteador"],
  redeInicial: construirRede(
    [
      { tipo: "pc", numero: 1, ...POSICOES.pc1, config: { ip: "10.0.1.10", gateway: "10.0.1.1" } },
      { tipo: "pc", numero: 2, ...POSICOES.pc2, config: { ip: "10.0.1.50", gateway: "10.0.1.1" } },
      { tipo: "switch", numero: 1, ...POSICOES.comutador },
      {
        tipo: "roteador", numero: 1, ...POSICOES.roteador,
        config: {
          portas: { "Gi0/0": { ip: "10.0.1.1" }, "Gi0/1": { ip: "10.0.2.1" } },
          acl: {
            "Gi0/0": [{ acao: "permitir", protocolo: "icmp", origem: "10.0.1.10", destino: "10.0.2.10" }],
            "Gi0/1": [{ acao: "permitir", protocolo: "icmp", origem: "10.0.2.10", destino: "10.0.9.10" }],
          },
        },
      },
      { tipo: "servidor", numero: 1, ...POSICOES.servidor, config: { ip: "10.0.2.10", gateway: "10.0.2.1" } },
    ],
    CABOS,
  ),
  objetivos: [
    { tipo: "ping", de: "pc-1", para: "servidor-1", descricao: "O PC1 consegue dar ping no servidor" },
    { tipo: "ping", de: "pc-2", para: "servidor-1", esperado: false, descricao: "O PC2 continua barrado" },
  ],
  teoria: [
    { tipo: "p", texto: "O chamado: \"liberei o ping do PC1 para o servidor na ACL, e mesmo assim não funciona\". Só o PC1 deve alcançar o servidor, e o PC2 precisa continuar barrado." },
    { tipo: "lista", itens: [
      "Rode ping no PC1 e leia o diagnóstico: ele diz qual ACL negou o pacote.",
      "Uma ACL de entrada filtra o que entra por aquela interface, e a resposta do servidor entra pela outra interface.",
      "Rode show access-lists no roteador e compare as duas ACLs.",
    ] },
  ],
  dica: "A resposta do servidor entra no roteador pela Gi0/1. Veja para qual destino a regra dessa interface permite o tráfego: ele deveria ser o PC1.",
  solucao: [
    "Roteador1, interface Gi0/1: troque o destino da regra de 10.0.9.10 para 10.0.1.10, o endereço do PC1 que vai receber a resposta.",
    "Não mexa na ACL da Gi0/0: o negar implícito já mantém o PC2 barrado.",
  ],
};
