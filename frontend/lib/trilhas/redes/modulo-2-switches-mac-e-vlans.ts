import type { Modulo } from "../tipos";

export const REDES_MODULO_2: Modulo = {
  tipo: "modulo",
  slug: "switches-mac-e-vlans",
  titulo: "Switches, endereços MAC e VLANs",
  resumo: "Como um switch liga vários dispositivos, aprende em qual porta cada MAC está, decide quando inundar a rede e como as VLANs dividem um mesmo switch em redes separadas.",
  nivel: "Iniciante",
  leitura: "40 min",
  objetivos: [
    "Explicar a diferença entre um quadro Ethernet e um pacote IP, e entre endereço MAC e endereço IP.",
    "Descrever como o switch aprende endereços MAC e o que faz com destinos conhecidos, desconhecidos e de transmissão.",
    "Ler uma tabela MAC e prever por qual porta um quadro sairá.",
    "Explicar o que é um domínio de broadcast e por que ele precisa ser limitado.",
    "Configurar VLANs de acesso para isolar departamentos no mesmo switch e diagnosticar uma porta na VLAN errada.",
  ],
  preRequisitos: [
    "A aula Endereços IP, máscaras e o primeiro ping, ou o conhecimento básico de IP, máscara e ARP.",
  ],
  pontosChave: [
    "O switch trabalha com endereços MAC, na camada de enlace, e não conhece IP.",
    "Ele aprende sozinho: cada quadro recebido ensina em qual porta está o MAC de origem.",
    "Destino conhecido sai por uma só porta, e destino desconhecido ou de transmissão sai por todas as outras (flooding).",
    "Uma VLAN separa portas de um mesmo switch em redes lógicas isoladas, cada uma com seu próprio domínio de broadcast.",
    "Dispositivos em VLANs diferentes só se alcançam por um roteador, e uma porta na VLAN errada faz o computador sumir mesmo com IP e cabo corretos.",
  ],
  blocos: [
    { tipo: "p", texto: "Na aula anterior dois computadores conversavam por um único cabo. Esse arranjo não escala: um cabo liga só dois dispositivos, e uma rede real tem dezenas ou milhares. O equipamento que resolve o problema é o switch, uma caixa com várias portas que recebe quadros de um lado e os entrega ao lado correto. Entender como ele decide é a chave para compreender redes locais, desde um escritório pequeno até o switch de topo de rack de um datacenter." },
    { tipo: "dica", titulo: "Pratique enquanto lê", texto: "Os laboratórios O switch: aprendendo quem está em cada porta e A porta na VLAN errada, em Redes, cobrem esta aula inteira. O terminal do switch tem os comandos show mac address-table e show vlan brief para você espiar o que ele aprendeu." },

    { tipo: "h", texto: "Quadros, MACs e a camada de enlace" },
    { tipo: "p", texto: "Os dados em rede viajam em camadas, cada uma com a sua unidade e o seu endereço. Na camada de rede, a unidade é o pacote, e o endereço é o IP, que identifica o dispositivo na rede como um todo. Na camada de enlace, que cuida de um único salto entre dois vizinhos diretos, a unidade é o quadro (frame), e o endereço é o MAC. O quadro Ethernet embrulha o pacote IP, com o MAC de destino e o MAC de origem no cabeçalho." },
    { tipo: "p", texto: "O endereço MAC é um número de 48 bits, normalmente escrito em seis pares hexadecimais, como 02:00:00:01:01:00. Ele é gravado na placa de rede pelo fabricante, e os três primeiros pares identificam o fabricante. O MAC só tem significado dentro da rede local: ele nunca atravessa um roteador, porque a cada salto o quadro é aberto e refeito com novos MACs. Já o IP de origem e de destino permanece o mesmo do começo ao fim da viagem." },
    { tipo: "tabela", legenda: "IP e MAC lado a lado", cabecalho: ["Característica", "Endereço IP", "Endereço MAC"], linhas: [
      ["Camada", "Rede (camada 3)", "Enlace (camada 2)"],
      ["Tamanho", "32 bits (IPv4)", "48 bits"],
      ["Quem atribui", "O administrador ou o DHCP", "O fabricante da placa"],
      ["Alcance", "Atravessa a rede inteira, de ponta a ponta", "Vale apenas dentro da rede local, em cada salto"],
      ["Quem usa para decidir", "Roteadores", "Switches"],
    ] },
    { tipo: "codigo", linguagem: "text", legenda: "Um quadro Ethernet carregando um ping", texto: `Quadro Ethernet
  MAC de destino : 02:00:00:01:03:00   (PC3)
  MAC de origem  : 02:00:00:01:01:00   (PC1)
  Carga:
    Pacote IP
      IP de origem  : 192.168.10.11
      IP de destino : 192.168.10.13
      TTL           : 128
      Protocolo     : ICMP echo request` },

    { tipo: "h", texto: "Como o switch aprende" },
    { tipo: "p", texto: "O switch não precisa ser configurado para saber quem está em cada porta: ele aprende. Toda vez que um quadro chega por uma porta, o switch lê o MAC de origem e anota na tabela MAC que aquele endereço está naquela porta. Essa tabela é a memória do switch. Quando mais tarde precisar entregar um quadro para aquele MAC, ele já sabe por onde enviar." },
    { tipo: "p", texto: "O que fazer com o destino é uma consulta à tabela. Se o MAC de destino é conhecido, o switch envia o quadro apenas pela porta anotada, e as demais portas não recebem nada, o que poupa banda e dificulta a espionagem do tráfego alheio. Se o destino é desconhecido, ou se o quadro é de transmissão (o MAC de destino é ff:ff:ff:ff:ff:ff), o switch envia o quadro por todas as portas, menos a de entrada. Esse comportamento chama-se flooding, e é uma etapa normal enquanto o switch ainda está aprendendo." },
    { tipo: "tabela", legenda: "O algoritmo do switch", cabecalho: ["Quando chega um quadro", "O switch faz"], linhas: [
      ["MAC de origem ainda não está na tabela", "Anota MAC de origem → porta de entrada"],
      ["MAC de destino conhecido em outra porta", "Encaminha só por essa porta"],
      ["MAC de destino conhecido na própria porta de entrada", "Descarta, porque o destino já está do mesmo lado"],
      ["MAC de destino desconhecido", "Inunda: envia por todas as portas, menos a de entrada"],
      ["MAC de destino de transmissão (ff:ff:ff:ff:ff:ff)", "Inunda, pois todos devem receber"],
    ] },
    { tipo: "codigo", linguagem: "text", legenda: "A tabela MAC antes e depois de um ping", texto: `Switch1> show mac address-table
A tabela está vazia: o switch ainda não viu nenhum quadro.

PC1> ping 192.168.10.13

Switch1> show mac address-table
VLAN   Endereço MAC         Porta
1      02:00:00:01:01:00   Fa0/1
1      02:00:00:01:03:00   Fa0/3` },
    { tipo: "p", texto: "Veja o que aconteceu. O pedido ARP do PC1 era de transmissão, então o switch o inundou e aprendeu o MAC do PC1 na porta Fa0/1. O PC3 respondeu ao ARP direto para o PC1, e o switch aprendeu o MAC do PC3 na Fa0/3 e entregou a resposta só na porta do PC1. O PC2, que não era o destino, viu o ARP de transmissão, mas nunca viu o ping. O switch aprendeu a topologia sem nenhuma configuração." },
    { tipo: "alerta", titulo: "O switch não decide por IP", texto: "Um switch comum só olha o MAC. Ele não sabe que o IP 192.168.10.13 existe. O que ele faz é conectar dispositivos de uma mesma rede. Para ligar redes diferentes é preciso um roteador, assunto da próxima aula." },

    { tipo: "h", texto: "Domínios de broadcast e por que eles importam" },
    { tipo: "p", texto: "O conjunto de dispositivos que recebem um quadro de transmissão é um domínio de broadcast. Em um switch simples, todas as portas fazem parte do mesmo domínio: um ARP de um computador chega a todos os outros. Em uma rede pequena isso é irrelevante, mas conforme a rede cresce, o volume de transmissões também cresce e consome banda e processamento de todos os dispositivos. Além disso, quanto maior o domínio, maior o número de máquinas que veem o tráfego de descoberta uns dos outros." },
    { tipo: "p", texto: "Uma solução seria comprar um switch para cada departamento, mas isso é caro e rígido. A solução elegante são as VLANs, que permitem dividir um único switch físico em vários switches lógicos." },

    { tipo: "h", texto: "VLANs: redes virtuais no mesmo equipamento" },
    { tipo: "p", texto: "Uma VLAN (Virtual LAN) é uma rede local lógica. Cada porta do switch é atribuída a uma VLAN, identificada por um número de 1 a 4094. Quadros que entram por uma porta da VLAN 10 só podem sair por portas da VLAN 10, e o mesmo vale para a VLAN 20. Cada VLAN é um domínio de broadcast independente, e o ARP, o flooding e todos os quadros de transmissão ficam restritos a ela." },
    { tipo: "p", texto: "Na prática, as VLANs servem para isolar tipos de tráfego e de pessoas. O financeiro fica em uma VLAN, as vendas em outra, os visitantes em uma terceira, e os servidores em uma quarta. Cada uma costuma ter a sua própria rede IP, como 10.10.0.0/24 para vendas e 10.20.0.0/24 para o financeiro. Se uma pessoa de vendas e uma do financeiro precisarem conversar, o tráfego passa por um roteador, onde é possível aplicar regras de segurança." },
    { tipo: "tabela", legenda: "Um switch, duas VLANs", cabecalho: ["Porta", "VLAN", "Dispositivo", "Rede IP"], linhas: [
      ["Fa0/1", "10", "PC1 (Vendas)", "10.10.0.0/24"],
      ["Fa0/2", "10", "PC2 (Vendas)", "10.10.0.0/24"],
      ["Fa0/3", "20", "PC3 (Financeiro)", "10.20.0.0/24"],
      ["Fa0/4", "20", "PC4 (Financeiro)", "10.20.0.0/24"],
    ] },
    { tipo: "codigo", linguagem: "text", legenda: "Verificando as VLANs de um switch", texto: `Switch1> show vlan brief
VLAN   Portas
10     Fa0/1, Fa0/2
20     Fa0/3, Fa0/4
1      Fa0/5, Fa0/6` },
    { tipo: "p", texto: "As portas descritas até aqui são portas de acesso: cada uma pertence a uma única VLAN, e o computador ligado nela nem sabe que existem VLANs. Em redes maiores, vários switches são ligados entre si por portas de tronco (trunk), que levam o tráfego de várias VLANs juntas, marcando cada quadro com a sua VLAN pelo padrão 802.1Q. Os laboratórios do Koda usam apenas portas de acesso, e o tronco será visto em uma aula futura." },

    { tipo: "h", texto: "Caçando uma porta na VLAN errada" },
    { tipo: "p", texto: "O defeito mais comum com VLANs é uma porta atribuída à VLAN errada. O computador está com cabo, IP e máscara perfeitos, o switch está ligado, e mesmo assim ele não alcança os colegas, porque está, sem querer, em outro domínio de broadcast. Ao dar ping, o ARP é inundado apenas dentro da VLAN dele, e como nenhum colega responde, o ping falha com ARP sem resposta." },
    { tipo: "codigo", linguagem: "text", legenda: "O sintoma no terminal do PC3", texto: `PC3> ping 10.20.0.14
Disparando contra 10.20.0.14 com 32 bytes de dados:
Esgotado o tempo limite do pedido.
Esgotado o tempo limite do pedido.
Esgotado o tempo limite do pedido.
Esgotado o tempo limite do pedido.

Diagnóstico: Sem resposta ARP de 10.20.0.14: ninguém ali tem esse endereço, ou o
caminho até lá está cortado (cabo, VLAN).` },
    { tipo: "lista", itens: [
      "Compare a rede IP de cada computador com a VLAN da porta onde ele está ligado: elas devem corresponder.",
      "Use show vlan brief e procure a porta do computador problemático em outra VLAN.",
      "Lembre que o isolamento é desejado: quem está em VLANs diferentes não deve se alcançar sem um roteador. Corrigir a porta errada não pode quebrar essa regra.",
      "Depois de corrigir, teste nos dois sentidos e teste também que o isolamento continua valendo.",
    ] },

    { tipo: "h", texto: "Pondo em prática no simulador" },
    { tipo: "numerada", itens: [
      "No laboratório O switch: aprendendo quem está em cada porta, ligue os três PCs ao switch. Antes de qualquer ping, rode show mac address-table no switch e veja a tabela vazia.",
      "Dê ping do PC1 no PC3 e observe o ARP inundando o PC2, mas apenas o PC3 respondendo. Volte à tabela do switch.",
      "No desafio A porta na VLAN errada, abra a janela do switch, veja as VLANs de cada porta e corrija a porta do PC4.",
      "Confirme que o PC1 continua sem alcançar o PC3: o isolamento entre vendas e financeiro precisa permanecer.",
    ] },
  ],
  questoes: [
    {
      enunciado: "Qual a diferença entre um endereço IP e um endereço MAC?",
      opcoes: ["O IP identifica o dispositivo na rede de ponta a ponta, e o MAC vale apenas no salto dentro da rede local", "O MAC atravessa a internet inteira e o IP vale só na rede local", "Os dois são atribuídos pelo fabricante da placa", "O IP é usado só por switches e o MAC só por roteadores"],
      correta: 0,
      explicacao: "O IP é lógico e atravessa toda a viagem. O MAC é físico e só vale no enlace atual: a cada roteador, o quadro é refeito com novos MACs, enquanto os IPs permanecem.",
    },
    {
      enunciado: "Como um switch descobre em qual porta está cada dispositivo?",
      opcoes: ["O administrador cadastra cada MAC manualmente", "Ele lê o MAC de origem de cada quadro recebido e anota a porta de entrada na tabela MAC", "Ele pergunta ao roteador", "Ele consulta o servidor DNS"],
      correta: 1,
      explicacao: "O switch aprende sozinho observando o tráfego: o MAC de origem de cada quadro recebido é associado à porta por onde o quadro chegou.",
    },
    {
      enunciado: "O que o switch faz com um quadro cujo MAC de destino ainda não está na tabela?",
      opcoes: ["Descarta o quadro", "Envia o quadro apenas ao roteador", "Envia por todas as portas, menos a de entrada (flooding)", "Devolve o quadro ao remetente com um erro"],
      correta: 2,
      explicacao: "Sem saber onde está o destino, o switch inunda o quadro por todas as portas, exceto a de entrada. Quando o destino responder, o switch aprende onde ele está.",
    },
    {
      enunciado: "Por que um pedido ARP chega a todos os computadores ligados ao mesmo switch?",
      opcoes: ["Porque o ARP é um quadro de transmissão, com MAC de destino ff:ff:ff:ff:ff:ff", "Porque o switch está com defeito", "Porque o ARP usa IP em vez de MAC", "Porque o roteador replica o pedido"],
      correta: 0,
      explicacao: "O pedido ARP precisa alcançar o dono de um IP ainda desconhecido, então é enviado em transmissão. O switch inunda esse tipo de quadro por todas as portas da VLAN.",
    },
    {
      enunciado: "Na tabela MAC de um switch aparece o MAC do PC3 associado à porta Fa0/3. O PC1 envia um quadro ao PC3. O que o switch faz?",
      opcoes: ["Envia por todas as portas", "Envia apenas pela porta Fa0/3", "Envia pela porta do roteador", "Descarta, porque o PC1 e o PC3 estão em portas diferentes"],
      correta: 1,
      explicacao: "Destino conhecido significa envio apenas pela porta anotada. As demais portas não recebem o quadro, o que economiza banda e evita que terceiros vejam a conversa.",
    },
    {
      enunciado: "O que é uma VLAN?",
      opcoes: ["Um cabo de fibra mais rápido", "Uma rede local lógica que divide um switch físico em redes isoladas, cada uma com seu próprio domínio de broadcast", "Um programa antivírus para a rede", "Um tipo de endereço IP privado"],
      correta: 1,
      explicacao: "A VLAN agrupa portas em redes lógicas separadas. Quadros de uma VLAN não passam para outra no mesmo switch, e cada VLAN limita o alcance do broadcast.",
    },
    {
      enunciado: "O PC3 está na VLAN 20, o PC1 na VLAN 10, ambos no mesmo switch. O PC1 consegue dar ping no PC3 sem um roteador?",
      opcoes: ["Sim, o switch conecta todas as portas", "Sim, desde que os IPs estejam na mesma máscara", "Não: as VLANs são isoladas, e o tráfego entre elas exige um roteador", "Sim, mas apenas com pacotes ICMP"],
      correta: 2,
      explicacao: "VLANs diferentes são domínios isolados. Mesmo com cabos no mesmo switch, o ARP e os quadros não passam de uma para a outra. A comunicação exige roteamento entre elas.",
    },
    {
      enunciado: "Um computador tem cabo, IP e máscara corretos, mas não alcança os colegas de departamento. O que verificar no switch?",
      opcoes: ["Se a porta do computador foi atribuída à VLAN do departamento", "Se o cabo é de cobre ou de fibra", "Se o computador tem placa de vídeo", "Se o switch tem endereço MAC"],
      correta: 0,
      explicacao: "Uma porta na VLAN errada coloca o computador em outro domínio de broadcast. O show vlan brief mostra a VLAN de cada porta, e a correção é movê-la para a VLAN certa.",
    },
  ],
  desafio: {
    titulo: "Rastreie o aprendizado do switch e conserte a VLAN",
    enunciado: "No simulador do Koda, conclua os laboratórios O switch: aprendendo quem está em cada porta e A porta na VLAN errada. Em seguida, monte uma rede própria com um switch e quatro PCs divididos em duas VLANs e registre o que a tabela MAC e o show vlan brief mostram em cada etapa.",
    requisitos: [
      "Concluir o laboratório do switch com a tabela MAC preenchida depois do ping.",
      "Concluir o desafio da porta na VLAN errada mantendo o isolamento entre os departamentos.",
      "Montar, na área de laboratório, um switch com quatro PCs: dois na VLAN 10 e dois na VLAN 20, cada VLAN em sua própria rede IP.",
      "Anotar a tabela MAC antes e depois de um ping dentro da VLAN 10, e explicar por que a VLAN 20 não aprendeu nada.",
    ],
    criterios: [
      "Os dois laboratórios constam como concluídos na área Redes.",
      "Os PCs de uma mesma VLAN se alcançam, e os de VLANs diferentes não se alcançam.",
      "As anotações mostram que o ARP foi inundado apenas pelas portas da própria VLAN.",
      "Você explica por que o switch só aprendeu o MAC dos dispositivos que enviaram quadros.",
    ],
    dica: "No simulador, abra a janela do switch e ajuste a VLAN de cada porta. O terminal do switch mostra show vlan brief e show mac address-table para você conferir o resultado.",
  },
  referencias: [
    { titulo: "RFC 826: An Ethernet Address Resolution Protocol", url: "https://datatracker.ietf.org/doc/html/rfc826" },
    { titulo: "RFC 7042: IANA Considerations and IETF Protocol and Documentation Usage for IEEE 802 Parameters", url: "https://datatracker.ietf.org/doc/html/rfc7042" },
    { titulo: "Amazon VPC: como funciona", url: "https://docs.aws.amazon.com/vpc/latest/userguide/how-it-works.html" },
  ],
};
