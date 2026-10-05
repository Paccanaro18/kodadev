import type { Checkpoint } from "../tipos";

export const AWS_CHECKPOINT_2: Checkpoint = {
  tipo: "checkpoint",
  slug: "checkpoint-computacao-armazenamento-redes-e-dados",
  titulo: "Checkpoint: computação, armazenamento, redes e bancos de dados",
  resumo: "Nove questões no estilo do exame sobre os serviços principais: EC2, Lambda, S3, EBS, VPC, Route 53, RDS e DynamoDB.",
  cobre: [
    "computacao-ec2-conteineres-e-lambda",
    "armazenamento-s3-ebs-e-efs",
    "redes-vpc-route-53-e-cloudfront",
    "bancos-de-dados-rds-aurora-e-dynamodb",
  ],
  notaMinima: 0.7,
  questoes: [
    {
      enunciado: "Uma carga de processamento pode ser interrompida e retomada, e a empresa quer o menor custo possível. Qual modelo de compra do EC2 é o mais indicado?",
      opcoes: ["Sob demanda", "Hosts dedicados", "Spot", "Savings Plans de três anos"],
      correta: 2,
      explicacao: "O Spot usa capacidade ociosa com grande desconto, com risco de interrupção. É ideal para cargas tolerantes a falhas e retomáveis.",
    },
    {
      enunciado: "Qual é a diferença entre o Auto Scaling e o Elastic Load Balancing?",
      opcoes: ["São o mesmo serviço", "O Auto Scaling ajusta a quantidade de instâncias; o balanceador distribui o tráfego entre as instâncias saudáveis", "O balanceador cria instâncias; o Auto Scaling distribui o tráfego", "Ambos servem para armazenar objetos"],
      correta: 1,
      explicacao: "O Auto Scaling muda a capacidade; o balanceador distribui as requisições e verifica a saúde dos destinos. Eles se complementam.",
    },
    {
      enunciado: "Uma tarefa de processamento leva duas horas por execução. Por que o AWS Lambda, sozinho, não é adequado?",
      opcoes: ["Porque o Lambda não escala", "Porque o tempo máximo de uma execução do Lambda é de 15 minutos", "Porque o Lambda exige instâncias EC2", "Porque o Lambda só funciona com Java"],
      correta: 1,
      explicacao: "O limite de execução do Lambda é de 15 minutos. Processos longos pedem contêineres, EC2 ou a divisão do trabalho em etapas.",
    },
    {
      enunciado: "Dados que raramente são acessados, mas devem ser guardados por anos ao menor custo possível, combinam com qual classe do S3?",
      opcoes: ["S3 Glacier Deep Archive", "S3 Standard", "S3 Intelligent-Tiering", "S3 Standard-IA"],
      correta: 0,
      explicacao: "O Glacier Deep Archive é a classe mais barata, para retenção de longo prazo e acesso raríssimo, com recuperação em horas.",
    },
    {
      enunciado: "Qual recurso protege os objetos de um bucket contra exclusão ou sobrescrita acidental, mantendo versões anteriores?",
      opcoes: ["Versionamento do bucket", "Transfer Acceleration", "Uma classe de armazenamento mais barata", "Um endpoint de VPC"],
      correta: 0,
      explicacao: "Com o versionamento, cada alteração ou exclusão cria uma nova versão, e as anteriores continuam recuperáveis.",
    },
    {
      enunciado: "Servidores em sub-redes privadas precisam baixar atualizações da internet sem que a internet consiga iniciar conexões com eles. O que usar?",
      opcoes: ["Um Internet Gateway na sub-rede privada", "Um NAT Gateway em uma sub-rede pública", "Um VPC peering", "Um Elastic IP em cada servidor"],
      correta: 1,
      explicacao: "O NAT Gateway permite conexões de saída iniciadas de dentro da rede privada e bloqueia as iniciadas de fora.",
    },
    {
      enunciado: "Qual afirmação sobre grupos de segurança está correta?",
      opcoes: ["Aplicam-se a sub-redes e têm regras de negação", "São stateless e avaliados em ordem numérica", "Aplicam-se a instâncias, têm só regras de permissão e são stateful", "Substituem o IAM"],
      correta: 2,
      explicacao: "Grupos de segurança protegem instâncias, só permitem tráfego (o resto é bloqueado) e guardam o estado das conexões. As ACLs de rede, ao contrário, são stateless e têm negação.",
    },
    {
      enunciado: "Uma aplicação precisa sobreviver à falha de uma Zona de Disponibilidade, com failover automático do banco relacional. O que ativar no RDS?",
      opcoes: ["Réplicas de leitura", "Snapshots manuais", "Uma instância maior", "Multi-AZ"],
      correta: 3,
      explicacao: "O Multi-AZ mantém uma réplica síncrona em outra AZ e faz o failover automático. As réplicas de leitura servem para escalar leituras.",
    },
    {
      enunciado: "Um carrinho de compras precisa de acesso por chave, com latência de poucos milissegundos e escala para milhões de requisições, sem administrar servidores. Qual serviço escolher?",
      opcoes: ["Amazon Redshift", "Amazon DynamoDB", "Amazon RDS para SQL Server", "Amazon EBS"],
      correta: 1,
      explicacao: "O DynamoDB é um banco NoSQL serverless de chave-valor, com latência baixa em qualquer escala. O Redshift é um data warehouse analítico, e o RDS é relacional.",
    },
  ],
};
