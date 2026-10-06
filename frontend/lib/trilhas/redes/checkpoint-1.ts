import type { Checkpoint } from "../tipos";

export const REDES_CHECKPOINT_1: Checkpoint = {
  tipo: "checkpoint",
  slug: "checkpoint-fundamentos-de-redes",
  titulo: "Checkpoint: fundamentos de redes",
  resumo: "Nove questões sobre endereços IP e máscaras, switches e VLANs, roteadores, gateways e diagnóstico de conectividade.",
  cobre: [
    "enderecos-ip-mascaras-e-ping",
    "switches-mac-e-vlans",
    "roteadores-gateways-e-rotas",
  ],
  notaMinima: 0.7,
  questoes: [
    {
      enunciado: "Qual é o endereço da rede de um dispositivo com IP 192.168.1.77 e máscara 255.255.255.192 (/26)?",
      opcoes: ["192.168.1.0", "192.168.1.64", "192.168.1.76", "192.168.1.128"],
      correta: 1,
      explicacao: "Com /26 as redes crescem de 64 em 64: .0, .64, .128, .192. O endereço .77 está entre .64 e .127, então a rede é 192.168.1.64.",
    },
    {
      enunciado: "Quantos endereços utilizáveis tem uma rede /26?",
      opcoes: ["64", "62", "30", "126"],
      correta: 1,
      explicacao: "Há 6 bits de dispositivo, ou seja, 2^6 = 64 endereços, menos o de rede e o de transmissão: 62 utilizáveis.",
    },
    {
      enunciado: "O PC A (10.0.0.5/24) quer falar com o PC B (10.0.1.5/24), no mesmo switch e sem gateway configurado. O que ocorre?",
      opcoes: ["Funciona, porque o switch conecta os dois", "Falha: B está em outra rede e A não tem um gateway para entregar o pacote", "Funciona, mas só com ARP", "Funciona após o primeiro pacote"],
      correta: 1,
      explicacao: "Com /24, as redes 10.0.0.0 e 10.0.1.0 são diferentes. O switch não faz roteamento, e sem gateway o computador não tem para onde enviar o pacote.",
    },
    {
      enunciado: "O que o ARP resolve em uma rede local?",
      opcoes: ["O MAC correspondente a um endereço IP da rede", "O IP correspondente a um nome de site", "A rota até outra rede", "A VLAN de uma porta"],
      correta: 0,
      explicacao: "O ARP pergunta em transmissão quem tem determinado IP e recebe o MAC como resposta, o que permite montar o quadro Ethernet. Nomes de sites são tarefa do DNS.",
    },
    {
      enunciado: "Um switch recebe um quadro cujo MAC de destino não está na sua tabela. O que ele faz?",
      opcoes: ["Descarta o quadro", "Pergunta ao roteador onde está o MAC", "Envia por todas as portas da mesma VLAN, menos a de entrada", "Envia apenas pela porta do uplink"],
      correta: 2,
      explicacao: "Destino desconhecido causa flooding: o quadro sai por todas as portas da VLAN, exceto a de entrada. A resposta do destino ensina o switch onde ele está.",
    },
    {
      enunciado: "O que as VLANs conseguem fazer em um único switch?",
      opcoes: ["Aumentar a velocidade das portas", "Dividir o switch em redes lógicas isoladas, cada uma com seu domínio de broadcast", "Substituir o roteador em qualquer cenário", "Criptografar os quadros"],
      correta: 1,
      explicacao: "Cada VLAN é uma rede local lógica com seu próprio broadcast. Comunicação entre VLANs exige um roteador, o que permite aplicar regras de segurança.",
    },
    {
      enunciado: "Um PC está com cabo, IP e máscara corretos, mas nenhum colega do departamento o alcança. A porta do switch está na VLAN 10, e os colegas na VLAN 20. Qual a correção?",
      opcoes: ["Trocar o cabo", "Mudar o IP do PC para outra rede", "Colocar a porta do PC na VLAN 20", "Reiniciar o roteador"],
      correta: 2,
      explicacao: "A porta na VLAN errada isola o PC dos colegas. Atribuí-la à VLAN do departamento restabelece a comunicação, mantendo as demais VLANs isoladas.",
    },
    {
      enunciado: "Um roteador tem rotas 10.0.0.0/8 via A, 10.1.0.0/16 via B e 0.0.0.0/0 via C. Para onde vai um pacote com destino 10.1.5.9?",
      opcoes: ["Para A", "Para B", "Para C", "É descartado"],
      correta: 1,
      explicacao: "As três rotas cobrem o destino, mas a regra do prefixo mais longo escolhe a mais específica, a 10.1.0.0/16 via B.",
    },
    {
      enunciado: "O ping de um PC para um servidor em outra rede devolve 'Host de destino inacessível (resposta de 10.1.0.1)'. O que isso indica?",
      opcoes: ["O cabo do PC está solto", "O roteador 10.1.0.1 recebeu o pacote, mas não tem rota para o destino", "O servidor está desligado", "A máscara do PC está errada"],
      correta: 1,
      explicacao: "A mensagem veio do roteador, então o pacote chegou até ele. Quem responde 'inacessível' é o roteador que não encontra rota para o destino. O defeito está nele ou depois dele.",
    },
  ],
};
