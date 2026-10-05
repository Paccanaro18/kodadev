import type { Modulo } from "../tipos";

export const AWS_MODULO_1: Modulo = {
  tipo: "modulo",
  slug: "nuvem-regioes-e-responsabilidade",
  titulo: "Nuvem, infraestrutura global e responsabilidade compartilhada",
  resumo: "O que é computação em nuvem, por que as empresas migram, como a AWS organiza Regiões e Zonas de Disponibilidade e quem protege o quê.",
  nivel: "Iniciante",
  leitura: "40 min",
  objetivos: [
    "Explicar o que é computação em nuvem e as seis vantagens descritas pela AWS.",
    "Diferenciar IaaS, PaaS e SaaS e os modelos de implantação pública, privada e híbrida.",
    "Descrever Região, Zona de Disponibilidade e ponto de presença, e escolher uma Região com critério.",
    "Distinguir elasticidade de escalabilidade e alta disponibilidade de desempenho.",
    "Dizer, para um caso concreto, o que é responsabilidade da AWS e o que é do cliente.",
  ],
  preRequisitos: [
    "Nenhum conhecimento prévio de AWS. Saber o que é um servidor e uma aplicação web ajuda.",
  ],
  pontosChave: [
    "Nuvem é consumir recursos de TI sob demanda, pela internet, pagando pelo uso, em vez de comprar e manter hardware.",
    "Uma Região é uma área geográfica com várias Zonas de Disponibilidade isoladas entre si; vários AZs dão alta disponibilidade.",
    "A escolha da Região considera conformidade, latência, preço e os serviços disponíveis, nessa ordem de prioridade.",
    "A AWS cuida da segurança DA nuvem; o cliente cuida da segurança NA nuvem: dados, identidades, configuração.",
    "Quanto mais gerenciado o serviço, maior a parte da operação que fica com a AWS.",
  ],
  blocos: [
    { tipo: "p", texto: "A certificação AWS Certified Cloud Practitioner (código CLF-C02) é a porta de entrada do ecossistema de certificações da Amazon Web Services. Ela não exige experiência técnica profunda, mas cobra uma visão ampla e correta: o que é a nuvem, quais são os serviços principais, como a segurança funciona e como a cobrança é feita. Esta trilha segue os quatro domínios do exame, e o primeiro módulo cobre a base de tudo, os conceitos de nuvem, a infraestrutura global e o modelo de responsabilidade compartilhada." },
    { tipo: "p", texto: "O roteiro desta trilha foi montado a partir do repositório aberto de estudo para o CLF-C02 em português, de Thiago Cardoso (licença MIT), e o texto, os exemplos e as questões foram reescritos e ampliados para a Koda. Para confirmar formato, regras e conteúdo vigente do exame, use sempre a página oficial da AWS, indicada nas referências." },
    { tipo: "tabela", legenda: "Os quatro domínios do CLF-C02 e o peso de cada um na prova", cabecalho: ["Domínio", "Tema", "Peso"], linhas: [
      ["1", "Conceitos de nuvem", "24%"],
      ["2", "Segurança e conformidade", "30%"],
      ["3", "Tecnologia e serviços de nuvem", "34%"],
      ["4", "Cobrança, preços e suporte", "12%"],
    ] },

    { tipo: "h", texto: "O que é computação em nuvem" },
    { tipo: "p", texto: "Computação em nuvem é a entrega de recursos de TI (processamento, armazenamento, bancos de dados, redes, ferramentas de análise e inteligência artificial) pela internet, sob demanda, com pagamento pelo uso. Em vez de comprar servidores, esperar semanas pela entrega, instalá-los em uma sala refrigerada e mantê-los por anos, a empresa pede o que precisa em minutos, usa pelo tempo que quiser e devolve." },
    { tipo: "p", texto: "A mudança mais importante é financeira e de ritmo. No modelo tradicional, a empresa faz um grande investimento inicial em equipamentos (CAPEX, despesa de capital), dimensiona para o pico previsto e arca com a ociosidade nos outros dias. Na nuvem, o custo vira uma despesa operacional (OPEX) que acompanha o consumo. Para quem está começando, isso reduz a barreira de entrada: testar uma ideia custa centavos, e, se a ideia não der certo, a conta para de crescer junto com o experimento." },
    { tipo: "h3", texto: "As seis vantagens da computação em nuvem" },
    { tipo: "p", texto: "A AWS resume os benefícios da nuvem em seis pontos, e o exame cobra todos eles, geralmente em questões que descrevem uma situação e perguntam qual vantagem está em jogo." },
    { tipo: "numerada", itens: [
      "Trocar despesa fixa por despesa variável: pagar só pelo que consumir, em vez de investir antes em datacenters e servidores.",
      "Aproveitar a economia de escala: como a AWS atende milhões de clientes, os custos por unidade caem e os preços são menores do que você conseguiria sozinho.",
      "Parar de adivinhar a capacidade: aumentar e diminuir recursos conforme a demanda real, sem comprar de menos (e travar o negócio) nem de mais (e desperdiçar).",
      "Aumentar a velocidade e a agilidade: um ambiente novo fica pronto em minutos, e experimentar passa a custar pouco.",
      "Parar de gastar com a operação de datacenters: a equipe foca em produtos e clientes, e não em racks, energia e cabeamento.",
      "Ficar global em minutos: implantar a aplicação em várias regiões do mundo com poucos cliques, aproximando-a dos usuários.",
    ] },
    { tipo: "h3", texto: "Elasticidade, escalabilidade e alta disponibilidade" },
    { tipo: "p", texto: "Três palavras aparecem o tempo todo no exame e costumam ser confundidas. Escalabilidade é a capacidade de um sistema suportar mais carga ao receber mais recursos: adicionar servidores para atender mais usuários. Elasticidade é escalar de forma automática e dinâmica, para cima e para baixo, acompanhando a demanda: em uma promoção, os recursos aumentam sozinhos e, quando passa, diminuem, e a conta acompanha. Alta disponibilidade é continuar funcionando mesmo quando um componente falha, e isso não tem a ver com velocidade. Um site pode ser muito rápido e cair por completo quando o único servidor falha." },
    { tipo: "dica", titulo: "Como ler a pergunta", texto: "Se o enunciado fala em \"ajustar automaticamente conforme a demanda\", pense em elasticidade. Se fala em \"continuar funcionando se um datacenter falhar\", pense em alta disponibilidade, que na AWS vem de usar mais de uma Zona de Disponibilidade. Se fala em \"menor latência\", pense em aproximar os dados do usuário (Região escolhida com cuidado, CloudFront)." },

    { tipo: "h", texto: "Modelos de serviço: IaaS, PaaS e SaaS" },
    { tipo: "p", texto: "Os modelos de serviço descrevem quanto da pilha de tecnologia o provedor gerencia e quanto continua com você. Pense em uma escada: em cada degrau, mais responsabilidade passa para o provedor e menos controle (e menos trabalho) fica com o cliente." },
    { tipo: "tabela", legenda: "Quem administra cada camada", cabecalho: ["Modelo", "O provedor entrega", "Você administra", "Exemplo na AWS"], linhas: [
      ["IaaS (infraestrutura como serviço)", "Servidores, rede e armazenamento virtuais.", "Sistema operacional, aplicações, dados e configuração.", "Amazon EC2"],
      ["PaaS (plataforma como serviço)", "Infraestrutura mais o ambiente de execução e o sistema operacional.", "A aplicação e os dados.", "AWS Elastic Beanstalk"],
      ["SaaS (software como serviço)", "O software pronto, em funcionamento.", "O uso e a configuração da conta.", "Amazon Connect (central de atendimento)"],
    ] },
    { tipo: "p", texto: "Em geral, dentro da própria AWS, a diferença se vê comparando EC2 (você instala e atualiza o sistema operacional), AWS Lambda (você só envia o código) e Amazon S3 (você só usa o armazenamento). Quanto mais gerenciado o serviço, menos tarefas operacionais sobram para você, e isso vai reaparecer na seção sobre responsabilidade compartilhada." },

    { tipo: "h", texto: "Modelos de implantação" },
    { tipo: "lista", itens: [
      "Nuvem pública: recursos de um provedor como a AWS, compartilhados com outros clientes de forma isolada logicamente, e cobrados pelo uso. É o modelo mais comum.",
      "Nuvem privada: ambiente dedicado a uma única organização, no próprio datacenter ou hospedado, com mais controle e mais custo operacional.",
      "Nuvem híbrida: integração entre a infraestrutura local (on-premises) e a nuvem, comum em migrações graduais ou quando requisitos legais mantêm certos dados dentro da empresa. Na AWS, serviços como o AWS Direct Connect e a VPN conectam os dois lados, e o AWS Outposts leva a infraestrutura da AWS para o seu datacenter.",
    ] },
    { tipo: "alerta", titulo: "Híbrida não é \"metade em cada\"", texto: "Nuvem híbrida significa que os dois ambientes trabalham integrados, como partes de um mesmo sistema. Ter uma aplicação só no datacenter e outra, sem relação, na nuvem não é uma arquitetura híbrida: são dois ambientes separados." },

    { tipo: "h", texto: "A infraestrutura global da AWS" },
    { tipo: "p", texto: "A AWS organiza a sua infraestrutura em camadas, e entender cada uma é essencial para responder a perguntas sobre disponibilidade, latência e conformidade." },
    { tipo: "codigo", linguagem: "text", legenda: "Como a infraestrutura se organiza", texto: `Região  (ex.: sa-east-1, São Paulo)
├── Zona de Disponibilidade  sa-east-1a   (um ou mais datacenters isolados)
├── Zona de Disponibilidade  sa-east-1b   (energia, rede e refrigeração próprias)
└── Zona de Disponibilidade  sa-east-1c
        │
        └── ligadas entre si por rede de baixa latência e alta velocidade

Pontos de presença (edge locations)
└── espalhados pelo mundo, usados pelo CloudFront e pelo Route 53
    para entregar conteúdo e responder consultas DNS perto do usuário` },
    { tipo: "p", texto: "Uma Região é uma área geográfica, como São Paulo, Virgínia do Norte ou Irlanda. Cada Região é independente das outras: os recursos que você cria em uma não aparecem nas outras, e os dados não saem dela a menos que você os copie. Isso é importante para conformidade: se uma lei exige que os dados fiquem no Brasil, você escolhe a Região de São Paulo e mantém os dados lá." },
    { tipo: "p", texto: "Dentro de cada Região existem várias Zonas de Disponibilidade (AZs): conjuntos de um ou mais datacenters, fisicamente separados, com energia, refrigeração e rede independentes, mas conectados por links de alta velocidade e baixa latência. A separação é planejada para que um incêndio, uma queda de energia ou uma inundação em uma AZ não derrube as outras. Distribuir a aplicação por duas ou mais AZs é a forma padrão de obter alta disponibilidade na AWS." },
    { tipo: "p", texto: "Os pontos de presença (edge locations) ficam em muitas cidades, bem mais numerosos do que as Regiões, e servem para aproximar do usuário final o conteúdo em cache do Amazon CloudFront e as respostas do Amazon Route 53. Uma pessoa em Manaus que acessa um site hospedado em São Paulo recebe imagens e vídeos de um ponto de presença mais próximo, e o carregamento fica mais rápido. Há ainda opções para casos especiais: as Local Zones aproximam serviços de grandes centros urbanos, o AWS Wavelength leva a computação para dentro de redes 5G e o AWS Outposts instala hardware da AWS no seu local." },
    { tipo: "codigo", linguagem: "bash", legenda: "Listar Regiões e Zonas pela AWS CLI (exemplo)", texto: `# Regiões habilitadas na sua conta (o resultado varia)
aws ec2 describe-regions --query "Regions[].RegionName" --output text

# Zonas de Disponibilidade de uma Região específica
aws ec2 describe-availability-zones --region sa-east-1 \\
    --query "AvailabilityZones[].ZoneName" --output text` },
    { tipo: "p", texto: "Os comandos acima usam a AWS CLI, a ferramenta de linha de comando da AWS. Eles mostram uma ideia importante: Regiões e AZs são recursos que você consulta e escolhe, e todo recurso que você cria pertence a uma Região (ou, em alguns serviços como o IAM e o Route 53, é global)." },
    { tipo: "h3", texto: "Como escolher uma Região" },
    { tipo: "numerada", itens: [
      "Conformidade e residência de dados: leis, contratos ou políticas internas podem exigir que os dados fiquem em um país. Esse critério decide antes de todos os outros.",
      "Latência: quanto mais perto dos usuários, mais rápida a resposta.",
      "Serviços disponíveis: nem todo serviço ou recurso novo chega a todas as Regiões ao mesmo tempo.",
      "Preço: o custo varia de uma Região para outra pelo mesmo serviço, por causa de impostos, energia e escala locais.",
    ] },

    { tipo: "h", texto: "Conhecendo a conta pela linha de comando" },
    { tipo: "p", texto: "Quase tudo na AWS pode ser feito pelo Console (o site) e pela AWS CLI. Mesmo sem criar recursos, dois comandos ajudam a entender como a conta funciona. O primeiro configura as credenciais e a Região padrão; o segundo mostra quem a CLI acredita que você é, o que evita muitos enganos de \"estou na conta errada\"." },
    { tipo: "codigo", linguagem: "bash", legenda: "Configurar a CLI e conferir a identidade", texto: `aws configure
# pede: Access Key ID, Secret Access Key, Região padrão e formato de saída

aws sts get-caller-identity` },
    { tipo: "codigo", linguagem: "json", legenda: "Resposta do get-caller-identity (valores fictícios)", texto: `{
  "UserId": "AIDAEXEMPLOEXEMPLO123",
  "Account": "123456789012",
  "Arn": "arn:aws:iam::123456789012:user/maria"
}` },
    { tipo: "p", texto: "O ARN (Amazon Resource Name) é o endereço único de qualquer recurso na AWS: identifica o serviço, a Região, a conta e o nome. Você o verá em todo lugar, inclusive nas políticas do próximo módulo. Aqui, ele diz que a identidade é um usuário chamado maria, na conta 123456789012." },
    { tipo: "alerta", titulo: "Credenciais de longa duração são perigosas", texto: "A chave de acesso criada para uma CLI vale até ser apagada. Nunca a coloque em código, em repositórios ou em mensagens. Para trabalho diário, prefira credenciais temporárias, como as do IAM Identity Center, assunto do próximo módulo." },

    { tipo: "h", texto: "O modelo de responsabilidade compartilhada" },
    { tipo: "p", texto: "A pergunta de segurança mais importante da AWS é \"de quem é a responsabilidade?\". A resposta é o modelo de responsabilidade compartilhada, que divide as tarefas em duas metades. A AWS é responsável pela segurança DA nuvem: os datacenters, o hardware, a rede física, o software de virtualização e os serviços em si. O cliente é responsável pela segurança NA nuvem: o que ele coloca e configura dentro dela, como os dados, as identidades e permissões, a configuração de rede e do sistema operacional." },
    { tipo: "tabela", legenda: "Quem cuida de cada parte", cabecalho: ["Responsabilidade da AWS (DA nuvem)", "Responsabilidade do cliente (NA nuvem)"], linhas: [
      ["Segurança física dos datacenters", "Dados armazenados e sua classificação"],
      ["Hardware, rede física e energia", "Gerenciamento de identidades e permissões (IAM)"],
      ["Software de virtualização (hipervisor)", "Configuração de firewalls e grupos de segurança"],
      ["Operação dos serviços gerenciados", "Sistema operacional, patches e aplicações em instâncias EC2"],
      ["Software e hardware que sustentam o S3, o DynamoDB e outros", "Criptografia dos dados e gestão das chaves, quando aplicável"],
    ] },
    { tipo: "p", texto: "A divisão muda conforme o serviço. Em um serviço de infraestrutura, como o EC2, o cliente administra o sistema operacional convidado: instala as atualizações, configura o firewall do servidor e protege as aplicações. Em um serviço gerenciado, como o Amazon RDS, a AWS cuida do sistema operacional e dos patches do banco, e o cliente cuida dos dados, dos usuários e das regras de acesso. Em serviços abstratos, como o S3 e o Lambda, a AWS administra quase toda a infraestrutura, mas o cliente continua responsável por quem pode acessar os dados e pelo código que executa." },
    { tipo: "tabela", legenda: "Exemplos de quem faz o quê", cabecalho: ["Tarefa", "Quem faz"], linhas: [
      ["Substituir um disco que falhou no datacenter", "AWS"],
      ["Instalar o patch de segurança do Linux em uma instância EC2", "Cliente"],
      ["Aplicar patches no banco de dados do Amazon RDS", "AWS (o cliente escolhe a janela de manutenção)"],
      ["Definir quem pode ler os arquivos de um bucket S3", "Cliente"],
      ["Proteger fisicamente os servidores contra invasão", "AWS"],
      ["Ativar a autenticação multifator (MFA) dos usuários", "Cliente"],
    ] },
    { tipo: "p", texto: "Existem ainda os controles compartilhados, que se aplicam às duas partes de maneiras diferentes: gerenciamento de patches (a AWS corrige a infraestrutura, o cliente corrige os seus sistemas), gerenciamento de configuração (a AWS configura seus dispositivos, o cliente configura seus recursos) e treinamento (a AWS treina a equipe dela, o cliente treina a dele)." },
    { tipo: "alerta", titulo: "Quase todo incidente na nuvem é de configuração", texto: "A grande maioria dos vazamentos de dados em nuvem acontece por configuração errada do cliente (um bucket aberto ao público, uma chave de acesso colocada em um repositório, uma permissão ampla demais), e não por invasão aos datacenters da AWS. Entender a divisão de responsabilidades é o primeiro passo para saber onde olhar." },

    { tipo: "h", texto: "Como o exame pergunta isso" },
    { tipo: "p", texto: "As questões do CLF-C02 costumam descrever uma necessidade e pedir o conceito, o serviço ou o benefício correspondente. Quatro hábitos ajudam. Primeiro, identifique a necessidade central da pergunta: segurança, disponibilidade, custo ou menor esforço de operação. Segundo, destaque as palavras-chave, como \"gerenciado\", \"menor privilégio\", \"automaticamente\" e \"global\". Terceiro, elimine as respostas que resolvem outro tipo de problema. Quarto, entre as que sobram, escolha a mais simples que atende a todos os requisitos: o exame prefere a solução gerenciada e direta, e não a mais elaborada." },
    { tipo: "lista", itens: [
      "\"Sem comprar hardware, pagando só o que usa\": despesa variável, benefício de agilidade.",
      "\"Continuar funcionando se um datacenter falhar\": mais de uma Zona de Disponibilidade.",
      "\"Recuperação de desastres em outro continente\": mais de uma Região.",
      "\"Manter parte do sistema no datacenter e integrá-lo à nuvem\": arquitetura híbrida.",
      "\"Quem aplica o patch do sistema operacional da instância EC2?\": o cliente.",
    ] },
  ],
  questoes: [
    {
      enunciado: "Uma startup quer lançar um protótipo sem comprar servidores e pagando somente pelo que usar. Qual vantagem da nuvem está sendo aproveitada?",
      opcoes: ["Despesa de capital (CAPEX) mais alta", "Controle total do hardware físico", "Troca de despesa fixa por despesa variável", "Contrato obrigatório de cinco anos"],
      correta: 2,
      explicacao: "A primeira vantagem da nuvem é trocar o investimento inicial (despesa fixa) por despesa variável, pagando pelo consumo. Hardware próprio e contratos longos são o contrário do que a nuvem oferece.",
    },
    {
      enunciado: "O que é uma Zona de Disponibilidade (AZ)?",
      opcoes: ["Uma área geográfica que reúne várias Regiões", "Um ou mais datacenters isolados dentro de uma Região, com energia e rede independentes", "Um ponto de presença do CloudFront", "Uma conta AWS separada"],
      correta: 1,
      explicacao: "Uma Região contém várias AZs. Cada AZ é formada por um ou mais datacenters separados fisicamente, o que permite construir aplicações que continuam funcionando se uma AZ falhar.",
    },
    {
      enunciado: "Para que uma aplicação continue disponível caso um datacenter inteiro falhe, o que se deve fazer?",
      opcoes: ["Usar uma instância maior", "Distribuir a aplicação por mais de uma Zona de Disponibilidade", "Colocar tudo em uma única AZ para reduzir a latência", "Aumentar o tamanho do disco"],
      correta: 1,
      explicacao: "A alta disponibilidade na AWS vem da redundância entre AZs. Uma instância maior melhora o desempenho, e não a disponibilidade, e uma única AZ continua sendo um ponto único de falha.",
    },
    {
      enunciado: "Uma empresa precisa guardar dados de clientes obrigatoriamente em território brasileiro. Qual critério de escolha de Região é o decisivo?",
      opcoes: ["Conformidade e residência dos dados", "Preço mais baixo", "Maior número de serviços novos", "Menor latência para outro país"],
      correta: 0,
      explicacao: "Quando uma lei ou um contrato exige que os dados fiquem em um país, a conformidade prevalece sobre latência, preço e serviços disponíveis. A escolha seria uma Região no Brasil, como São Paulo.",
    },
    {
      enunciado: "Qual das tarefas abaixo é responsabilidade do cliente em uma instância Amazon EC2?",
      opcoes: ["Proteger fisicamente o datacenter", "Atualizar o sistema operacional da instância", "Substituir o hardware com defeito", "Manter a rede física entre as AZs"],
      correta: 1,
      explicacao: "No EC2, o cliente administra o sistema operacional convidado, incluindo patches, firewall interno e aplicações. A parte física e a virtualização são da AWS.",
    },
    {
      enunciado: "Qual a diferença entre elasticidade e alta disponibilidade?",
      opcoes: ["São sinônimos", "Elasticidade é sobre segurança e alta disponibilidade é sobre custo", "Alta disponibilidade só existe em nuvem privada", "Elasticidade ajusta os recursos automaticamente à demanda; alta disponibilidade mantém o sistema funcionando mesmo com falhas"],
      correta: 3,
      explicacao: "Elasticidade é aumentar e reduzir recursos de forma automática conforme a carga. Alta disponibilidade é resistir a falhas de componentes, em geral com redundância entre AZs. Um sistema pode ter uma sem a outra.",
    },
    {
      enunciado: "Uma empresa mantém parte dos sistemas no próprio datacenter, conectada à AWS por uma VPN, e executa o restante na nuvem. Como se chama esse modelo?",
      opcoes: ["Nuvem pública", "Nuvem privada", "Nuvem híbrida", "Multirregião"],
      correta: 2,
      explicacao: "Integrar infraestrutura local e nuvem em um mesmo ambiente é uma arquitetura híbrida. Nuvem pública seria usar apenas a AWS, e multirregião diz respeito ao uso de várias Regiões da AWS.",
    },
  ],
  desafio: {
    titulo: "Mapa de decisões de uma empresa fictícia",
    enunciado: "Uma loja virtual brasileira vende para o país inteiro, tem picos de acesso em datas promocionais e armazena dados de clientes sujeitos à LGPD. Ela está decidindo migrar da hospedagem atual para a AWS. Escreva um documento curto (uma ou duas páginas) com as decisões e as justificativas. Você não precisa criar nada na AWS para este desafio.",
    requisitos: [
      "Escolha uma Região e justifique usando os quatro critérios (conformidade, latência, serviços, preço).",
      "Diga quantas Zonas de Disponibilidade usar e o que acontece com a loja se uma delas falhar.",
      "Liste quais das seis vantagens da nuvem mais importam para esse negócio, em ordem, com um exemplo concreto de cada.",
      "Monte uma tabela de responsabilidade compartilhada para três serviços que a loja usaria (por exemplo EC2, S3 e RDS), dizendo o que é da AWS e o que é da loja.",
      "Aponte duas práticas de segurança que seriam responsabilidade da loja e que, se esquecidas, poderiam expor os dados dos clientes.",
    ],
    criterios: [
      "A escolha da Região considera a conformidade antes do preço.",
      "A resposta mostra a diferença entre elasticidade (picos) e alta disponibilidade (falhas).",
      "A tabela de responsabilidades muda de acordo com o serviço, e não é a mesma para os três.",
      "As práticas de segurança são do lado do cliente (como permissões, MFA, criptografia e configuração).",
      "Você consegue explicar o documento em dois minutos para alguém sem conhecimento técnico.",
    ],
    dica: "Se quiser praticar na própria conta, crie uma conta AWS com o plano gratuito, ative a autenticação multifator no usuário raiz e crie um orçamento (AWS Budgets) com alerta de gasto. Atenção: serviços fora do nível gratuito geram cobrança, então confira os limites antes de criar recursos e apague o que não for mais usar.",
  },
  referencias: [
    { titulo: "AWS: o que é computação em nuvem", url: "https://aws.amazon.com/what-is-cloud-computing/" },
    { titulo: "AWS: infraestrutura global", url: "https://aws.amazon.com/about-aws/global-infrastructure/" },
    { titulo: "AWS: modelo de responsabilidade compartilhada", url: "https://aws.amazon.com/compliance/shared-responsibility-model/" },
    { titulo: "AWS: guia do exame Cloud Practitioner", url: "https://aws.amazon.com/certification/certified-cloud-practitioner/" },
  ],
};
