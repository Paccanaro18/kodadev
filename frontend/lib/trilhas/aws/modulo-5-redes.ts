import type { Modulo } from "../tipos";

export const AWS_MODULO_5: Modulo = {
  tipo: "modulo",
  slug: "redes-vpc-route-53-e-cloudfront",
  titulo: "Redes: VPC, Route 53 e CloudFront",
  resumo: "Como montar a rede privada na AWS (VPC, sub-redes, gateways, grupos de segurança), conectá-la a outras redes e entregar aplicações com DNS e CDN.",
  nivel: "Iniciante",
  leitura: "55 min",
  objetivos: [
    "Descrever uma VPC com sub-redes públicas e privadas, tabelas de rotas e gateways.",
    "Diferenciar grupos de segurança e ACLs de rede, e saber quando usar cada um.",
    "Escolher a forma de conectar redes: peering, Transit Gateway, VPN e Direct Connect.",
    "Explicar o que o Route 53 e o CloudFront fazem e como se complementam.",
    "Planejar os blocos de endereços (CIDR) de uma VPC sem sobreposições.",
  ],
  preRequisitos: [
    "Ter feito os módulos de conceitos de nuvem, IAM e computação.",
    "Saber o que é um endereço IP e, de preferência, a notação CIDR (por exemplo, 10.0.0.0/16).",
  ],
  pontosChave: [
    "Uma VPC é a sua rede privada na AWS, dentro de uma Região, com sub-redes que ficam cada uma em uma só AZ.",
    "Uma sub-rede é pública quando a sua tabela de rotas aponta para um Internet Gateway; o resto é privado.",
    "Grupos de segurança protegem instâncias e guardam o estado das conexões; ACLs protegem sub-redes e não guardam.",
    "O peering de VPCs não é transitivo; o Transit Gateway conecta muitas redes em estrela.",
    "O Route 53 responde às perguntas de DNS; o CloudFront aproxima o conteúdo do usuário.",
  ],
  blocos: [
    { tipo: "p", texto: "Quase tudo o que você cria na AWS (instâncias, bancos de dados, balanceadores) vive dentro de uma rede, e saber desenhá-la é o que separa um sistema seguro de um exposto por engano. No exame, redes aparecem em perguntas sobre isolamento, acesso à internet, conectividade com o datacenter e latência. O assunto assusta quem nunca mexeu com redes, mas o essencial cabe em poucos conceitos, e este módulo os apresenta na ordem em que você os usaria para montar um ambiente." },

    { tipo: "h", texto: "A VPC: a sua rede privada na nuvem" },
    { tipo: "p", texto: "Uma Amazon Virtual Private Cloud (VPC) é uma rede virtual isolada logicamente das outras, dentro de uma Região. Você escolhe o bloco de endereços IP dela, em notação CIDR (por exemplo, 10.0.0.0/16, que oferece 65.536 endereços), e controla quem entra e sai. Toda conta tem uma VPC padrão em cada Região, pronta para uso rápido, mas ambientes sérios criam as suas próprias, com um desenho planejado." },
    { tipo: "p", texto: "A VPC é dividida em sub-redes (subnets), pedaços do bloco de endereços. Cada sub-rede existe dentro de uma única Zona de Disponibilidade, e é por isso que uma aplicação resistente a falhas usa sub-redes em pelo menos duas AZs. Em cada sub-rede, a AWS reserva 5 endereços (os quatro primeiros e o último), então uma sub-rede /24, que tem 256 endereços, deixa 251 utilizáveis. O código abaixo planeja uma VPC, valida que as sub-redes estão dentro dela e não se sobrepõem, e calcula os endereços utilizáveis." },
    { tipo: "codigo", linguagem: "python", legenda: "planejar_vpc.py", texto: `import ipaddress

RESERVADOS_PELA_AWS = 5

vpc = ipaddress.ip_network("10.0.0.0/16")
print(f"VPC {vpc}: {vpc.num_addresses} endereços")

plano = [
    ("publica-a", "10.0.0.0/24"),
    ("publica-b", "10.0.1.0/24"),
    ("privada-a", "10.0.10.0/24"),
    ("privada-b", "10.0.11.0/24"),
    ("dados-a", "10.0.20.0/28"),
]

redes = []
for nome, cidr in plano:
    rede = ipaddress.ip_network(cidr)
    if not rede.subnet_of(vpc):
        raise ValueError(f"{nome} está fora da VPC")
    for outro_nome, outra in redes:
        if rede.overlaps(outra):
            raise ValueError(f"{nome} sobrepõe {outro_nome}")
    redes.append((nome, rede))
    print(f"{nome:10} {rede!s:16} utilizáveis: {rede.num_addresses - RESERVADOS_PELA_AWS}")

candidata = ipaddress.ip_network("10.0.0.128/25")
print("10.0.0.128/25 sobrepõe publica-a?", candidata.overlaps(redes[0][1]))

print("10.0.10.77 está na privada-a?", ipaddress.ip_address("10.0.10.77") in redes[2][1])` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `VPC 10.0.0.0/16: 65536 endereços
publica-a  10.0.0.0/24      utilizáveis: 251
publica-b  10.0.1.0/24      utilizáveis: 251
privada-a  10.0.10.0/24     utilizáveis: 251
privada-b  10.0.11.0/24     utilizáveis: 251
dados-a    10.0.20.0/28     utilizáveis: 11
10.0.0.128/25 sobrepõe publica-a? True
10.0.10.77 está na privada-a? True` },
    { tipo: "p", texto: "A sub-rede dados-a, de tamanho /28, tem 16 endereços e só 11 utilizáveis depois das reservas da AWS: subestimar o tamanho é um erro comum, porque serviços como balanceadores e bancos consomem endereços. E a verificação de sobreposição existe por um motivo prático: dois blocos que se sobrepõem não podem ser conectados entre si (como veremos no peering), e mudar o bloco de uma VPC em uso é trabalhoso. Planeje os endereços da empresa inteira antes de criar a primeira VPC." },

    { tipo: "h", texto: "Sub-redes públicas e privadas" },
    { tipo: "p", texto: "A diferença entre uma sub-rede pública e uma privada é só de roteamento. Cada sub-rede tem uma tabela de rotas, que diz para onde mandar cada pacote. Se ela tem uma rota para a internet (0.0.0.0/0) que aponta para um Internet Gateway (IGW), é pública: as instâncias que tiverem também um IP público podem falar com a internet e receber conexões dela. Sem essa rota, é privada: ninguém de fora consegue iniciar uma conexão com o que está lá dentro, e é o lugar certo para servidores de aplicação, bancos de dados e qualquer coisa que não precise ser alcançada diretamente." },
    { tipo: "tabela", legenda: "Os componentes de uma VPC", cabecalho: ["Componente", "Função"], linhas: [
      ["Sub-rede", "Faixa de endereços em uma única AZ. Pública ou privada, conforme as rotas."],
      ["Tabela de rotas", "Regras de roteamento: para onde vai o tráfego de cada destino."],
      ["Internet Gateway (IGW)", "A porta entre a VPC e a internet, nos dois sentidos."],
      ["NAT Gateway", "Permite que recursos de sub-redes privadas iniciem conexões para a internet (atualizações, APIs), sem permitir que a internet inicie conexões com eles. Fica em uma sub-rede pública."],
      ["Endpoint de VPC", "Acesso privado a serviços da AWS (como o S3) sem passar pela internet."],
      ["Elastic IP", "Um endereço IP público fixo, que você reserva e associa a um recurso."],
    ] },
    { tipo: "codigo", linguagem: "text", legenda: "Uma arquitetura clássica em duas camadas", texto: `Internet
   │
Internet Gateway
   │
┌──┴──────── VPC 10.0.0.0/16 ─────────────────────────────┐
│  Sub-redes PÚBLICAS (AZ a e AZ b)                       │
│    Load Balancer, NAT Gateway                           │
│        │                              │                 │
│  Sub-redes PRIVADAS (AZ a e AZ b)                       │
│    Servidores da aplicação (EC2, contêineres)           │
│        │                                                │
│  Sub-redes de DADOS (AZ a e AZ b)                       │
│    Banco de dados (sem rota para a internet)            │
└─────────────────────────────────────────────────────────┘` },
    { tipo: "p", texto: "Esse desenho aplica um princípio de segurança chamado defesa em profundidade: só o balanceador de carga fica exposto à internet, a aplicação fica atrás dele, e o banco de dados atrás da aplicação, com rotas e regras que permitem apenas o caminho necessário. Se um atacante comprometer um servidor web, ele ainda não alcança o banco diretamente. Observe também o NAT Gateway, que é a resposta quando o servidor privado precisa baixar uma atualização sem ficar exposto." },

    { tipo: "h", texto: "Grupos de segurança e ACLs de rede" },
    { tipo: "p", texto: "A AWS oferece duas camadas de firewall, e a prova gosta de compará-las. O grupo de segurança (security group) é o firewall de uma instância ou interface de rede. Ele só tem regras de permissão (não existe regra de negação), tudo que não é permitido é bloqueado na entrada, e ele é stateful, isto é, guarda o estado das conexões: se uma requisição de entrada é permitida, a resposta sai automaticamente, sem regra extra. A ACL de rede (NACL) é o firewall de uma sub-rede inteira. Ela tem regras de permissão e de negação, avaliadas em ordem numérica, e é stateless: a ida e a volta precisam de regras próprias." },
    { tipo: "tabela", legenda: "Grupo de segurança contra ACL de rede", cabecalho: ["Característica", "Grupo de segurança", "ACL de rede"], linhas: [
      ["Onde se aplica", "Instância (interface de rede).", "Sub-rede."],
      ["Estado", "Stateful: a resposta é liberada automaticamente.", "Stateless: entrada e saída têm regras separadas."],
      ["Tipos de regra", "Somente permitir.", "Permitir e negar."],
      ["Avaliação", "Todas as regras juntas.", "Em ordem numérica, a primeira que combinar vale."],
      ["Padrão", "Bloqueia a entrada, permite a saída.", "A ACL padrão permite tudo; as novas bloqueiam tudo."],
      ["Uso típico", "O controle principal, no dia a dia.", "Uma camada extra, por exemplo para bloquear um IP malicioso."],
    ] },
    { tipo: "p", texto: "Uma boa prática é encadear grupos de segurança por referência: em vez de liberar o banco para um bloco de IPs, a regra diz \"permitir a porta 5432 vindo do grupo de segurança da aplicação\", e só as instâncias desse grupo conseguem alcançá-lo, mesmo que os endereços mudem. As regras a seguir, no formato da AWS CLI, liberam HTTPS para o mundo e SSH apenas para o IP do escritório (o endereço é de um bloco reservado para documentação)." },
    { tipo: "codigo", linguagem: "json", legenda: "regras-do-grupo.json", texto: `[
  {
    "IpProtocol": "tcp",
    "FromPort": 443,
    "ToPort": 443,
    "IpRanges": [{ "CidrIp": "0.0.0.0/0", "Description": "HTTPS público" }]
  },
  {
    "IpProtocol": "tcp",
    "FromPort": 22,
    "ToPort": 22,
    "IpRanges": [{ "CidrIp": "203.0.113.10/32", "Description": "SSH do escritório" }]
  }
]` },
    { tipo: "alerta", titulo: "0.0.0.0/0 em portas de administração", texto: "Liberar SSH (22) ou RDP (3389) para 0.0.0.0/0 coloca o seu servidor na mira de varreduras automáticas de toda a internet. Restrinja ao IP de quem administra ou, melhor, use o AWS Systems Manager Session Manager, que dá acesso ao servidor sem abrir porta nenhuma." },

    { tipo: "h", texto: "Conectando redes" },
    { tipo: "p", texto: "Raramente uma empresa tem uma só rede. Há várias VPCs (por equipe ou ambiente), o datacenter próprio e as redes dos parceiros. A AWS tem uma ferramenta para cada caso." },
    { tipo: "tabela", legenda: "Opções de conectividade", cabecalho: ["Opção", "O que faz", "Quando usar"], linhas: [
      ["VPC peering", "Conexão privada direta entre duas VPCs (mesma conta, contas ou Regiões diferentes). Não é transitiva: se A conecta a B e B a C, A não alcança C. Os blocos CIDR não podem se sobrepor.", "Poucas VPCs que precisam conversar."],
      ["AWS Transit Gateway", "Um roteador central (hub) ao qual se ligam muitas VPCs e redes locais, em estrela.", "Muitas redes: simplifica o que seria uma malha de peerings."],
      ["Site-to-Site VPN", "Túnel criptografado (IPsec) pela internet entre o datacenter e a VPC.", "Conexão rápida de configurar, com custo menor."],
      ["AWS Direct Connect", "Link físico dedicado e privado entre o datacenter e a AWS, sem passar pela internet.", "Desempenho previsível, largura de banda alta, requisitos de conformidade."],
      ["Endpoints de VPC (PrivateLink)", "Acesso privado a serviços da AWS ou de terceiros, sem internet.", "Manter o tráfego para o S3, DynamoDB e outros dentro da rede da AWS."],
    ] },
    { tipo: "dica", titulo: "VPN ou Direct Connect?", texto: "Se a pergunta fala em \"rápido e barato\" ou \"criptografado pela internet\", é VPN. Se fala em \"conexão dedicada\", \"desempenho consistente\", \"grande volume de dados\" ou \"sem passar pela internet pública\", é Direct Connect. As duas podem ser combinadas: a VPN como reserva do Direct Connect." },

    { tipo: "h", texto: "Amazon Route 53: o DNS" },
    { tipo: "p", texto: "O DNS traduz nomes (www.exemplo.com.br) em endereços IP. O Amazon Route 53 é o serviço de DNS da AWS: altamente disponível, global, capaz de registrar domínios, hospedar as zonas DNS e, mais interessante, escolher a resposta com base em regras, as políticas de roteamento. O nome vem da porta 53, usada pelo DNS." },
    { tipo: "tabela", legenda: "Políticas de roteamento do Route 53", cabecalho: ["Política", "Como decide", "Exemplo"], linhas: [
      ["Simples", "Devolve o valor configurado.", "Um site com um único servidor."],
      ["Ponderada", "Divide as respostas por pesos.", "Enviar 10% do tráfego a uma versão nova."],
      ["Por latência", "Responde com a Região de menor latência para o usuário.", "Usuários do Brasil vão para São Paulo, e os da Europa para a Irlanda."],
      ["Failover", "Usa um recurso principal e passa ao reserva se a verificação de saúde falhar.", "Site de contingência."],
      ["Por geolocalização", "Responde conforme o país ou continente do usuário.", "Conteúdo e idioma por país, restrições legais."],
    ] },

    { tipo: "h", texto: "Amazon CloudFront: entrega perto do usuário" },
    { tipo: "p", texto: "O Amazon CloudFront é uma rede de entrega de conteúdo (CDN). Ele guarda cópias do conteúdo em cache nos pontos de presença espalhados pelo mundo, e entrega ao usuário a cópia do ponto mais próximo, em vez de buscar na origem (um bucket S3, um balanceador, um servidor próprio) a cada pedido. Os ganhos: menos latência, menos carga na origem, custo menor de saída de dados e proteção, porque o CloudFront absorve picos de tráfego e se integra ao AWS WAF e ao Shield contra ataques." },
    { tipo: "lista", itens: [
      "Origem: de onde o CloudFront busca o conteúdo quando não tem em cache (S3, ALB, um servidor HTTP).",
      "Cache e TTL: por quanto tempo uma cópia vale antes de ser buscada de novo. Conteúdo estático (imagens, scripts) tem TTL longo; conteúdo dinâmico, curto ou nenhum.",
      "HTTPS: o CloudFront entrega o conteúdo com HTTPS e certificados do AWS Certificate Manager, sem custo adicional pelos certificados.",
      "Acesso restrito ao S3: com o Origin Access Control, o bucket fica privado e só o CloudFront consegue lê-lo, o que fecha a porta para acessos diretos.",
      "AWS Global Accelerator: serviço parecido, mas para tráfego que não é cache (TCP/UDP): usa a rede da AWS e endereços IP fixos para reduzir latência e acelerar o failover.",
    ] },
    { tipo: "tabela", legenda: "Route 53 e CloudFront: o que cada um faz", cabecalho: ["Pergunta que ele responde", "Serviço"], linhas: [
      ["\"Qual endereço corresponde a este nome?\"", "Route 53"],
      ["\"Qual servidor responde para este usuário?\"", "Route 53 (política de roteamento)"],
      ["\"Como entregar este arquivo rápido a quem está longe?\"", "CloudFront"],
      ["\"Como reduzir a carga e o custo da origem?\"", "CloudFront (cache)"],
    ] },

    { tipo: "h", texto: "Como o exame pergunta isso" },
    { tipo: "lista", itens: [
      "\"Servidores de aplicação sem acesso direto da internet, mas que precisam baixar atualizações\": sub-rede privada com NAT Gateway.",
      "\"Firewall em nível de instância, que guarda o estado\": grupo de segurança. \"Em nível de sub-rede, com regras de negação\": ACL de rede.",
      "\"Conexão privada e dedicada entre o datacenter e a AWS\": Direct Connect. \"Criptografada pela internet\": Site-to-Site VPN.",
      "\"Conectar centenas de VPCs e redes locais com um único ponto\": Transit Gateway.",
      "\"Acessar o S3 de dentro da VPC sem passar pela internet\": endpoint de VPC.",
      "\"Direcionar os usuários para a Região com menor latência\": Route 53 com política de latência.",
      "\"Reduzir a latência de imagens e vídeos para usuários do mundo todo\": CloudFront.",
    ] },
  ],
  questoes: [
    {
      enunciado: "O que torna uma sub-rede pública em uma VPC?",
      opcoes: ["Ter um nome com a palavra pública", "Estar em uma Região diferente", "Ter um grupo de segurança aberto", "Uma rota na sua tabela de rotas apontando para um Internet Gateway"],
      correta: 3,
      explicacao: "Uma sub-rede é pública porque a sua tabela de rotas tem uma rota para a internet via Internet Gateway. Sem essa rota, ela é privada.",
    },
    {
      enunciado: "Servidores em uma sub-rede privada precisam baixar atualizações da internet, sem que a internet consiga iniciar conexões com eles. Qual componente resolve?",
      opcoes: ["Um segundo Internet Gateway na sub-rede privada", "Um NAT Gateway em uma sub-rede pública, com rota a partir da privada", "Um Elastic IP em cada servidor", "Um VPC peering"],
      correta: 1,
      explicacao: "O NAT Gateway permite conexões de saída iniciadas de dentro da sub-rede privada e bloqueia as iniciadas de fora. Ele fica em uma sub-rede pública.",
    },
    {
      enunciado: "Qual afirmação sobre grupos de segurança é verdadeira?",
      opcoes: ["Têm somente regras de permissão e são stateful", "Têm regras de negação e são stateless", "Se aplicam a sub-redes inteiras", "Avaliam as regras em ordem numérica"],
      correta: 0,
      explicacao: "Grupos de segurança só permitem (o que não é permitido é bloqueado) e guardam o estado das conexões, liberando as respostas automaticamente. As ACLs é que são stateless e têm negação.",
    },
    {
      enunciado: "Uma empresa precisa bloquear explicitamente o IP de um atacante para toda uma sub-rede. Qual recurso permite uma regra de negação?",
      opcoes: ["Grupo de segurança", "ACL de rede", "Route 53", "CloudFront"],
      correta: 1,
      explicacao: "As ACLs de rede aceitam regras de negação e se aplicam à sub-rede inteira. Os grupos de segurança só têm regras de permissão.",
    },
    {
      enunciado: "A VPC A está conectada por peering à VPC B, e a B à C. A VPC A consegue alcançar a C por esse caminho?",
      opcoes: ["Sim, o peering é transitivo", "Sim, se os grupos de segurança permitirem", "Não, o peering não é transitivo: seria preciso um peering A-C ou um Transit Gateway", "Somente se estiverem na mesma Região"],
      correta: 2,
      explicacao: "O VPC peering não é transitivo. Para conectar muitas redes sem criar uma malha de peerings, usa-se o AWS Transit Gateway.",
    },
    {
      enunciado: "Uma empresa precisa de uma conexão dedicada, privada e com desempenho previsível entre o datacenter e a AWS, sem passar pela internet pública. O que usar?",
      opcoes: ["Site-to-Site VPN", "AWS Direct Connect", "Internet Gateway", "Amazon CloudFront"],
      correta: 1,
      explicacao: "O Direct Connect é um link dedicado e privado. A VPN também conecta, mas é criptografada sobre a internet pública, com desempenho menos previsível.",
    },
    {
      enunciado: "Qual serviço direciona os usuários para a Região com menor latência, usando uma política de roteamento?",
      opcoes: ["AWS Shield", "Amazon Route 53", "Amazon EBS", "AWS Config"],
      correta: 1,
      explicacao: "O Route 53 responde às consultas de DNS segundo políticas de roteamento: latência, geolocalização, ponderada, failover e outras.",
    },
    {
      enunciado: "Qual serviço guarda cópias do conteúdo em pontos de presença para entregá-lo com baixa latência aos usuários?",
      opcoes: ["Amazon CloudFront", "NAT Gateway", "Amazon EFS", "AWS Organizations"],
      correta: 0,
      explicacao: "O CloudFront é a CDN da AWS: guarda em cache o conteúdo nos pontos de presença e o entrega do local mais próximo do usuário.",
    },
  ],
  desafio: {
    titulo: "Desenhando a rede de uma loja virtual",
    enunciado: "Uma loja virtual vai rodar na AWS, na Região de São Paulo, com um site público, uma API, um banco de dados e uma conexão com o sistema de estoque que fica no datacenter da empresa. Desenhe a rede e escreva o plano de endereços, usando o script do módulo como ponto de partida. Não é preciso criar recursos na AWS.",
    requisitos: [
      "Escolha o bloco CIDR da VPC e defina ao menos 6 sub-redes (públicas, privadas e de dados) distribuídas em 2 AZs, validando com o script que não há sobreposição e calculando os endereços utilizáveis.",
      "Faça um diagrama em texto mostrando quais componentes ficam em cada camada (balanceador, NAT Gateway, aplicação, banco) e as rotas de cada tipo de sub-rede.",
      "Escreva as regras dos grupos de segurança (em JSON) do balanceador, da aplicação e do banco, usando referência a grupos de segurança entre as camadas.",
      "Escolha como conectar o datacenter (VPN ou Direct Connect) e justifique, e diga o que muda se a empresa passar a ter 20 VPCs.",
      "Descreva como o CloudFront e o Route 53 serão usados para o site, incluindo a política de roteamento e o que ficará em cache.",
    ],
    criterios: [
      "Nenhuma sub-rede de dados tem rota para o Internet Gateway.",
      "Os blocos CIDR não se sobrepõem e deixam espaço para crescimento (e para o bloco do datacenter).",
      "Nenhuma porta de administração está aberta para 0.0.0.0/0.",
      "As regras de segurança permitem só o caminho necessário entre as camadas.",
      "A justificativa da conexão com o datacenter cita custo, desempenho e segurança.",
    ],
    dica: "Comece desenhando o caminho de uma requisição de um cliente, da internet até o banco de dados, e de volta. Cada salto desse caminho precisa de uma rota e de uma regra de segurança; o que não está no caminho não precisa de acesso.",
  },
  referencias: [
    { titulo: "AWS: o que é uma Amazon VPC", url: "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html" },
    { titulo: "AWS: grupos de segurança e ACLs de rede, comparação", url: "https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html" },
    { titulo: "AWS: o que é o Amazon Route 53", url: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html" },
    { titulo: "AWS: o que é o Amazon CloudFront", url: "https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html" },
  ],
};
