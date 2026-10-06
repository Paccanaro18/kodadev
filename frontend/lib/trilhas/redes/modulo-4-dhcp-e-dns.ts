import type { Modulo } from "../tipos";

export const REDES_MODULO_4: Modulo = {
  tipo: "modulo",
  slug: "dhcp-e-dns",
  titulo: "DHCP e DNS: endereços e nomes automáticos",
  resumo: "Como os dispositivos recebem endereço, máscara, gateway e DNS sozinhos pelo DHCP, como o DNS transforma nomes em endereços IP e como diagnosticar quando um dos dois falha.",
  nivel: "Iniciante",
  leitura: "40 min",
  objetivos: [
    "Explicar por que redes reais não configuram endereços à mão e o que o DHCP entrega a cada cliente.",
    "Descrever as quatro mensagens da conversa DHCP (discover, offer, request, ack) e o que é um pool e uma concessão.",
    "Reconhecer o endereço automático 169.254.x.x e saber o que ele diz sobre a rede.",
    "Explicar o que o DNS resolve, o que é um registro A e por que o computador precisa conhecer um servidor DNS.",
    "Separar, com ping e nslookup, uma falha de rede de uma falha de nome.",
  ],
  preRequisitos: [
    "As aulas anteriores: IP e máscaras, switches e ARP, roteadores e gateways.",
  ],
  pontosChave: [
    "O DHCP entrega, de uma vez, endereço, máscara, gateway e servidor DNS, por tempo limitado (a concessão).",
    "A conversa DHCP começa em broadcast, por isso só alcança a própria rede, a menos que um roteador faça o repasse (relay).",
    "Um endereço 169.254.x.x significa que o computador não encontrou servidor DHCP: o problema está entre ele e o servidor, ou no pool.",
    "O DNS traduz nomes em endereços IP, e o computador precisa saber o endereço de pelo menos um servidor DNS.",
    "Se o ping por IP funciona e o ping por nome não, a rede está bem e o problema é de nome (DNS).",
  ],
  blocos: [
    { tipo: "p", texto: "Nas aulas anteriores você digitou cada endereço à mão. Funciona em um laboratório com três computadores, mas nenhuma rede de verdade vive assim. Um escritório com duzentas máquinas, um Wi-Fi de cafeteria, o celular que entra em uma rede nova: em todos, o dispositivo recebe sozinho um endereço, uma máscara e o endereço de saída. E quando você acessa um site, digita um nome, não um número. Esta aula cobre os dois serviços que fazem isso acontecer: o DHCP, que entrega endereços, e o DNS, que traduz nomes." },
    { tipo: "dica", titulo: "Laboratórios desta aula", texto: "Em Redes, faça DHCP: endereços que chegam sozinhos, e depois os desafios O pool que acabou e O nome que não resolve. Nos servidores do simulador, a configuração dos serviços DHCP e DNS fica na janela do dispositivo." },

    { tipo: "h", texto: "O problema que o DHCP resolve" },
    { tipo: "p", texto: "Configurar endereços manualmente tem três problemas sérios. Dá trabalho, porque cada máquina precisa de IP, máscara, gateway e DNS. Dá erro, porque um dígito trocado causa um endereço duplicado ou uma máscara errada, os defeitos que você diagnosticou na primeira aula. E não acompanha a mobilidade, porque um notebook que muda de sala, ou um celular que muda de rede, precisaria ser reconfigurado a cada vez." },
    { tipo: "p", texto: "O DHCP (Dynamic Host Configuration Protocol) automatiza tudo isso. Um servidor DHCP guarda um pool, um intervalo de endereços disponíveis, junto com as informações comuns da rede. Quando um computador liga o cabo ou entra no Wi-Fi, ele pede uma configuração, e o servidor responde com um endereço livre do pool e com tudo o que o cliente precisa para falar com o resto do mundo." },
    { tipo: "tabela", legenda: "O que o servidor DHCP entrega", cabecalho: ["Informação", "Exemplo", "Para que serve"], linhas: [
      ["Endereço IP", "192.168.50.100", "Identificar o dispositivo na rede."],
      ["Máscara de rede", "255.255.255.0", "Dizer quais endereços estão na mesma rede."],
      ["Gateway padrão", "192.168.50.1", "O roteador de saída para as outras redes."],
      ["Servidor DNS", "192.168.50.2", "Quem traduz nomes em endereços."],
      ["Tempo de concessão", "8 horas", "Por quanto tempo o endereço é do cliente antes de ser renovado."],
    ] },

    { tipo: "h", texto: "A conversa DHCP: discover, offer, request, ack" },
    { tipo: "p", texto: "Há um detalhe curioso: o cliente quer um endereço, mas ainda não tem endereço, e não sabe quem é o servidor. Como conversar assim? Com transmissão (broadcast). O cliente envia uma mensagem para todos da rede, e o servidor DHCP, que a recebe, responde. A conversa tem quatro passos, conhecidos pelas iniciais em inglês." },
    { tipo: "numerada", itens: [
      "Discover: o cliente grita para a rede inteira, em broadcast: existe algum servidor DHCP aí? Preciso de um endereço.",
      "Offer: o servidor escolhe um endereço livre do pool e oferece, junto com máscara, gateway e DNS.",
      "Request: o cliente aceita a oferta, também em broadcast, para que outros servidores DHCP, se houver, saibam que a oferta deles foi recusada.",
      "Ack: o servidor confirma e registra a concessão. A partir daí o endereço é do cliente.",
    ] },
    { tipo: "codigo", linguagem: "text", legenda: "Os quatro quadros no simulador do Koda", texto: `PC1> ipconfig /renew
Renovando a concessão de endereço...
Endereço 192.168.50.100 concedido por 192.168.50.2.

Pacotes na rede
  DHCP  PC1 eth0 -> Switch1 Fa0/2   DHCP discover: tem algum servidor DHCP aí?
  DHCP  Switch1 Fa0/1 -> Servidor1  DHCP discover: ...
  DHCP  Servidor1 -> Switch1        DHCP offer: ofereço 192.168.50.100
  DHCP  PC1 -> Switch1              DHCP request: aceito 192.168.50.100
  DHCP  Servidor1 -> Switch1        DHCP ack: confirmado, 192.168.50.100 é seu` },
    { tipo: "p", texto: "Observe no simulador como o discover é inundado pelo switch, como qualquer broadcast, e como a oferta e a confirmação voltam diretamente ao MAC do cliente. É o ARP de novo em ação: o switch aprende o MAC do PC1 no discover e consegue responder só para ele." },

    { tipo: "h", texto: "Pool, concessão e quem fica de fora" },
    { tipo: "p", texto: "O pool é o intervalo de endereços que o servidor pode distribuir, como de 192.168.50.100 a 192.168.50.150. Ele deve ficar dentro da rede do servidor e não pode incluir endereços já usados por equipamentos fixos, como o próprio servidor, o roteador e as impressoras. Cada endereço entregue é uma concessão (lease): o cliente o usa por um tempo definido e precisa renová-lo antes de vencer. Quando o cliente some, o endereço volta ao pool." },
    { tipo: "p", texto: "A consequência prática é que o tamanho do pool precisa acompanhar o número de dispositivos. Um pool de dois endereços atende dois computadores, e o terceiro que chegar não recebe nada. Em redes de escritório e de eventos, esgotar o pool é uma das causas mais comuns de chamados de rede que o computador não conecta." },
    { tipo: "alerta", titulo: "O endereço 169.254.x.x", texto: "Quando um computador pede um endereço e ninguém responde, ele se atribui um endereço automático da faixa 169.254.0.0/16 (APIPA). Ele serve apenas para falar com vizinhos na mesma rede local que também tenham um desses. Ver 169.254 no ipconfig é um recado claro: o DHCP falhou. Verifique o cabo, a VLAN, se o serviço está ligado e se o pool não esgotou." },
    { tipo: "codigo", linguagem: "text", legenda: "ipconfig de um cliente que não obteve endereço", texto: `PC4> ipconfig
Configuração IP
   DHCP habilitado . . . . : Sim
   Endereço IPv4 . . . . . : 169.254.5.1
   Máscara de sub-rede . . : 255.255.0.0
   Gateway padrão  . . . . : (não configurado)
   Servidor DNS  . . . . . : (não configurado)

   Endereço 169.254.x.x: nenhum servidor DHCP respondeu, e o computador se
   atribuiu um endereço automático.` },
    { tipo: "p", texto: "Outro limite importante: como o discover é um broadcast, ele não atravessa roteadores. Por padrão, um servidor DHCP só atende clientes da própria rede. Para uma única central atender várias redes, o roteador de cada rede é configurado como agente de repasse (relay, o ip helper-address dos equipamentos Cisco), que recebe o broadcast e o reenvia como unicast ao servidor. O simulador não implementa o relay, e por isso um cliente do outro lado de um roteador fica sem endereço." },

    { tipo: "h", texto: "O DNS: nomes em vez de números" },
    { tipo: "p", texto: "Ninguém decora 142.250.79.46 para abrir um site. As pessoas usam nomes, e o computador precisa do endereço. O DNS (Domain Name System) é o sistema que faz a tradução: você pergunta o IP de um nome, e ele responde. Funciona como uma lista telefônica distribuída, em que cada servidor sabe responder sobre parte dos nomes e consulta outros servidores para o resto." },
    { tipo: "p", texto: "Nos laboratórios, o DNS é simples: um servidor da rede guarda uma lista de registros, e cada registro liga um nome a um endereço. O tipo mais comum é o registro A, que associa um nome a um endereço IPv4. O cliente é configurado com o endereço do servidor DNS, manualmente ou, mais comum, recebido pelo DHCP, e envia a pergunta por UDP à porta 53." },
    { tipo: "tabela", legenda: "Tipos de registro DNS mais comuns", cabecalho: ["Registro", "Liga", "Exemplo"], linhas: [
      ["A", "Nome a um endereço IPv4", "loja.koda.local -> 10.0.0.30"],
      ["AAAA", "Nome a um endereço IPv6", "loja.koda.local -> 2001:db8::30"],
      ["CNAME", "Um nome a outro nome (apelido)", "www.koda.local -> loja.koda.local"],
      ["MX", "Domínio ao servidor de e-mail", "koda.local -> correio.koda.local"],
    ] },
    { tipo: "codigo", linguagem: "text", legenda: "nslookup no simulador", texto: `PC1> nslookup loja.koda.local
Servidor:  10.0.0.2
Endereço:  10.0.0.2

Nome:      loja.koda.local
Endereço:  10.0.0.30

Pacotes na rede
  DNS  PC1 -> Switch1 -> Servidor1   DNS: qual o IP de loja.koda.local?
  DNS  Servidor1 -> Switch1 -> PC1   DNS: loja.koda.local é 10.0.0.30` },
    { tipo: "p", texto: "A pergunta DNS é um pacote IP como qualquer outro: ela precisa de rota, de gateway, de ARP. Se o servidor DNS está em outra rede, o pacote atravessa roteadores normalmente. Por isso, antes mesmo de resolver nomes, o computador precisa ter conectividade com o servidor DNS. Um servidor DNS inalcançável, um endereço de DNS digitado errado ou um serviço desligado produzem o mesmo sintoma para o usuário: o site não abre." },

    { tipo: "h", texto: "Separando um problema de rede de um problema de nome" },
    { tipo: "p", texto: "Quando alguém diz que o site não abre, a pergunta mais útil é se o endereço IP funciona. A resposta divide o diagnóstico em dois. Se o ping pelo IP funciona e o ping pelo nome falha, a rede está saudável e o defeito está na resolução de nomes. Se o ping pelo IP também falha, o defeito é de rede e deve ser investigado com o roteiro das aulas anteriores." },
    { tipo: "lista", itens: [
      "O computador conhece um servidor DNS? O ipconfig mostra o campo Servidor DNS, e vazio quer dizer que nunca haverá resolução.",
      "O servidor DNS responde? Um ping direto ao endereço do servidor DNS confirma que ele é alcançável.",
      "O nome existe no servidor? O nslookup diz se o servidor respondeu que o nome não existe.",
      "A resposta está certa? Um registro apontando para um endereço antigo faz o nome resolver, mas o acesso falhar. Compare com o endereço real do destino.",
      "Existe cache? Computadores e navegadores guardam respostas por um tempo, e uma correção no servidor pode demorar a aparecer em quem já guardou a resposta antiga.",
    ] },
    { tipo: "codigo", linguagem: "text", legenda: "Os dois defeitos do desafio O nome que não resolve", texto: `PC1> nslookup loja.koda.local
*** Não foi possível resolver loja.koda.local.
Diagnóstico: PC1: nenhum servidor DNS configurado.

(depois de configurar o DNS no PC1)
PC1> ping loja.koda.local
Disparando contra loja.koda.local [10.0.0.99] com 32 bytes de dados:
Esgotado o tempo limite do pedido.

O nome resolveu, mas para 10.0.0.99, um endereço que ninguém tem. O registro
no servidor DNS precisa apontar para 10.0.0.30.` },

    { tipo: "h", texto: "Pondo em prática no simulador" },
    { tipo: "numerada", itens: [
      "Em DHCP: endereços que chegam sozinhos, ligue o serviço DHCP no servidor e ative o DHCP nos dois PCs. Rode ipconfig /renew e acompanhe os quatro quadros.",
      "No servidor, abra o terminal e rode dhcp leases para ver quem recebeu qual endereço.",
      "Em O pool que acabou, descubra por que dois PCs ficam com 169.254.x.x e amplie o pool.",
      "Em O nome que não resolve, use nslookup e ping para achar o defeito do PC e o do servidor DNS, um de cada vez.",
    ] },
  ],
  questoes: [
    {
      enunciado: "O que um servidor DHCP entrega a um cliente, além do endereço IP?",
      opcoes: ["A senha do Wi-Fi e o nome do usuário", "Máscara de rede, gateway padrão, servidor DNS e o tempo de concessão", "Apenas o endereço MAC do roteador", "A lista de sites bloqueados"],
      correta: 1,
      explicacao: "O DHCP entrega a configuração completa para o cliente falar com a rede: IP, máscara, gateway, DNS e por quanto tempo o endereço vale (a concessão).",
    },
    {
      enunciado: "Por que o primeiro passo do DHCP (discover) é enviado em broadcast?",
      opcoes: ["Porque o cliente ainda não tem endereço IP e não sabe quem é o servidor DHCP", "Porque o broadcast é mais seguro que o unicast", "Porque o switch exige broadcast para o primeiro quadro", "Porque o servidor DHCP está sempre em outra rede"],
      correta: 0,
      explicacao: "O cliente não tem endereço nem conhece o servidor, então anuncia o pedido a todos da rede. Quem for servidor DHCP responde.",
    },
    {
      enunciado: "Qual é a ordem correta das mensagens da conversa DHCP?",
      opcoes: ["Request, offer, discover, ack", "Offer, discover, ack, request", "Discover, offer, request, ack", "Discover, request, offer, ack"],
      correta: 2,
      explicacao: "O cliente descobre (discover), o servidor oferece (offer), o cliente pede aquela oferta (request) e o servidor confirma (ack).",
    },
    {
      enunciado: "Um PC mostra o endereço 169.254.7.12 no ipconfig. O que isso indica?",
      opcoes: ["Que o servidor DHCP concedeu um endereço especial", "Que o PC está na internet pública", "Que o PC pediu um endereço por DHCP e nenhum servidor respondeu", "Que o gateway está correto"],
      correta: 2,
      explicacao: "O endereço 169.254.x.x é atribuído automaticamente pelo próprio computador quando o DHCP falha. As causas típicas são cabo ou VLAN errados, serviço desligado ou pool esgotado.",
    },
    {
      enunciado: "Quatro PCs pedem endereço a um servidor DHCP cujo pool tem apenas dois endereços. O que acontece com o terceiro e o quarto?",
      opcoes: ["Dividem os mesmos endereços dos dois primeiros", "Ficam sem concessão e usam o endereço automático 169.254.x.x", "O servidor cria endereços novos sozinho", "Recebem o endereço do gateway"],
      correta: 1,
      explicacao: "Cada endereço do pool só pode ser dado a um cliente por vez. Com o pool esgotado, os que chegam depois ficam sem concessão e se atribuem um endereço 169.254.x.x.",
    },
    {
      enunciado: "Um servidor DHCP está em uma rede, e um PC em outra rede, atrás de um roteador, não recebe endereço. Qual é a explicação provável?",
      opcoes: ["O discover é um broadcast e não atravessa o roteador, a menos que ele faça o repasse (relay)", "O roteador não aceita pacotes DHCP em hipótese alguma", "O servidor só atende endereços IPv6", "O PC precisa de um gateway antes de pedir o endereço"],
      correta: 0,
      explicacao: "Roteadores não repassam broadcasts. Para atender outra rede, o roteador precisa ser configurado como agente de relay, que encaminha o pedido ao servidor como unicast.",
    },
    {
      enunciado: "Qual a função do DNS?",
      opcoes: ["Atribuir endereços IP aos dispositivos da rede", "Traduzir nomes, como loja.koda.local, em endereços IP", "Descobrir o endereço MAC de um vizinho", "Bloquear tráfego indesejado entre redes"],
      correta: 1,
      explicacao: "O DNS responde qual é o IP de um nome. Atribuir endereços é o papel do DHCP, descobrir MACs é do ARP e filtrar tráfego é de firewalls e ACLs.",
    },
    {
      enunciado: "O ping para 10.0.0.30 funciona, mas o ping para loja.koda.local falha. Qual o diagnóstico mais provável?",
      opcoes: ["O cabo do PC está defeituoso", "Há um problema de resolução de nomes (DNS), e a rede em si está funcionando", "A máscara está errada", "O servidor 10.0.0.30 está desligado"],
      correta: 1,
      explicacao: "Se o ping por IP funciona, o caminho de rede está bom, e o servidor está de pé. O que falha é a tradução do nome: DNS não configurado, serviço desligado ou registro errado.",
    },
  ],
  desafio: {
    titulo: "Monte uma rede que se configura sozinha",
    enunciado: "Conclua no simulador os laboratórios DHCP: endereços que chegam sozinhos, O pool que acabou e O nome que não resolve. Em seguida, monte uma rede própria com um servidor que faz DHCP e DNS ao mesmo tempo, três PCs que recebem tudo automaticamente, e prove que cada PC resolve e alcança os outros pelo nome.",
    requisitos: [
      "Concluir os três laboratórios de DHCP e DNS, com os objetivos marcados.",
      "Montar, em um laboratório livre, um servidor com serviço DHCP e serviço DNS e três PCs configurados para DHCP.",
      "Criar registros DNS para os três PCs e provar, com ping pelo nome, que todos se alcançam.",
      "Reduzir o pool para dois endereços, observar o terceiro PC com 169.254.x.x e documentar o diagnóstico mostrado.",
    ],
    criterios: [
      "Os três laboratórios constam como concluídos na área Redes.",
      "O comando dhcp leases do servidor lista os três PCs com endereços diferentes do pool.",
      "O nslookup de cada nome retorna o endereço do PC correspondente.",
      "Você explica por que o PC sem concessão consegue falar com outro PC sem concessão, mas não com o servidor.",
    ],
    dica: "O servidor entrega o próprio endereço como DNS no DHCP, e assim os PCs já recebem o servidor DNS junto com o endereço. Nos registros, use nomes como pc1.koda.local.",
  },
  referencias: [
    { titulo: "RFC 2131: Dynamic Host Configuration Protocol", url: "https://datatracker.ietf.org/doc/html/rfc2131" },
    { titulo: "RFC 1034: Domain Names - Concepts and Facilities", url: "https://datatracker.ietf.org/doc/html/rfc1034" },
    { titulo: "RFC 3927: Dynamic Configuration of IPv4 Link-Local Addresses", url: "https://datatracker.ietf.org/doc/html/rfc3927" },
  ],
};
