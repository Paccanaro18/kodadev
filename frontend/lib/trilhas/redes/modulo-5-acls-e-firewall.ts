import type { Modulo } from "../tipos";

export const REDES_MODULO_5: Modulo = {
  tipo: "modulo",
  slug: "acls-e-firewall",
  titulo: "ACLs e firewall: quem pode falar com quem",
  resumo: "Como o roteador filtra tráfego com listas de controle de acesso, por que a ordem das regras importa, o que é o negar implícito e por que uma ACL sem estado precisa liberar também a volta.",
  nivel: "Intermediário",
  leitura: "40 min",
  objetivos: [
    "Explicar o que é uma ACL e em que se diferencia de um firewall com estado.",
    "Escrever regras que permitem ou negam tráfego por protocolo, origem e destino.",
    "Prever o resultado de uma ACL levando em conta a ordem das regras e o negar implícito.",
    "Explicar por que uma ACL sem estado precisa permitir o tráfego de volta e em qual interface.",
    "Diagnosticar um bloqueio indevido lendo a mensagem do roteador e a lista de regras.",
  ],
  preRequisitos: [
    "As aulas anteriores: IP e máscaras, switches e VLANs, roteadores e rotas.",
    "Saber ler uma notação de rede com prefixo, como 10.0.1.0/24.",
  ],
  pontosChave: [
    "Uma ACL é uma lista de regras permitir ou negar, avaliadas em ordem, e a primeira que casa decide o destino do pacote.",
    "Toda ACL termina com um negar implícito: com ao menos uma regra, o que não casa com nenhuma é descartado.",
    "A ACL do simulador não guarda estado, então o tráfego de ida e o de volta precisam, os dois, ser permitidos.",
    "A ACL de entrada vale para o que entra por uma interface, e a resposta entra pela outra.",
    "Regras mais específicas vêm antes das mais gerais; um permitir qualquer no topo anula tudo o que vem depois.",
  ],
  blocos: [
    { tipo: "p", texto: "Até agora a rede serviu para ligar: quem está conectado e tem rota consegue falar com quem quiser. Em uma empresa, isso é um problema. O computador de um visitante não deveria alcançar o servidor financeiro, o banco de dados não deveria receber conexões da internet, e uma impressora não precisa falar com ninguém fora do setor. Controlar quem pode falar com quem é uma das responsabilidades centrais de quem administra redes e uma das defesas mais antigas e eficazes da segurança." },
    { tipo: "p", texto: "A ferramenta mais básica para isso é a ACL (Access Control List, lista de controle de acesso), uma lista de regras que o roteador consulta para cada pacote que passa. Esta aula mostra como ela funciona, onde costuma dar errado e como raciocinar sobre ela com método." },
    { tipo: "dica", titulo: "Laboratórios desta aula", texto: "Em Redes, faça ACL: quem pode falar com quem e o desafio A ACL que bloqueou a volta. Na janela do roteador, cada interface tem a sua ACL de entrada, e o terminal tem o comando show access-lists." },

    { tipo: "h", texto: "O que é uma ACL" },
    { tipo: "p", texto: "Uma ACL é uma lista ordenada de regras. Cada regra descreve um tipo de tráfego e diz o que fazer com ele: permitir ou negar. Para descrever o tráfego, a regra usa critérios como o protocolo (ICMP, DNS, TCP, qualquer), o endereço de origem e o endereço de destino. Quando um pacote chega a uma interface que tem uma ACL, o roteador lê as regras de cima para baixo, compara o pacote com cada uma e, na primeira que casar, aplica a ação e para de ler." },
    { tipo: "tabela", legenda: "Anatomia de uma regra", cabecalho: ["Campo", "Valores", "Exemplo"], linhas: [
      ["Ação", "permitir ou negar", "negar"],
      ["Protocolo", "icmp, dns ou qualquer (e, em equipamentos reais, tcp, udp e portas)", "icmp"],
      ["Origem", "qualquer, um endereço ou uma rede com prefixo", "10.0.1.20"],
      ["Destino", "qualquer, um endereço ou uma rede com prefixo", "10.0.2.10"],
    ] },
    { tipo: "codigo", linguagem: "text", legenda: "Uma ACL de entrada na interface Gi0/0 do roteador", texto: `Roteador1> show access-lists
ACL de entrada em Gi0/0:
  1  negar icmp 10.0.1.20 → 10.0.2.10
  2  permitir qualquer qualquer → qualquer
  (fim)  negar tudo o que não casou (implícito)` },
    { tipo: "p", texto: "Aqui, o roteador examina cada pacote que entra por Gi0/0. Se for um ping do 10.0.1.20 para o 10.0.2.10, a regra 1 casa e nega. Qualquer outro pacote não casa com a regra 1, cai na regra 2, que permite tudo, e passa. O que sobra depois da última regra só existe em teoria, porque a regra 2 já pegou tudo." },

    { tipo: "h", texto: "O negar implícito: o erro número um" },
    { tipo: "p", texto: "Toda ACL tem, invisível no fim, uma regra final que nega tudo. Isso é uma escolha de segurança sensata, porque só passa o que foi permitido de forma explícita. Mas é também a causa do erro mais comum com ACLs: quem escreve só regras de negar, achando que o resto continua passando, e derruba a rede inteira." },
    { tipo: "p", texto: "No laboratório, ao adicionar a regra que nega o PC2, o PC1 também deixa de alcançar o servidor, pois ele não casa com a regra e cai no negar implícito. A solução é acrescentar, depois do negar, uma regra que permite o restante. Repare que uma ACL vazia, sem regra nenhuma, comporta-se ao contrário: permite tudo. O negar implícito só passa a existir quando há ao menos uma regra." },
    { tipo: "alerta", titulo: "Cuidado com o acesso ao próprio roteador", texto: "Em equipamentos reais, uma ACL que nega tudo, aplicada à interface por onde você administra o roteador, pode cortar a sua própria conexão e exigir acesso físico para desfazer. Em produção, teste regras em horário de baixo risco e tenha sempre um caminho de volta." },

    { tipo: "h", texto: "A ordem das regras" },
    { tipo: "p", texto: "Como a primeira regra que casa decide, a ordem muda o resultado. Regras específicas devem vir antes das gerais. Se você coloca permitir qualquer no topo, tudo casa ali, e nenhuma regra abaixo chega a ser consultada. Ao contrário, se o negar específico vem primeiro, ele pega os casos que quer bloquear antes de a regra geral liberar o resto." },
    { tipo: "tabela", legenda: "A mesma lista em duas ordens, para o ping do PC2 (10.0.1.20) ao servidor", cabecalho: ["Ordem", "Regras", "Resultado para o PC2"], linhas: [
      ["A", "1) negar icmp 10.0.1.20 → 10.0.2.10; 2) permitir qualquer", "Negado pela regra 1"],
      ["B", "1) permitir qualquer; 2) negar icmp 10.0.1.20 → 10.0.2.10", "Permitido pela regra 1; a regra 2 nunca é lida"],
    ] },
    { tipo: "codigo", linguagem: "text", legenda: "Na ordem B, o ping do PC2 passa e o roteador nem chega a ler a regra 2", texto: `Roteador1> show access-lists
ACL de entrada em Gi0/0:
  1  permitir qualquer qualquer → qualquer
  2  negar icmp 10.0.1.20 → 10.0.2.10      <- nunca é alcançada
  (fim)  negar tudo o que não casou (implícito)

PC2> ping 10.0.2.10
Resposta de 10.0.2.10: bytes=32 tempo<1ms TTL=63` },
    { tipo: "lista", itens: [
      "Escreva as regras mais específicas primeiro e as mais gerais por último.",
      "Termine com uma regra clara: um permitir geral, quando a ideia é bloquear exceções, ou nada, quando a ideia é liberar só o necessário.",
      "Releia a lista de cima para baixo, como o roteador faz, antes de aplicá-la.",
      "Documente o motivo de cada regra: daqui a seis meses ninguém lembrará por que existe.",
    ] },

    { tipo: "h", texto: "Sem estado: a ida e a volta" },
    { tipo: "p", texto: "Uma ACL simples não tem memória. Ela julga cada pacote isoladamente, sem saber se ele é a resposta a uma conversa que alguém iniciou. Isso tem uma consequência importante: liberar o tráfego de ida não libera a volta. Se o PC1 manda um ping ao servidor e a ACL de entrada da interface do PC1 permite, o pedido chega ao servidor. Mas a resposta do servidor entra no roteador pela outra interface, e se a ACL dessa interface não a permitir, ela é descartada. Do ponto de vista do PC1, o ping simplesmente falha." },
    { tipo: "codigo", linguagem: "text", legenda: "O diagnóstico do desafio A ACL que bloqueou a volta", texto: `PC1> ping 10.0.2.10
Disparando contra 10.0.2.10 com 32 bytes de dados:
Resposta de 10.0.1.1: Host de destino inacessível.
...
Diagnóstico: Host de destino inacessível (resposta de 10.0.1.1).
Roteador1: a ACL de entrada de Gi0/1 negou o pacote 10.0.2.10 → 10.0.1.10
(nenhuma regra o permite, e toda ACL termina com um negar implícito).` },
    { tipo: "p", texto: "O diagnóstico aponta para a Gi0/1, a interface por onde a resposta entra. A regra dessa interface permitia o tráfego do servidor para 10.0.9.10, um endereço errado. Corrigir o destino para 10.0.1.10 resolve. Os firewalls modernos e os grupos de segurança da nuvem resolvem esse tipo de problema de outro jeito: eles guardam o estado das conexões e liberam automaticamente a resposta a uma conversa permitida. Para ACLs sem estado, porém, você precisa raciocinar sobre os dois sentidos." },
    { tipo: "tabela", legenda: "ACL sem estado e firewall com estado", cabecalho: ["Característica", "ACL sem estado", "Firewall com estado"], linhas: [
      ["Memória", "Nenhuma: cada pacote é julgado sozinho", "Lembra das conexões abertas"],
      ["A volta", "Precisa de regra explícita", "Liberada automaticamente"],
      ["Onde aparece", "Roteadores, ACLs de rede da nuvem", "Firewalls, grupos de segurança da nuvem"],
      ["Risco típico", "Esquecer o caminho de volta", "Regras amplas demais por conveniência"],
    ] },

    { tipo: "h", texto: "Boas práticas de filtragem" },
    { tipo: "p", texto: "O princípio que orienta uma boa ACL é o do menor privilégio: permita apenas o que é necessário e negue o resto. Prefira regras específicas, com origem e destino definidos, a regras amplas com qualquer em tudo. Uma regra permitir qualquer qualquer resolve o problema do momento e desfaz toda a proteção, e é por isso que ela aparece em quase todo relatório de auditoria de segurança." },
    { tipo: "lista", itens: [
      "Aplique o filtro perto de onde o tráfego indesejado entra, para que ele não gaste a rede inteira antes de ser barrado.",
      "Separe por função: servidores, usuários e visitantes em redes diferentes, e as regras entre elas explícitas.",
      "Revise as regras com frequência e remova as que não são mais usadas: ACLs que só crescem viram um labirinto.",
      "Teste dos dois lados: confirme que o permitido passa e que o negado é negado. É o que os objetivos dos laboratórios fazem.",
    ] },

    { tipo: "codigo", linguagem: "text", legenda: "Planejando as regras antes de digitar: liste a ida e a volta de cada conversa permitida", texto: `Conversa permitida: PC1 (10.0.1.10) -> Servidor (10.0.2.10), ping

  Ida:    entra pela Gi0/0   permitir icmp 10.0.1.10 -> 10.0.2.10
  Volta:  entra pela Gi0/1   permitir icmp 10.0.2.10 -> 10.0.1.10

Todo o resto (PC2, visitantes, outros protocolos):
  cai no negar implícito de cada interface e é barrado.` },

    { tipo: "h", texto: "Pondo em prática no simulador" },
    { tipo: "numerada", itens: [
      "Em ACL: quem pode falar com quem, adicione na Gi0/0 do Roteador1 a regra que nega o ping do PC2 ao servidor. Observe que o PC1 também para, e descubra o porquê com show access-lists.",
      "Acrescente a regra final permitir qualquer e confirme que o PC1 volta a funcionar e o PC2 continua barrado.",
      "Inverta a ordem das duas regras e veja o PC2 passar de novo.",
      "No desafio A ACL que bloqueou a volta, use o diagnóstico do ping para achar a interface do problema e corrija a regra.",
    ] },
  ],
  questoes: [
    {
      enunciado: "O que é uma ACL em um roteador?",
      opcoes: ["Uma tabela que associa IPs a endereços MAC", "Uma lista ordenada de regras permitir ou negar aplicada ao tráfego que passa por uma interface", "Um serviço que entrega endereços aos clientes", "Um protocolo que descobre rotas automaticamente"],
      correta: 1,
      explicacao: "A ACL é uma lista de regras avaliadas em ordem. Cada regra descreve um tipo de tráfego e diz se ele deve ser permitido ou negado.",
    },
    {
      enunciado: "Como o roteador avalia as regras de uma ACL?",
      opcoes: ["Todas ao mesmo tempo, e vale a mais restritiva", "De baixo para cima, e vale a última que casar", "De cima para baixo, e vale a primeira regra que casar com o pacote", "Aleatoriamente, até achar uma permissão"],
      correta: 2,
      explicacao: "A avaliação é sequencial, do topo para baixo. Ao encontrar a primeira regra que casa, o roteador aplica a ação e ignora as seguintes.",
    },
    {
      enunciado: "Uma ACL tem apenas uma regra: negar icmp do 10.0.1.20 para o 10.0.2.10. O que acontece com o ping de outro PC, o 10.0.1.10, para o 10.0.2.10?",
      opcoes: ["Passa, pois a regra só nega o outro PC", "Passa, mas só uma vez", "É negado, pois toda ACL termina com um negar implícito", "O roteador pergunta ao administrador"],
      correta: 2,
      explicacao: "O pacote do 10.0.1.10 não casa com a única regra e cai no negar implícito do fim da lista. Para liberar o resto é preciso uma regra permitir depois do negar.",
    },
    {
      enunciado: "A ACL de uma interface está vazia, sem nenhuma regra. O que acontece com o tráfego que entra por ela?",
      opcoes: ["Tudo é negado", "Tudo é permitido: o negar implícito só existe quando há ao menos uma regra", "Só o tráfego ICMP passa", "A interface é desligada"],
      correta: 1,
      explicacao: "Sem regras, não há ACL em vigor, e o tráfego passa livremente. A partir da primeira regra, o que não casar com nenhuma é descartado.",
    },
    {
      enunciado: "As regras (1) permitir qualquer qualquer e (2) negar icmp do PC2 ao servidor estão nessa ordem. O ping do PC2 ao servidor é permitido ou negado?",
      opcoes: ["Negado, porque a regra 2 é mais específica", "Permitido: a regra 1 casa primeiro e a regra 2 nunca é lida", "Negado, porque toda ACL prioriza o negar", "Depende do protocolo"],
      correta: 1,
      explicacao: "A primeira regra que casa decide. Como permitir qualquer casa com tudo, a regra de negar abaixo nunca é consultada. Regras específicas devem vir antes das gerais.",
    },
    {
      enunciado: "Uma ACL sem estado permite o ping do PC1 ao servidor na interface do PC1, mas o ping falha. Qual é uma causa provável?",
      opcoes: ["O ping não funciona em redes com ACL", "A resposta do servidor entra por outra interface, cuja ACL não permite o tráfego de volta", "O PC1 precisa de um endereço MAC novo", "A ACL só funciona para o protocolo DNS"],
      correta: 1,
      explicacao: "Sem estado, a ACL não reconhece a resposta como parte da conversa. A volta entra pela interface do servidor e precisa de uma regra própria que a permita.",
    },
    {
      enunciado: "Qual a diferença essencial entre uma ACL sem estado e um firewall com estado?",
      opcoes: ["A ACL é mais segura em todas as situações", "O firewall com estado lembra das conexões abertas e libera a resposta automaticamente", "A ACL só funciona em redes Wi-Fi", "O firewall não consegue filtrar por endereço"],
      correta: 1,
      explicacao: "O firewall com estado guarda a tabela de conexões e reconhece o tráfego de volta como resposta. A ACL sem estado julga cada pacote isolado, sem memória.",
    },
    {
      enunciado: "Qual o princípio de segurança que orienta bons filtros de rede?",
      opcoes: ["Permitir tudo e negar só o que causar problema", "Menor privilégio: permitir apenas o necessário e negar o resto", "Permitir o tráfego interno e nunca o externo", "Usar sempre uma única regra permitir qualquer"],
      correta: 1,
      explicacao: "O menor privilégio reduz a superfície de ataque: cada permissão é explícita e justificada. Uma regra permitir qualquer qualquer desfaz a proteção.",
    },
  ],
  desafio: {
    titulo: "Isole o servidor de banco de dados",
    enunciado: "Conclua no simulador do Koda os laboratórios ACL: quem pode falar com quem e A ACL que bloqueou a volta. Depois, monte uma rede com três redes (usuários, visitantes e servidores) e um roteador, e escreva as ACLs para que os usuários alcancem o servidor, os visitantes não alcancem nada do interior, e as respostas voltem corretamente.",
    requisitos: [
      "Concluir os dois laboratórios de ACL com todos os objetivos cumpridos.",
      "Montar três redes ligadas por um roteador, com um PC em cada rede de usuários e de visitantes e um servidor na rede de servidores.",
      "Escrever as ACLs de entrada das três interfaces: usuários passam, visitantes são barrados e as respostas do servidor voltam.",
      "Mostrar, com show access-lists e ping, que cada regra faz o que foi planejado, incluindo o que o negar implícito barra.",
    ],
    criterios: [
      "Os dois laboratórios aparecem como concluídos na área Redes.",
      "O PC de usuários alcança o servidor e o PC de visitantes não alcança.",
      "Você explica, para cada interface, por que a regra de volta é necessária.",
      "Você consegue apontar o que aconteceria se uma regra permitir qualquer fosse colocada no topo de uma das listas.",
    ],
    dica: "Pense em cada interface como uma porta de entrada do roteador: a ACL dela só enxerga o tráfego que entra por ali. Para cada conversa permitida, liste a ida e a volta.",
  },
  referencias: [
    { titulo: "RFC 2979: Behavior of and Requirements for Internet Firewalls", url: "https://datatracker.ietf.org/doc/html/rfc2979" },
    { titulo: "Amazon VPC: ACLs de rede", url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html" },
    { titulo: "Amazon VPC: grupos de segurança", url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html" },
  ],
};
