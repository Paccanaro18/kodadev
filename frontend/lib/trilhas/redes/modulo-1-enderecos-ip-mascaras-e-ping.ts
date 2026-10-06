import type { Modulo } from "../tipos";

export const REDES_MODULO_1: Modulo = {
  tipo: "modulo",
  slug: "enderecos-ip-mascaras-e-ping",
  titulo: "Endereços IP, máscaras e o primeiro ping",
  resumo: "O que é um endereço IP, como a máscara separa rede e dispositivo, como saber se dois computadores estão na mesma rede e o que acontece de verdade quando você dá um ping.",
  nivel: "Iniciante",
  leitura: "35 min",
  objetivos: [
    "Explicar o que um endereço IPv4 identifica e por que ele tem quatro números de 0 a 255.",
    "Ler uma máscara de rede nas formas 255.255.255.0 e /24 e calcular o endereço da rede, o de transmissão e quantos dispositivos cabem.",
    "Decidir, só olhando IP e máscara, se dois dispositivos estão na mesma rede.",
    "Descrever o caminho de um ping entre dois computadores, do ARP à resposta ICMP.",
    "Diagnosticar os erros de configuração mais comuns: máscara errada, rede diferente e endereço duplicado.",
  ],
  preRequisitos: [
    "Nenhum conhecimento de redes. Saber o que é um computador e um cabo é suficiente.",
    "Para a prática, a área Redes do Koda, que roda inteira no navegador.",
  ],
  pontosChave: [
    "O endereço IP identifica um dispositivo em uma rede, e a máscara diz quais bits são da rede e quais são do dispositivo.",
    "Dois dispositivos só conversam diretamente quando têm a mesma rede. Fora dela, é preciso um roteador.",
    "A máscara /24 equivale a 255.255.255.0 e deixa 254 endereços utilizáveis; cada bit a menos no prefixo dobra o tamanho da rede.",
    "O ping usa o protocolo ICMP e, antes dele, o ARP descobre o endereço físico do vizinho.",
    "Quando o ping falha, a causa mais comum é configuração, não equipamento: confira IP, máscara e gateway antes de trocar um cabo.",
  ],
  blocos: [
    { tipo: "p", texto: "Quando você abre um site, manda uma mensagem ou roda um teste na nuvem, uma enorme quantidade de pequenos pacotes de dados atravessa cabos, switches e roteadores até chegar ao destino certo. Tudo isso só funciona porque cada dispositivo tem um endereço e porque existem regras simples e universais para decidir para onde enviar cada pacote. Esta aula começa pelo alicerce de tudo: o endereço IP, a máscara de rede e o teste mais famoso da área, o ping." },
    { tipo: "p", texto: "A teoria aqui anda lado a lado com a prática. Na área Redes do Koda há um simulador que monta redes no navegador, com computadores, switches e roteadores de verdade, e cada conceito desta aula tem um laboratório correspondente. Leia uma seção, vá ao simulador, repita o que foi explicado e só então avance. Redes se aprendem muito mais rápido quando você vê o pacote andando do que quando apenas lê sobre ele." },
    { tipo: "dica", titulo: "Como estudar esta aula", texto: "Abra o laboratório Seu primeiro cabo em uma aba ao lado e leia esta lição por partes. A cada seção, reproduza no simulador o que ela descreve. O laboratório confere sozinho se você acertou." },

    { tipo: "h", texto: "O que é um endereço IP" },
    { tipo: "p", texto: "Um endereço IP é o número que identifica um dispositivo em uma rede, do mesmo jeito que um endereço de rua identifica uma casa. A versão ainda dominante é o IPv4, que usa 32 bits. Para que as pessoas consigam ler e digitar, esses 32 bits são divididos em quatro grupos de 8 bits, chamados octetos, e cada octeto é escrito como um número decimal de 0 a 255, separado por pontos. É por isso que você vê endereços como 192.168.0.10: quatro números, cada um entre 0 e 255." },
    { tipo: "p", texto: "Por baixo, o computador enxerga apenas zeros e uns. O número 192 em binário é 11000000, o 168 é 10101000, o 0 é 00000000 e o 10 é 00001010. Entender isso é útil porque a máscara de rede trabalha bit a bit, e quase todo cálculo de rede que você fará, à mão ou no simulador, parte dessa representação." },
    { tipo: "codigo", linguagem: "text", legenda: "O mesmo endereço em decimal e em binário", texto: `Decimal:   192      .   168      .   0        .   10
Binário:   11000000 .   10101000 .   00000000 .   00001010
Bits:      8 bits       8 bits       8 bits       8 bits  = 32 bits

Cada octeto vai de 00000000 (0) a 11111111 (255).
Total de endereços IPv4 possíveis: 2^32 = 4.294.967.296` },
    { tipo: "p", texto: "São pouco mais de quatro bilhões de endereços para um planeta com muito mais dispositivos do que isso. Por esse motivo, parte dos endereços foi reservada para uso privado, dentro de casas, empresas e nuvens, e é reaproveitada por milhões de redes diferentes. Esses endereços privados nunca aparecem na internet pública e são o que você usará em todos os laboratórios." },
    { tipo: "tabela", legenda: "Faixas de endereços privados (RFC 1918)", cabecalho: ["Faixa", "Notação", "Uso típico"], linhas: [
      ["10.0.0.0 a 10.255.255.255", "10.0.0.0/8", "Grandes empresas e redes em nuvem, com milhões de endereços."],
      ["172.16.0.0 a 172.31.255.255", "172.16.0.0/12", "Redes médias e ambientes de contêineres."],
      ["192.168.0.0 a 192.168.255.255", "192.168.0.0/16", "Redes domésticas e pequenos escritórios, como o seu roteador de casa."],
    ] },

    { tipo: "h", texto: "A máscara de rede: onde termina a rede e começa o dispositivo" },
    { tipo: "p", texto: "Um endereço IP sozinho não diz tudo. Ele é composto de duas partes: a parte da rede, que é igual para todos os dispositivos que estão juntos, e a parte do dispositivo, que diferencia um do outro dentro dessa rede. Quem diz onde está a divisão é a máscara de rede. Os bits da máscara que valem 1 marcam a parte da rede, e os bits que valem 0 marcam a parte do dispositivo. Uma máscara válida sempre tem todos os uns juntos, seguidos de todos os zeros." },
    { tipo: "p", texto: "A máscara 255.255.255.0 tem 24 bits ligados, seguidos de 8 desligados. Por isso também é escrita como /24, a notação de prefixo, em que o número depois da barra é a quantidade de bits da rede. Com a máscara /24, os três primeiros octetos identificam a rede e o último identifica o dispositivo. Todos os endereços de 192.168.0.1 a 192.168.0.254 pertencem à mesma rede, a 192.168.0.0/24." },
    { tipo: "tabela", legenda: "Prefixos mais comuns", cabecalho: ["Prefixo", "Máscara", "Bits do dispositivo", "Endereços utilizáveis"], linhas: [
      ["/8", "255.0.0.0", "24", "16.777.214"],
      ["/16", "255.255.0.0", "16", "65.534"],
      ["/24", "255.255.255.0", "8", "254"],
      ["/25", "255.255.255.128", "7", "126"],
      ["/26", "255.255.255.192", "6", "62"],
      ["/30", "255.255.255.252", "2", "2"],
    ] },
    { tipo: "p", texto: "Repare no padrão: cada bit que sai do prefixo e passa para a parte do dispositivo dobra a quantidade de endereços da rede. A conta é 2 elevado ao número de bits do dispositivo, menos 2. Esses dois endereços a menos têm funções especiais. O primeiro, com todos os bits do dispositivo em zero, é o endereço da rede, que nomeia o conjunto inteiro. O último, com todos os bits do dispositivo em um, é o endereço de transmissão (broadcast), usado para falar com todos de uma vez. Nenhum dos dois pode ser dado a um computador." },
    { tipo: "codigo", linguagem: "text", legenda: "Calculando a rede de 192.168.1.77 com máscara /26", texto: `IP:       192.168.1.77   = 11000000.10101000.00000001.01001101
Máscara:  255.255.255.192 = 11111111.11111111.11111111.11000000   (/26)
          ------------------------------------------------------- E bit a bit
Rede:     192.168.1.64   = 11000000.10101000.00000001.01000000

Bits do dispositivo: 6  ->  2^6 = 64 endereços (62 utilizáveis)
Endereço da rede:       192.168.1.64
Endereço de broadcast:  192.168.1.127
Faixa utilizável:       192.168.1.65 a 192.168.1.126` },
    { tipo: "p", texto: "O que o computador faz é exatamente essa operação E bit a bit entre o endereço e a máscara. O resultado é o endereço da rede. Se dois endereços, passados pela mesma máscara, dão o mesmo resultado, eles estão na mesma rede. Se dão resultados diferentes, estão em redes diferentes e precisam de um roteador entre eles. Essa única regra explica uma enorme fração dos problemas de rede que você encontrará." },

    { tipo: "h", texto: "Mesma rede ou redes diferentes?" },
    { tipo: "p", texto: "Antes de enviar qualquer pacote, o computador faz uma pergunta simples: o destino está na minha rede? Para responder, ele aplica a própria máscara ao próprio endereço e ao endereço de destino e compara. Se forem iguais, o destino está no mesmo segmento, e o computador fala diretamente com ele. Se forem diferentes, o computador não tenta chegar sozinho: entrega o pacote ao gateway padrão, o roteador da rede, e deixa que ele encontre o caminho." },
    { tipo: "tabela", legenda: "Quatro casos para treinar", cabecalho: ["Origem", "Destino", "Máscara da origem", "Resultado"], linhas: [
      ["192.168.0.10", "192.168.0.20", "/24", "Mesma rede (192.168.0.0). Conversa direta."],
      ["192.168.0.10", "192.168.1.20", "/24", "Redes diferentes (192.168.0.0 e 192.168.1.0). Precisa de gateway."],
      ["192.168.1.10", "192.168.1.200", "/25", "Redes diferentes: o /25 corta em 128, e .10 fica na faixa .0 a .127, enquanto .200 está na faixa .128 a .255."],
      ["10.1.5.9", "10.1.200.4", "/16", "Mesma rede (10.1.0.0). Em /24 seriam redes diferentes."],
    ] },
    { tipo: "alerta", titulo: "O erro clássico da máscara errada", texto: "Dois computadores no mesmo switch, com cabos e IPs aparentemente certos, podem não se comunicar apenas porque um deles tem a máscara errada. Para o computador com a máscara menor, o outro parece estar em outra rede, e ele tenta enviar o pacote ao gateway, que pode nem existir. É exatamente o defeito do desafio A máscara que não fecha." },

    { tipo: "h", texto: "O ping: o que acontece de verdade" },
    { tipo: "p", texto: "O ping é a ferramenta mais usada para testar se dois dispositivos se alcançam. Por baixo, ele usa o protocolo ICMP, o protocolo de mensagens de controle da internet. O seu computador envia um pedido de eco (echo request) para o destino, e o destino, se estiver acessível e configurado para responder, devolve uma resposta de eco (echo reply). O ping mede também o tempo de ida e volta e mostra o TTL, que veremos adiante." },
    { tipo: "p", texto: "Mas há um passo escondido antes do primeiro pacote ICMP. O IP é um endereço lógico, e quem entrega um quadro dentro de uma rede local é o endereço físico, o MAC, gravado na placa de rede. O computador conhece o IP do destino, mas precisa descobrir o MAC dele. Para isso existe o ARP: o computador pergunta a todos da rede quem tem aquele IP, e o dono responde com o seu MAC. Só então o pedido de eco é enviado. Na primeira vez há ARP, e nas seguintes o resultado já está guardado em uma tabela." },
    { tipo: "codigo", linguagem: "text", legenda: "O ping 192.168.0.10 para 192.168.0.20, passo a passo", texto: `1. PC1: o 192.168.0.20 está na minha rede? Sim (mesma máscara, mesma rede).
2. PC1: não conheço o MAC do 192.168.0.20 -> envia ARP em broadcast:
        "Quem tem 192.168.0.20? Responda a 192.168.0.10"
3. PC2: "Sou eu. Meu MAC é 02:00:00:01:02:00"  (resposta ARP direta)
4. PC1: guarda 192.168.0.20 -> 02:00:00:01:02:00 na tabela ARP
5. PC1 -> PC2: ICMP echo request (TTL 128)
6. PC2 -> PC1: ICMP echo reply   (TTL 128)` },
    { tipo: "p", texto: "No simulador do Koda você vê exatamente essa sequência. Abra o terminal do PC1, digite o ping e acompanhe, na lista de pacotes e na animação sobre os cabos, primeiro os quadros ARP em laranja e depois os ICMP em verde. Rode o ping uma segunda vez: o ARP não aparece mais, porque o PC1 já aprendeu o MAC. O comando arp -a mostra essa tabela." },
    { tipo: "codigo", linguagem: "text", legenda: "Saída do terminal do simulador", texto: `PC1> ping 192.168.0.20
Disparando contra 192.168.0.20 com 32 bytes de dados:
Resposta de 192.168.0.20: bytes=32 tempo<1ms TTL=128
Resposta de 192.168.0.20: bytes=32 tempo<1ms TTL=128
Resposta de 192.168.0.20: bytes=32 tempo<1ms TTL=128
Resposta de 192.168.0.20: bytes=32 tempo<1ms TTL=128

Estatísticas do ping para 192.168.0.20:
    Pacotes: enviados = 4, recebidos = 4, perdidos = 0 (0% de perda)` },

    { tipo: "h", texto: "Quando o ping falha: um roteiro de diagnóstico" },
    { tipo: "p", texto: "Um ping que não responde não diz por que falhou, e a habilidade de quem trabalha com redes é investigar com método. O erro mais comum não é equipamento quebrado, e sim configuração. Siga sempre a mesma ordem, do mais próximo ao mais distante, e confirme cada degrau antes de subir ao seguinte." },
    { tipo: "lista", itens: [
      "Cabo e porta: o computador está ligado a um switch ou a outro dispositivo? Um cabo desconectado nunca será resolvido por configuração.",
      "IP e máscara do próprio computador: use ipconfig e confirme que há um endereço e que a máscara é a esperada para aquela rede.",
      "Mesma rede: aplique a máscara aos dois endereços e compare os resultados. Se forem diferentes, falta um gateway ou há um IP errado.",
      "Endereço duplicado: dois dispositivos com o mesmo IP fazem a rede se comportar de modo imprevisível, e o ping funciona às vezes, e outras não.",
      "Gateway: para destinos fora da rede, confirme que o gateway está na mesma rede do computador e é o endereço do roteador.",
    ] },
    { tipo: "codigo", linguagem: "text", legenda: "Diagnóstico do simulador quando a máscara está errada", texto: `PC1> ipconfig
Configuração IP
   Endereço IPv4 . . . . . : 192.168.1.10
   Máscara de sub-rede . . : 255.255.255.252
   Gateway padrão  . . . . : (não configurado)

PC1> ping 192.168.1.20
Falha geral.

Diagnóstico: PC1: 192.168.1.20 está fora da rede 192.168.1.8/30 e nenhum
gateway padrão foi configurado.` },
    { tipo: "p", texto: "Note como o diagnóstico já aponta a causa: com a máscara /30, o PC1 acredita estar em uma rede minúscula, 192.168.1.8 a 192.168.1.11, e considera o destino fora dela. Em equipamentos reais você não recebe essa explicação pronta, mas pode chegar a ela com a mesma conta que fizemos na seção anterior. Quem aprende a fazer a conta à mão diagnostica qualquer rede, em qualquer equipamento." },

    { tipo: "h", texto: "Pondo em prática no simulador" },
    { tipo: "numerada", itens: [
      "Abra o laboratório Seu primeiro cabo, em Redes. Arraste, a partir do círculo com o ícone de cabo do PC1, até o PC2 para ligá-los.",
      "Clique no PC1 para abrir a janela do dispositivo, e configure o IP 192.168.0.10 com máscara 255.255.255.0. Faça o mesmo no PC2 com 192.168.0.20.",
      "Na aba Terminal do PC1, execute ping 192.168.0.20. Observe o ARP e depois o ICMP percorrendo o cabo.",
      "Execute arp -a e veja o MAC aprendido. Depois mude a máscara do PC1 para 255.255.255.252 e repita o ping para ver a falha e o diagnóstico.",
      "Conserte a configuração e faça o desafio A máscara que não fecha, que reúne dois erros escondidos.",
    ] },
    { tipo: "dica", titulo: "Treine a conta de cabeça", texto: "Pegue endereços aleatórios do seu dia a dia, como o IP do seu computador e o do seu celular, e decida se estão na mesma rede. Em poucas repetições a conta do /24 vira automática, e o /25 e o /26 passam a ser só uma questão de cortar o último octeto ao meio ou em quatro." },
  ],
  questoes: [
    {
      enunciado: "Quantos bits tem um endereço IPv4, e por que os endereços são escritos com quatro números de 0 a 255?",
      opcoes: ["32 bits, divididos em quatro octetos de 8 bits, e cada octeto vai de 0 a 255", "16 bits, divididos em quatro grupos de 4 bits", "64 bits, divididos em dois grupos de 32", "8 bits, repetidos quatro vezes"],
      correta: 0,
      explicacao: "O IPv4 tem 32 bits, agrupados em quatro octetos de 8 bits. Cada octeto representa valores de 0 (00000000) a 255 (11111111), por isso a notação com pontos.",
    },
    {
      enunciado: "Qual é a função da máscara de rede?",
      opcoes: ["Criptografar os pacotes que saem do computador", "Indicar quais bits do endereço pertencem à rede e quais pertencem ao dispositivo", "Esconder o endereço IP do computador na internet", "Definir a velocidade máxima da conexão"],
      correta: 1,
      explicacao: "A máscara marca com bits 1 a parte da rede e com bits 0 a parte do dispositivo. Com ela, o computador sabe se o destino está na sua rede ou fora dela.",
    },
    {
      enunciado: "A máscara 255.255.255.0 também pode ser escrita de que forma?",
      opcoes: ["/8", "/16", "/24", "/32"],
      correta: 2,
      explicacao: "São 24 bits ligados (três octetos de 8 bits cada), então o prefixo é /24. O /8 seria 255.0.0.0 e o /16 seria 255.255.0.0.",
    },
    {
      enunciado: "Quantos endereços podem ser dados a computadores em uma rede 192.168.1.0/24?",
      opcoes: ["256", "255", "254", "128"],
      correta: 2,
      explicacao: "Há 2^8 = 256 combinações, mas duas são reservadas: o endereço da rede (192.168.1.0) e o de transmissão (192.168.1.255). Restam 254 utilizáveis.",
    },
    {
      enunciado: "O PC A tem IP 192.168.1.10 e máscara 255.255.255.128. O PC B tem 192.168.1.200 e a mesma máscara. Eles estão na mesma rede?",
      opcoes: ["Sim, pois os três primeiros octetos são iguais", "Sim, pois a máscara é a mesma", "Não: o A está na rede 192.168.1.0 e o B na 192.168.1.128", "Não, pois o último octeto de B é maior que 127 e isso é inválido"],
      correta: 2,
      explicacao: "Com /25, a rede é cortada em 128. O endereço .10 cai na faixa .0 a .127, e o .200 cai na faixa .128 a .255. Redes diferentes, então é preciso um roteador entre eles.",
    },
    {
      enunciado: "Um computador precisa enviar um pacote a um destino que está em outra rede. Para onde ele entrega o pacote?",
      opcoes: ["Diretamente ao destino, usando o ARP", "Ao endereço de transmissão da própria rede", "Ao gateway padrão, o roteador da sua rede", "Ao switch, que decide a rede de destino"],
      correta: 2,
      explicacao: "Quando o destino não está na mesma rede, o computador entrega o pacote ao gateway padrão e deixa que o roteador encontre o caminho. O switch não conhece redes IP.",
    },
    {
      enunciado: "Qual é o papel do ARP antes do primeiro ping em uma rede local?",
      opcoes: ["Descobrir o endereço físico (MAC) que corresponde ao IP do destino", "Descobrir o endereço IP do roteador", "Medir o tempo de ida e volta do pacote", "Traduzir nomes de sites em endereços IP"],
      correta: 0,
      explicacao: "O ARP pergunta a todos da rede quem tem determinado IP, e o dono responde com o seu MAC. Sem o MAC, o quadro não pode ser entregue na rede local. Traduzir nomes é função do DNS.",
    },
    {
      enunciado: "O ping responde corretamente, mas apenas depois de um ARP na primeira execução, e sem ARP nas seguintes. Por quê?",
      opcoes: ["O ARP só funciona na primeira conexão do dia", "O MAC aprendido fica guardado na tabela ARP, então não é preciso perguntar de novo", "O ping substitui o ARP depois do primeiro pacote", "O switch passa a responder pelo destino"],
      correta: 1,
      explicacao: "O resultado do ARP é guardado em uma tabela (visível com arp -a) por um tempo. Enquanto o MAC estiver lá, o computador envia direto, sem nova pergunta.",
    },
  ],
  desafio: {
    titulo: "Dois PCs, dois erros e uma conta feita à mão",
    enunciado: "Resolva no simulador do Koda os laboratórios Seu primeiro cabo e A máscara que não fecha. Depois, sem usar o simulador, calcule à mão a rede, o endereço de transmissão e a faixa utilizável de 172.16.5.133/27, e registre o raciocínio em um arquivo de texto para consultar depois.",
    requisitos: [
      "Concluir o laboratório Seu primeiro cabo, com os quatro objetivos marcados.",
      "Concluir o desafio A máscara que não fecha, corrigindo os dois erros sem consultar a solução.",
      "Calcular a rede, o broadcast e a faixa utilizável de 172.16.5.133/27 escrevendo cada passo em binário.",
      "Escrever, com as suas palavras, o que acontece entre o ARP e a resposta ICMP quando o PC1 dá ping no PC2.",
    ],
    criterios: [
      "Os dois laboratórios aparecem como concluídos na área Redes.",
      "A rede calculada é 172.16.5.128, o broadcast é 172.16.5.159 e a faixa utilizável vai de 172.16.5.129 a 172.16.5.158.",
      "O texto cita o broadcast do ARP, a resposta unicast e a tabela ARP que evita repetir a pergunta.",
      "Você consegue explicar por que a máscara /30 do PC1 fez o destino parecer de outra rede.",
    ],
    dica: "Em /27 há 5 bits de dispositivo, então as redes crescem de 32 em 32: .0, .32, .64, .96, .128, .160. O endereço .133 cai na rede que começa em .128.",
  },
  referencias: [
    { titulo: "RFC 791: Internet Protocol", url: "https://datatracker.ietf.org/doc/html/rfc791" },
    { titulo: "RFC 1918: Address Allocation for Private Internets", url: "https://datatracker.ietf.org/doc/html/rfc1918" },
    { titulo: "RFC 4632: Classless Inter-domain Routing (CIDR)", url: "https://datatracker.ietf.org/doc/html/rfc4632" },
    { titulo: "RFC 792: Internet Control Message Protocol", url: "https://datatracker.ietf.org/doc/html/rfc792" },
  ],
};
