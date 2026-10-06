import type { Modulo } from "../tipos";

export const REDES_MODULO_3: Modulo = {
  tipo: "modulo",
  slug: "roteadores-gateways-e-rotas",
  titulo: "Roteadores, gateways e rotas",
  resumo: "Como um roteador liga redes diferentes, o que é o gateway padrão, como a tabela de roteamento escolhe o caminho, para que serve o TTL e como diagnosticar rotas faltando com ping e traceroute.",
  nivel: "Iniciante",
  leitura: "45 min",
  objetivos: [
    "Explicar o que um roteador faz que um switch não faz e por que cada interface dele fica em uma rede diferente.",
    "Configurar o gateway padrão de um computador e explicar por que ele precisa estar na mesma rede.",
    "Ler uma tabela de roteamento com rotas conectadas, estáticas e padrão, e prever qual rota será usada para um destino.",
    "Descrever o papel do TTL e usar o traceroute para descobrir o caminho de um pacote.",
    "Diagnosticar e corrigir uma falha de conectividade causada por rota ausente, gateway errado ou rota de volta faltando.",
  ],
  preRequisitos: [
    "As aulas anteriores: endereços IP e máscaras, switches e ARP.",
  ],
  pontosChave: [
    "O roteador liga redes diferentes e decide o próximo salto de cada pacote consultando a tabela de roteamento.",
    "O gateway padrão é o endereço do roteador na rede do computador, e é para lá que vai tudo o que está fora da rede local.",
    "Uma conversa precisa de caminho de ida e de volta: os dois lados precisam saber alcançar o outro.",
    "O roteador escolhe a rota mais específica (maior prefixo), e a rota padrão 0.0.0.0/0 serve para o que não tem rota melhor.",
    "O TTL cai de um em cada roteador e protege a rede contra laços, e o traceroute o usa para listar o caminho.",
  ],
  blocos: [
    { tipo: "p", texto: "Até aqui todos os dispositivos estavam na mesma rede, e o switch bastava. O mundo real, porém, é feito de muitas redes interligadas: a da sua casa, a do seu provedor, a do datacenter onde o site está. A tarefa de levar pacotes de uma rede a outra é do roteador. Ele é o equipamento que transformou redes isoladas na internet, e entendê-lo é o passo que separa quem usa uma rede de quem a projeta." },
    { tipo: "dica", titulo: "Três laboratórios para esta aula", texto: "Em Redes, faça Duas redes e um roteador para o gateway e o ping entre redes, o desafio A filial sem rota para as rotas estáticas, e use o traceroute nos dois. O terminal do roteador tem show ip route, show ip interface brief e show arp." },

    { tipo: "h", texto: "O que o roteador faz" },
    { tipo: "p", texto: "Um roteador tem várias interfaces, e cada uma está em uma rede IP diferente. Ele recebe um pacote por uma interface, olha o endereço IP de destino, decide por qual interface e para qual vizinho o pacote deve seguir, e o reenvia. Essa decisão usa a tabela de roteamento, uma lista de redes conhecidas e de como chegar a cada uma. O roteador trabalha na camada de rede e se baseia no IP, enquanto o switch trabalha no enlace e se baseia no MAC." },
    { tipo: "tabela", legenda: "Switch e roteador", cabecalho: ["Característica", "Switch", "Roteador"], linhas: [
      ["Camada", "Enlace (MAC)", "Rede (IP)"],
      ["O que liga", "Dispositivos de uma mesma rede", "Redes diferentes"],
      ["Como decide", "Tabela MAC, aprendida sozinha", "Tabela de roteamento, configurada ou aprendida por protocolos"],
      ["Broadcast", "Repassa (dentro da VLAN)", "Bloqueia: cada interface é um domínio de broadcast"],
      ["Endereço nas portas", "Nenhum IP necessário", "Cada interface tem IP e máscara"],
    ] },
    { tipo: "p", texto: "Uma consequência importante: o roteador não repassa broadcasts. Isso é uma vantagem, pois separa as redes e impede que o barulho de uma atrapalhe a outra. Por isso a internet inteira não é um único domínio de broadcast, o que seria impossível." },

    { tipo: "h", texto: "O gateway padrão" },
    { tipo: "p", texto: "Um computador comum não tem tabela de rotas complicada. Ele segue uma regra de duas linhas: se o destino está na minha rede, falo direto; senão, entrego ao gateway padrão. O gateway é o endereço do roteador na rede do computador. Ele é a porta de saída, e é a única coisa que o computador precisa saber sobre o resto do mundo." },
    { tipo: "p", texto: "O gateway precisa estar na mesma rede do computador, porque o computador tem que conseguir falar diretamente com ele, usando ARP e um quadro. Por isso, em uma rede 10.0.1.0/24 cujo roteador tem o endereço 10.0.1.1, o gateway dos computadores é 10.0.1.1, e nunca o endereço do roteador na outra rede. Um gateway fora da rede local é um erro de configuração clássico, e o simulador avisa quando acontece." },
    { tipo: "codigo", linguagem: "text", legenda: "Uma rede com um roteador e duas redes", texto: `   Rede A: 10.0.1.0/24                    Rede B: 10.0.2.0/24

  [PC1]---[Switch1]---(Gi0/0)[Roteador1](Gi0/1)---[Switch2]---[Servidor1]
 10.0.1.10              10.0.1.1       10.0.2.1               10.0.2.10
 gateway: 10.0.1.1                                       gateway: 10.0.2.1` },
    { tipo: "p", texto: "Quando o PC1 faz ping no servidor, ele percebe que 10.0.2.10 não está na rede 10.0.1.0/24. Então faz ARP não pelo servidor, mas pelo gateway, descobre o MAC do roteador, e envia o quadro para esse MAC com o pacote IP de destino 10.0.2.10. O roteador abre o quadro, vê o destino, consulta a tabela, e refaz o quadro com o MAC do servidor para entregar na outra rede. O IP do pacote não mudou, mas os MACs mudaram em cada salto." },
    { tipo: "alerta", titulo: "O caminho de volta também importa", texto: "Um ping tem ida e volta. Se o PC1 sabe chegar ao servidor, mas o servidor não tem gateway para responder, o pedido chega e a resposta se perde. Por isso nos laboratórios os dois lados precisam do gateway configurado." },

    { tipo: "h", texto: "A tabela de roteamento" },
    { tipo: "p", texto: "A tabela de roteamento de um roteador tem uma linha por rede conhecida: a rede de destino com a máscara, e como chegar lá. Há dois tipos básicos de entrada. As rotas conectadas aparecem sozinhas quando você configura o IP de uma interface: o roteador sabe, por definição, que a rede daquela interface está diretamente ligada. As rotas estáticas são escritas pelo administrador e dizem: para chegar à rede X, entregue ao roteador vizinho Y, o próximo salto." },
    { tipo: "codigo", linguagem: "text", legenda: "show ip route no Roteador1 (A filial sem rota, já resolvido)", texto: `Roteador1> show ip route
Códigos: C - conectada, S - estática

C    10.1.0.0/24 está diretamente conectada, Gi0/0
C    10.2.0.0/24 está diretamente conectada, Gi0/1
S    10.3.0.0/24 via 10.2.0.2` },
    { tipo: "p", texto: "Quando um pacote chega, o roteador procura na tabela todas as rotas que cobrem o destino e escolhe a mais específica, a de maior prefixo. É a regra do prefixo mais longo: uma rota para 10.9.0.0/16 vence uma rota para 10.0.0.0/8, porque descreve melhor aquele destino. A rota padrão, 0.0.0.0/0, tem prefixo zero e cobre qualquer destino, mas por ter o menor prefixo possível só é usada quando nada mais específico existe. Ela funciona como o gateway do roteador: para o que eu não conheço, mande por aqui." },
    { tipo: "tabela", legenda: "Qual rota o roteador escolhe?", cabecalho: ["Tabela", "Destino", "Rota escolhida"], linhas: [
      ["10.9.0.0/16 via A; 0.0.0.0/0 via B", "10.9.1.1", "10.9.0.0/16 via A (mais específica)"],
      ["10.9.0.0/16 via A; 0.0.0.0/0 via B", "8.8.8.8", "0.0.0.0/0 via B (padrão, nada mais cobre)"],
      ["10.3.0.0/24 conectada; 10.0.0.0/8 via C", "10.3.0.50", "10.3.0.0/24 conectada (a mais específica)"],
      ["10.2.0.0/24 conectada; sem rota padrão", "172.16.0.5", "Nenhuma: o pacote é descartado e o remetente é avisado"],
    ] },

    { tipo: "h", texto: "Rotas estáticas na prática" },
    { tipo: "p", texto: "No desafio A filial sem rota, há dois roteadores em fila: o da matriz e o da filial. Cada um conhece só as suas redes conectadas. O Roteador1 não sabe que existe a rede 10.3.0.0/24 do servidor, e o Roteador2 não sabe da 10.1.0.0/24 do PC. O ping do PC ao servidor chega ao Roteador1, que não tem rota e devolve ao PC uma mensagem ICMP de destino inacessível. Para consertar, cada roteador precisa de uma rota para a rede do outro lado." },
    { tipo: "lista", itens: [
      "Roteador1: rota para 10.3.0.0/24, com próximo salto 10.2.0.2 (a interface do Roteador2 na rede de ligação).",
      "Roteador2: rota para 10.1.0.0/24, com próximo salto 10.2.0.1 (a interface do Roteador1 na rede de ligação).",
      "O próximo salto sempre é um endereço de uma rede à qual o roteador está diretamente conectado. Um próximo salto inalcançável torna a rota inútil.",
      "Em redes pequenas, uma rota padrão resolve de uma vez: o Roteador2, que só tem uma saída, pode apontar 0.0.0.0/0 para o Roteador1.",
    ] },
    { tipo: "codigo", linguagem: "text", legenda: "Antes da correção: o roteador avisa que não há rota", texto: `PC1> ping 10.3.0.10
Disparando contra 10.3.0.10 com 32 bytes de dados:
Resposta de 10.1.0.1: Host de destino inacessível.
Resposta de 10.1.0.1: Host de destino inacessível.
Resposta de 10.1.0.1: Host de destino inacessível.
Resposta de 10.1.0.1: Host de destino inacessível.

Diagnóstico: Host de destino inacessível (resposta de 10.1.0.1).` },
    { tipo: "p", texto: "Perceba quem respondeu: 10.1.0.1, o Roteador1. A mensagem de inacessível partiu do roteador onde o pacote parou. Isso dá uma pista valiosa de diagnóstico: o problema está nesse roteador ou depois dele, e não no PC nem na rede local. Quando não vem resposta nenhuma, o defeito costuma estar antes, no cabo, na VLAN, no gateway ou no ARP." },

    { tipo: "h", texto: "TTL e traceroute" },
    { tipo: "p", texto: "Todo pacote IP carrega um campo chamado TTL (time to live, tempo de vida). Quem cria o pacote define um valor inicial, como 64, 128 ou 255, e cada roteador que o encaminha subtrai um. Se chega a zero, o roteador descarta o pacote e avisa o remetente com uma mensagem ICMP de tempo excedido. O TTL existe para proteger a rede de laços de roteamento: sem ele, um pacote em um ciclo circularia para sempre." },
    { tipo: "p", texto: "A diferença entre o TTL inicial e o TTL da resposta diz quantos roteadores foram atravessados. Em um ping que volta com TTL 62, quando o servidor responde com 64, o pacote passou por dois roteadores no caminho de volta. O traceroute leva a ideia adiante: ele envia pacotes com TTL 1, depois 2, depois 3, e cada roteador intermediário, ao zerar o TTL, se identifica na resposta de tempo excedido. Assim você recebe a lista de roteadores do caminho." },
    { tipo: "codigo", linguagem: "text", legenda: "traceroute no simulador", texto: `PC1> tracert 10.3.0.10
Rastreando a rota para 10.3.0.10 com no máximo 8 saltos:

  1    <1 ms    10.1.0.1
  2    <1 ms    10.2.0.2
  3    <1 ms    10.3.0.10

Rastreamento concluído.` },
    { tipo: "alerta", titulo: "Laços de roteamento", texto: "Se o Roteador1 manda o tráfego para o Roteador2 e o Roteador2 manda de volta para o Roteador1, o pacote fica ricocheteando até o TTL zerar. O simulador reproduz isso: o ping termina com 'Tempo de vida excedido' e o traceroute mostra os mesmos dois endereços se repetindo. É o sinal inconfundível de um laço." },

    { tipo: "h", texto: "Um roteiro para diagnosticar problemas de roteamento" },
    { tipo: "numerada", itens: [
      "Teste a rede local primeiro: o PC alcança o gateway? Se não, o problema é de cabo, VLAN, IP ou máscara.",
      "Se o gateway responde, mas o destino não, rode o traceroute e veja até onde o pacote chega.",
      "No último roteador que respondeu, use show ip route e procure uma rota que cubra o destino. Se não houver, é a causa.",
      "Verifique o caminho de volta: o destino sabe chegar de volta à rede de origem? Ele tem gateway? Os roteadores do caminho têm rota para a rede de origem?",
      "Confira o próximo salto de cada rota: ele deve estar em uma rede diretamente conectada ao roteador.",
    ] },

    { tipo: "h", texto: "Pondo em prática no simulador" },
    { tipo: "numerada", itens: [
      "Faça Duas redes e um roteador: configure o gateway no PC1 (10.0.1.1) e no servidor (10.0.2.1). Dê o ping, rode tracert, e observe o TTL da resposta.",
      "Faça A filial sem rota: abra a janela de cada roteador, use Adicionar rota, e preencha rede, máscara e próximo salto. Teste nos dois sentidos.",
      "Quebre de propósito: coloque um gateway em outra rede, apague uma rota, crie um laço apontando um roteador para o outro. Observe como cada falha aparece no diagnóstico.",
    ] },
  ],
  questoes: [
    {
      enunciado: "Qual é a principal função de um roteador?",
      opcoes: ["Ligar dispositivos da mesma rede por meio dos endereços MAC", "Encaminhar pacotes entre redes diferentes usando o endereço IP de destino", "Traduzir nomes de sites em endereços IP", "Distribuir energia elétrica pelos cabos"],
      correta: 1,
      explicacao: "O roteador conecta redes diferentes e escolhe o próximo salto com base no IP de destino, consultando a tabela de roteamento. Ligar dispositivos da mesma rede é o papel do switch.",
    },
    {
      enunciado: "O que é o gateway padrão de um computador?",
      opcoes: ["O endereço do servidor DNS", "O endereço do roteador na rede do computador, para onde vai o tráfego destinado a outras redes", "O endereço de transmissão da rede", "O endereço do próprio computador"],
      correta: 1,
      explicacao: "O gateway padrão é a porta de saída da rede: o endereço do roteador, na mesma rede do computador, que recebe tudo o que está fora da rede local.",
    },
    {
      enunciado: "Um PC com IP 10.0.1.10/24 está com o gateway 10.0.2.1. O que acontece quando ele tenta falar com outra rede?",
      opcoes: ["Funciona normalmente, pois o roteador é um só", "Falha, pois o gateway está fora da rede do PC e não pode ser alcançado diretamente", "Funciona, mas só para destinos próximos", "O roteador corrige o endereço sozinho"],
      correta: 1,
      explicacao: "O PC só consegue falar diretamente com endereços da sua própria rede (via ARP). Um gateway em outra rede é inalcançável, e o ping falha com o diagnóstico de gateway inválido.",
    },
    {
      enunciado: "O PC1 faz ping no servidor, que está em outra rede. O pedido chega ao servidor, mas o ping falha. Qual a causa mais provável?",
      opcoes: ["O servidor não tem gateway ou rota para responder de volta à rede do PC1", "O PC1 tem a máscara maior que a do servidor", "O switch está sem endereço IP", "O ping não funciona entre redes diferentes"],
      correta: 0,
      explicacao: "Comunicação precisa de ida e volta. Se o servidor não sabe como chegar à rede do PC1, a resposta se perde, mesmo com o pedido tendo chegado.",
    },
    {
      enunciado: "Um roteador tem as rotas 10.0.0.0/8 via A e 10.9.0.0/16 via B. Para qual vizinho ele envia um pacote destinado a 10.9.3.4?",
      opcoes: ["Para A, porque a rota /8 foi cadastrada primeiro", "Para B, porque a rota /16 é mais específica (maior prefixo)", "Para os dois, duplicando o pacote", "Descarta o pacote, pois há duas rotas possíveis"],
      correta: 1,
      explicacao: "Vale a regra do prefixo mais longo: entre as rotas que cobrem o destino, a mais específica vence. O /16 descreve melhor o destino do que o /8.",
    },
    {
      enunciado: "Para que serve a rota padrão 0.0.0.0/0 em um roteador?",
      opcoes: ["Para bloquear qualquer tráfego desconhecido", "Para encaminhar os pacotes cujo destino não tem nenhuma rota mais específica", "Para configurar o endereço da própria interface", "Para anunciar a rede ao provedor"],
      correta: 1,
      explicacao: "A rota padrão cobre qualquer destino, mas por ter prefixo zero só é usada quando nada mais específico existe. Funciona como um gateway do roteador.",
    },
    {
      enunciado: "O que o TTL de um pacote IP controla, e o que acontece quando ele chega a zero?",
      opcoes: ["O tempo em segundos que o pacote pode ficar em um switch", "A velocidade do enlace; ao chegar a zero, o cabo é desligado", "O número de roteadores que o pacote pode atravessar; ao chegar a zero é descartado e o remetente é avisado", "A quantidade de dados do pacote"],
      correta: 2,
      explicacao: "Cada roteador subtrai um do TTL. Quando zera, o pacote é descartado e o remetente recebe um ICMP de tempo excedido. Isso impede pacotes de circularem eternamente em laços.",
    },
    {
      enunciado: "Como o traceroute descobre os roteadores do caminho até um destino?",
      opcoes: ["Consultando a tabela de roteamento de cada roteador por SSH", "Enviando pacotes com TTL crescente (1, 2, 3...), de modo que cada roteador, ao zerar o TTL, se identifica na resposta", "Pedindo ao servidor de destino a lista de saltos", "Lendo a tabela ARP do computador"],
      correta: 1,
      explicacao: "O traceroute aproveita as mensagens de tempo excedido: com TTL 1 o primeiro roteador responde, com TTL 2 o segundo, e assim por diante até o destino.",
    },
  ],
  desafio: {
    titulo: "Três redes, dois roteadores e nenhuma rota esquecida",
    enunciado: "Conclua no simulador do Koda os laboratórios Duas redes e um roteador e A filial sem rota. Depois, monte uma topologia própria com três redes e dois roteadores em fila, configure as rotas necessárias nos dois sentidos, prove com ping e traceroute que tudo se alcança e, em seguida, provoque e documente dois defeitos.",
    requisitos: [
      "Concluir Duas redes e um roteador, com gateway configurado nos dois lados.",
      "Concluir A filial sem rota com rotas estáticas nos dois roteadores.",
      "Montar três redes (por exemplo 10.1.0.0/24, 10.2.0.0/24 e 10.3.0.0/24) ligadas por dois roteadores, com um PC em cada ponta, e configurar as rotas até todos se alcançarem.",
      "Provocar dois defeitos (um gateway errado e uma rota de volta ausente) e registrar o diagnóstico do simulador em cada caso.",
    ],
    criterios: [
      "Os dois laboratórios aparecem como concluídos na área Redes.",
      "O traceroute entre os PCs das pontas lista os dois roteadores e o destino.",
      "A tabela de rotas de cada roteador mostra as redes conectadas e as estáticas necessárias.",
      "Você explica por que a falta da rota de volta faz o pedido chegar sem a resposta voltar.",
    ],
    dica: "Se três redes estão em fila, o roteador do meio precisa de rotas para as duas pontas, e cada ponta pode usar uma rota padrão apontando para o vizinho.",
  },
  referencias: [
    { titulo: "RFC 1812: Requirements for IP Version 4 Routers", url: "https://datatracker.ietf.org/doc/html/rfc1812" },
    { titulo: "RFC 792: Internet Control Message Protocol", url: "https://datatracker.ietf.org/doc/html/rfc792" },
    { titulo: "Amazon VPC: tabelas de rotas", url: "https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html" },
  ],
};
