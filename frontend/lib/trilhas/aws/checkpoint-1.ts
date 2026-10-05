import type { Checkpoint } from "../tipos";

export const AWS_CHECKPOINT_1: Checkpoint = {
  tipo: "checkpoint",
  slug: "checkpoint-fundamentos-e-iam",
  titulo: "Checkpoint: conceitos de nuvem e IAM",
  resumo: "Nove questões no estilo do exame sobre nuvem, infraestrutura global, responsabilidade compartilhada e IAM.",
  cobre: ["nuvem-regioes-e-responsabilidade", "iam-e-governanca-de-contas"],
  notaMinima: 0.7,
  questoes: [
    {
      enunciado: "Uma loja online tem picos de acesso na Black Friday e quase nenhum movimento no resto do ano. Qual característica da nuvem evita pagar o ano todo pela capacidade do pico?",
      opcoes: ["Alta latência", "Elasticidade", "Contratos de longo prazo", "Compra antecipada de hardware"],
      correta: 1,
      explicacao: "A elasticidade permite aumentar e diminuir os recursos automaticamente conforme a demanda, e a cobrança acompanha o uso. Contratos longos e hardware próprio levam a pagar pelo pico o ano inteiro.",
    },
    {
      enunciado: "Qual afirmação descreve corretamente uma Região AWS?",
      opcoes: ["É um único datacenter", "É uma área geográfica com várias Zonas de Disponibilidade isoladas", "É um ponto de presença do CloudFront", "É um tipo de conta"],
      correta: 1,
      explicacao: "Uma Região é uma localização geográfica composta por várias AZs. Um datacenter isolado é o que compõe uma AZ, e os pontos de presença são uma camada separada, usada para entrega de conteúdo.",
    },
    {
      enunciado: "Qual serviço AWS é um exemplo clássico de IaaS, no qual o cliente administra o sistema operacional?",
      opcoes: ["Amazon EC2", "Amazon Connect", "Amazon S3", "AWS Lambda"],
      correta: 0,
      explicacao: "No EC2 você escolhe a imagem, instala as atualizações e administra o sistema operacional. O S3 e o Lambda são mais gerenciados, e o Amazon Connect é um software entregue como serviço.",
    },
    {
      enunciado: "Quem é responsável por aplicar os patches de segurança do sistema operacional de uma instância EC2?",
      opcoes: ["A AWS", "O cliente", "A AWS e o cliente igualmente, sem distinção", "O provedor da internet"],
      correta: 1,
      explicacao: "Pelo modelo de responsabilidade compartilhada, a AWS cuida da segurança da infraestrutura, e o cliente, do que roda nela: sistema operacional, aplicações, dados e configurações.",
    },
    {
      enunciado: "Uma empresa quer que sua aplicação continue no ar mesmo que um datacenter inteiro fique indisponível. O que ela deve fazer?",
      opcoes: ["Usar uma única AZ com uma instância maior", "Distribuir a aplicação por duas ou mais Zonas de Disponibilidade", "Trocar de Região a cada semana", "Desligar a aplicação à noite"],
      correta: 1,
      explicacao: "A alta disponibilidade vem de redundância em várias AZs de uma Região. Uma instância maior melhora o desempenho, mas continua dependendo de um único local.",
    },
    {
      enunciado: "Qual é a prática mais segura para dar a uma aplicação em execução no EC2 acesso ao Amazon S3?",
      opcoes: ["Colocar a chave de acesso no código-fonte", "Anexar uma função IAM à instância", "Usar o usuário raiz", "Deixar o bucket aberto ao público"],
      correta: 1,
      explicacao: "Uma função IAM entrega credenciais temporárias e rotacionadas automaticamente, sem segredos para guardar. As demais opções criam credenciais de longa duração ou expõem os dados.",
    },
    {
      enunciado: "Qual é o resultado quando uma política IAM permite uma ação, mas outra política aplicada à mesma identidade a nega explicitamente?",
      opcoes: ["Permitido", "Negado", "Permitido, se a política de Allow for mais antiga", "Permitido somente com MFA"],
      correta: 1,
      explicacao: "Um Deny explícito sempre prevalece sobre qualquer Allow. Por padrão, tudo que não é permitido é negado, e o negar explícito é o nível mais forte da avaliação.",
    },
    {
      enunciado: "Uma empresa quer impedir, em todas as contas de uma unidade organizacional, o uso de Regiões fora do Brasil. Qual recurso usar?",
      opcoes: ["Um grupo IAM", "Uma política de controle de serviço (SCP) do AWS Organizations", "Um Security Group", "O AWS Budgets"],
      correta: 1,
      explicacao: "As SCPs definem o limite de permissões para as contas de uma OU, inclusive restringindo Regiões. Grupos IAM valem dentro de uma conta, os Security Groups controlam tráfego de rede, e o Budgets acompanha custos.",
    },
    {
      enunciado: "Qual das alternativas NÃO é uma das seis vantagens da computação em nuvem descritas pela AWS?",
      opcoes: ["Trocar despesa fixa por despesa variável", "Aproveitar a economia de escala", "Ter capacidade fixa e sempre superdimensionada", "Ficar global em minutos"],
      correta: 2,
      explicacao: "A nuvem permite parar de adivinhar a capacidade, ajustando-a à demanda. Capacidade fixa e superdimensionada é justamente o problema do modelo tradicional, que a nuvem resolve.",
    },
  ],
};
