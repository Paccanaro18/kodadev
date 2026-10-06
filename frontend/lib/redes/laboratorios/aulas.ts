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
  teoria: [
    { tipo: "p", texto: "Toda conversa em rede começa com um endereço. O endereço IP (como 192.168.0.10) identifica um dispositivo, e a máscara de rede (como 255.255.255.0) diz quais dos quatro números identificam a rede e quais identificam o dispositivo dentro dela. Com a máscara 255.255.255.0, os três primeiros números formam a rede (192.168.0) e o último é o dispositivo. Dois dispositivos só conversam diretamente quando estão na mesma rede." },
    { tipo: "p", texto: "A máscara também se escreve como prefixo: 255.255.255.0 é /24, porque os primeiros 24 bits estão ligados. Você verá as duas formas o tempo todo." },
    { tipo: "h3", texto: "Como usar o editor ao lado" },
    { tipo: "lista", itens: [
      "Cada dispositivo tem pontinhos nas bordas, que são as portas. Arraste de um pontinho até o pontinho de outro dispositivo para passar um cabo.",
      "Clique em um dispositivo para abrir o painel dele, onde você configura IP, máscara e outros campos.",
      "No painel há também um terminal: ali você digita comandos como o ping e vê o resultado.",
      "Para apagar um cabo, clique nele e use o botão de remover no painel.",
    ] },
    { tipo: "h3", texto: "O que acontece quando você dá um ping" },
    { tipo: "numerada", itens: [
      "O PC1 percebe que o 192.168.0.20 está na mesma rede e precisa do endereço físico (MAC) dele. Ele manda uma pergunta a todos: \"quem tem o 192.168.0.20?\". É o ARP.",
      "O PC2 responde: \"sou eu, meu MAC é este\".",
      "Agora o PC1 envia o pedido de eco (ICMP echo) para o MAC do PC2, e o PC2 devolve a resposta.",
    ] },
    { tipo: "dica", titulo: "Veja o pacote andando", texto: "Depois de configurar os dois PCs, abra o terminal do PC1 e digite ping 192.168.0.20. O pacote percorre o cabo na tela, e a lista de eventos mostra primeiro o ARP e depois o ICMP. Digite arp -a para ver o que o PC1 aprendeu." },
    { tipo: "alerta", titulo: "Erros comuns", texto: "Máscaras diferentes nos dois lados, ou endereços em redes diferentes (192.168.0.x e 192.168.1.x com /24), fazem o ping falhar. Quando falha, o terminal mostra um diagnóstico dizendo onde o pacote parou." },
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
    { tipo: "switch", numero: 1, x: 260, y: 200 },
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
  teoria: [
    { tipo: "p", texto: "Um cabo liga apenas dois dispositivos. Para ligar vários, usamos um switch: uma caixa com várias portas que recebe um quadro (a unidade de dados da camada de enlace) por uma porta e decide por qual porta enviar." },
    { tipo: "p", texto: "Como o switch sabe qual porta usar? Ele aprende. Cada quadro carrega o MAC de quem enviou, e o switch anota na tabela MAC: \"o MAC tal está na porta 2\". Quando precisa encaminhar um quadro para um MAC que já conhece, manda só pela porta certa. Quando não conhece, ou quando o quadro é de difusão (como o pedido ARP), ele envia por todas as portas, menos a de entrada. Isso se chama flooding." },
    { tipo: "tabela", cabecalho: ["Situação", "O que o switch faz"], linhas: [
      ["MAC de origem novo", "Anota MAC → porta na tabela"],
      ["MAC de destino conhecido", "Envia só pela porta anotada"],
      ["MAC de destino desconhecido", "Envia por todas as portas (flooding)"],
      ["Destino de difusão (ff:ff:ff:ff:ff:ff)", "Envia por todas as portas"],
    ] },
    { tipo: "h3", texto: "Pratique" },
    { tipo: "numerada", itens: [
      "Ligue cada PC a uma porta do switch. Os PCs já vêm com IP; a máscara é 255.255.255.0.",
      "Antes de qualquer ping, abra o terminal do switch e digite show mac address-table. A tabela está vazia.",
      "No PC1, execute ping 192.168.10.13 e observe o ARP chegando ao PC2 e ao PC3 (flooding), mas só o PC3 respondendo.",
      "Volte ao switch e repita o show: agora ele conhece o MAC do PC1 e o do PC3, cada um com sua porta.",
    ] },
    { tipo: "dica", titulo: "Hub, o ancestral do switch", texto: "O hub antigo repetia tudo por todas as portas, sempre. O switch só faz isso quando não sabe o destino, e é por isso que redes comutadas são rápidas e mais seguras contra espionagem de quem está ao lado." },
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
      { tipo: "switch", numero: 1, x: 190, y: 60 },
      { tipo: "roteador", numero: 1, x: 340, y: 150, config: { portas: { "Gi0/0": { ip: "10.0.1.1", mascara: "255.255.255.0" }, "Gi0/1": { ip: "10.0.2.1", mascara: "255.255.255.0" } } } },
      { tipo: "switch", numero: 2, x: 490, y: 60 },
      { tipo: "servidor", numero: 1, x: 640, y: 60, config: { ip: "10.0.2.10" } },
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
  teoria: [
    { tipo: "p", texto: "O PC1 está na rede 10.0.1.0/24 e o servidor na 10.0.2.0/24. São redes diferentes, e um switch não liga redes diferentes: quem faz isso é o roteador. O roteador tem uma interface em cada rede e encaminha pacotes entre elas." },
    { tipo: "p", texto: "Mas como o PC1 sabe que precisa do roteador? Pelo gateway padrão, o endereço do roteador na rede do PC. A regra do computador é simples: se o destino está na minha rede, falo direto; se não está, entrego ao gateway e deixo que ele resolva." },
    { tipo: "h3", texto: "Seu desafio nesta aula" },
    { tipo: "p", texto: "A topologia já está montada, e o roteador já tem seus IPs (10.0.1.1 e 10.0.2.1). Falta dizer aos computadores quem é o gateway deles. Configure o gateway no PC1 e no servidor e dê o ping." },
    { tipo: "lista", itens: [
      "O gateway do PC1 é o endereço do roteador na rede do PC1: 10.0.1.1.",
      "O gateway do servidor é o endereço do roteador na rede do servidor: 10.0.2.1.",
      "O ping de ida só funciona se a resposta também souber voltar. Por isso os dois lados precisam do gateway.",
    ] },
    { tipo: "h3", texto: "TTL: o prazo de validade do pacote" },
    { tipo: "p", texto: "Todo pacote IP carrega um TTL (tempo de vida), um contador que cada roteador diminui em um. Se chega a zero, o pacote é descartado. Isso impede que erros de configuração façam pacotes circularem para sempre. No terminal você verá o TTL da resposta menor que o inicial, e a diferença conta quantos roteadores o pacote atravessou." },
    { tipo: "dica", titulo: "Descubra o caminho", texto: "No PC1, depois que o ping funcionar, rode tracert 10.0.2.10. Ele mostra cada roteador no caminho, usando o TTL de propósito: manda pacotes com TTL 1, 2, 3... e anota quem avisa que o tempo acabou." },
  ],
  solucao: [
    "PC1: gateway 10.0.1.1.",
    "Servidor: gateway 10.0.2.1.",
    "No terminal do PC1: ping 10.0.2.10 e tracert 10.0.2.10.",
  ],
};
