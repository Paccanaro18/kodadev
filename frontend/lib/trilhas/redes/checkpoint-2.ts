import type { Checkpoint } from "../tipos";

export const REDES_CHECKPOINT_2: Checkpoint = {
  tipo: "checkpoint",
  slug: "checkpoint-servicos-e-filtragem",
  titulo: "Checkpoint: serviços de rede e filtragem",
  resumo: "Nove questões sobre DHCP, DNS, ACLs e diagnóstico de falhas de endereço, nome e filtragem.",
  cobre: [
    "dhcp-e-dns",
    "acls-e-firewall",
  ],
  notaMinima: 0.7,
  questoes: [
    {
      enunciado: "Um computador mostra o endereço 169.254.3.8 no ipconfig, e o DHCP está habilitado. O que verificar primeiro?",
      opcoes: ["Se o servidor DHCP está alcançável: cabo, VLAN, serviço ligado e pool com endereços livres", "Se o gateway do roteador tem uma rota padrão", "Se o nome do computador está no DNS", "Se há uma ACL de saída na internet"],
      correta: 0,
      explicacao: "O endereço 169.254.x.x aparece quando nenhum servidor DHCP respondeu. As causas típicas estão entre o cliente e o servidor, ou no próprio pool.",
    },
    {
      enunciado: "Qual a ordem das mensagens na conversa DHCP?",
      opcoes: ["Request, ack, discover, offer", "Discover, offer, request, ack", "Offer, request, discover, ack", "Discover, request, ack, offer"],
      correta: 1,
      explicacao: "O cliente descobre, o servidor oferece, o cliente pede aquela oferta e o servidor confirma.",
    },
    {
      enunciado: "Por que um cliente atrás de um roteador não recebe endereço de um servidor DHCP da outra rede, sem configuração extra?",
      opcoes: ["Porque o servidor DHCP só atende IPv6", "Porque o discover é um broadcast, e roteadores não repassam broadcasts sem um agente de relay", "Porque o roteador cobra por endereço entregue", "Porque o cliente não tem MAC"],
      correta: 1,
      explicacao: "O broadcast fica restrito à rede local. Para atender outra rede, o roteador precisa ser configurado como agente de relay e reenviar o pedido ao servidor.",
    },
    {
      enunciado: "O ping para 10.0.0.30 funciona, mas o ping para loja.koda.local falha. Qual o diagnóstico mais provável?",
      opcoes: ["A rede está quebrada", "O cabo está solto", "O problema é de resolução de nomes: DNS não configurado, desligado ou com registro errado", "O endereço 10.0.0.30 é inválido"],
      correta: 2,
      explicacao: "O ping por IP prova que a rede funciona. O que falha é a tradução do nome, e o nslookup mostra onde: sem servidor DNS, servidor sem resposta ou nome inexistente.",
    },
    {
      enunciado: "O nslookup de loja.koda.local devolve 10.0.0.99, mas o servidor real da loja é o 10.0.0.30. Onde está o defeito?",
      opcoes: ["No gateway do cliente", "No registro do servidor DNS, que aponta para um endereço antigo", "Na máscara do cliente", "No switch"],
      correta: 1,
      explicacao: "O nome resolveu, mas para um endereço errado. O registro no servidor DNS precisa ser corrigido para o endereço atual do servidor.",
    },
    {
      enunciado: "Como o roteador avalia uma ACL?",
      opcoes: ["De cima para baixo, aplicando a primeira regra que casa com o pacote", "Todas as regras juntas, valendo a mais restritiva", "De baixo para cima, valendo a última regra", "Só a primeira regra, ignorando as demais"],
      correta: 0,
      explicacao: "A avaliação é sequencial, do topo para baixo, e a primeira regra que casa decide. As seguintes são ignoradas para aquele pacote.",
    },
    {
      enunciado: "Depois de aplicar uma ACL com uma única regra negar, todo o tráfego daquela interface parou. Por quê?",
      opcoes: ["A regra negar é sempre aplicada a todos", "O negar implícito do fim da lista descarta tudo o que nenhuma regra permitiu", "A interface foi desligada pela ACL", "O roteador perdeu a rota padrão"],
      correta: 1,
      explicacao: "Toda ACL com ao menos uma regra termina com um negar implícito. Para o resto continuar passando, é preciso uma regra permitir depois do negar.",
    },
    {
      enunciado: "Uma ACL de entrada na interface do PC permite o ping ao servidor, mas o ping falha. A ACL da interface do servidor não permite o tráfego de volta. O que descreve a situação?",
      opcoes: ["A ACL não guarda estado, então ida e volta precisam ser permitidas separadamente", "O ping nunca funciona com ACL", "O servidor precisa de um endereço MAC novo", "A ACL do PC está errada, e não a do servidor"],
      correta: 0,
      explicacao: "Sem estado, a resposta é só mais um pacote para a ACL. Ela entra pela interface do servidor e precisa ser permitida ali.",
    },
    {
      enunciado: "Dois itens de uma ACL: (1) permitir qualquer qualquer; (2) negar icmp de um PC ao servidor. O que acontece com o ping desse PC?",
      opcoes: ["É negado, pela regra 2", "É permitido, pois a regra 1 casa primeiro e a 2 nunca é lida", "É negado, pois o negar vence o permitir", "Depende do endereço do servidor"],
      correta: 1,
      explicacao: "A primeira regra que casa decide. Com o permitir geral no topo, a regra específica abaixo nunca é consultada. As mais específicas devem vir antes.",
    },
  ],
};
