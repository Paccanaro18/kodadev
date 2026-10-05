import type { Modulo } from "../tipos";

export const AWS_MODULO_3: Modulo = {
  tipo: "modulo",
  slug: "computacao-ec2-conteineres-e-lambda",
  titulo: "Computação: EC2, contêineres e serverless",
  resumo: "Instâncias EC2, tipos e modelos de compra, Auto Scaling e balanceamento, contêineres com ECS, EKS e Fargate, e funções Lambda com API Gateway e EventBridge.",
  nivel: "Iniciante",
  leitura: "55 min",
  objetivos: [
    "Escolher a família de instância EC2 pelo perfil da carga e o modelo de compra pelo padrão de uso.",
    "Explicar como Auto Scaling e Elastic Load Balancing se complementam.",
    "Diferenciar ECS, EKS e Fargate, e saber quando contêineres são a resposta.",
    "Descrever o modelo do AWS Lambda, seus limites e como é cobrado.",
    "Escolher entre EC2, contêineres e serverless para um cenário, justificando pela operação e pelo custo.",
  ],
  preRequisitos: [
    "Ter feito os módulos sobre conceitos de nuvem e sobre IAM.",
  ],
  pontosChave: [
    "Quanto mais gerenciado o serviço de computação, menos você opera e mais a AWS faz por você.",
    "O Auto Scaling muda a quantidade de instâncias; o balanceador distribui o tráfego entre elas.",
    "Spot é barato e pode ser interrompido; compromisso (Savings Plans, instâncias reservadas) é para uso estável.",
    "ECS e EKS orquestram contêineres; o Fargate fornece a capacidade sem servidores para gerenciar.",
    "O Lambda executa código por evento, escala sozinho, tem limite de tempo e cobra por requisição e duração.",
  ],
  blocos: [
    { tipo: "p", texto: "O domínio de tecnologia e serviços de nuvem é o maior do exame (34%), e a computação é o primeiro assunto dele. A pergunta de fundo é sempre a mesma: onde o seu código vai rodar, e quanta parte dessa máquina você quer administrar? A AWS responde com um espectro, que vai de servidores virtuais que você controla por inteiro até funções que você só envia, e o exame cobra que você saiba escolher um ponto desse espectro para cada situação." },
    { tipo: "tabela", legenda: "O espectro da computação na AWS", cabecalho: ["Opção", "Você administra", "A AWS administra", "Quando escolher"], linhas: [
      ["Amazon EC2", "Sistema operacional, patches, aplicação, escala.", "Hardware e virtualização.", "Controle total, software legado, cargas especiais."],
      ["Contêineres (ECS/EKS) em EC2", "As instâncias do cluster e os contêineres.", "O orquestrador (plano de controle) e a infraestrutura.", "Muitas aplicações em contêineres, com controle da frota."],
      ["Contêineres com Fargate", "A imagem do contêiner e suas configurações.", "Os servidores onde os contêineres rodam.", "Contêineres sem administrar servidores."],
      ["AWS Lambda", "Somente o código e a configuração da função.", "Servidores, sistema operacional, escala.", "Código curto, orientado a eventos, carga variável."],
    ] },

    { tipo: "h", texto: "Amazon EC2: servidores virtuais" },
    { tipo: "p", texto: "O Amazon Elastic Compute Cloud (EC2) fornece máquinas virtuais, chamadas instâncias, que você cria em minutos e paga pelo tempo de uso. Para criar uma, você escolhe uma imagem (AMI, Amazon Machine Image), que traz o sistema operacional e o software inicial, um tipo de instância (a combinação de CPU, memória, rede e armazenamento), o armazenamento, um grupo de segurança (o firewall da instância) e um par de chaves para acesso, quando necessário. No modelo de responsabilidade compartilhada, o EC2 é infraestrutura como serviço: o sistema operacional e tudo acima dele são seus." },
    { tipo: "h3", texto: "Famílias de instância" },
    { tipo: "tabela", legenda: "Escolha pela necessidade dominante da carga", cabecalho: ["Família", "Perfil", "Exemplos de uso"], linhas: [
      ["Uso geral (M, T)", "Equilíbrio entre CPU, memória e rede. A família T é \"burstable\": acumula crédito e usa picos de CPU.", "Servidores web, aplicações corporativas, ambientes de desenvolvimento."],
      ["Otimizada para computação (C)", "Muita CPU em relação à memória.", "Processamento em lote, codificação de vídeo, servidores de jogos, modelagem científica."],
      ["Otimizada para memória (R, X)", "Muita memória em relação à CPU.", "Bancos de dados em memória, cache grande, análises de grandes conjuntos."],
      ["Otimizada para armazenamento (I, D)", "Acesso rápido a muito armazenamento local.", "Bancos transacionais de alto desempenho, sistemas de arquivos distribuídos, data warehousing."],
      ["Computação acelerada (P, G)", "GPUs e outros aceleradores.", "Treinamento e inferência de aprendizado de máquina, gráficos."],
    ] },
    { tipo: "p", texto: "Os nomes seguem um padrão, como m7i.large: a letra indica a família, o número, a geração, e o sufixo depois do ponto, o tamanho (large, xlarge e assim por diante). Gerações mais novas costumam oferecer melhor desempenho pelo mesmo preço. O exame não pede decorar modelos, e sim associar a necessidade (muita memória, GPU, uso equilibrado) à família." },

    { tipo: "h3", texto: "Modelos de compra" },
    { tipo: "p", texto: "O mesmo servidor pode custar bem menos dependendo de como você se compromete. Este é um dos temas favoritos do exame, e o critério de escolha é o padrão de uso da carga." },
    { tipo: "tabela", legenda: "Como comprar capacidade EC2", cabecalho: ["Modelo", "Como funciona", "Melhor para"], linhas: [
      ["Sob demanda (On-Demand)", "Paga-se por segundo ou hora de uso, sem compromisso.", "Cargas novas, imprevisíveis ou de curta duração."],
      ["Savings Plans", "Compromisso de gasto por hora, por um ou três anos, com desconto em troca. Flexível entre tipos de instância e até serviços.", "Uso estável e contínuo, com flexibilidade de configuração."],
      ["Instâncias reservadas", "Compromisso com uma configuração de instância por um ou três anos, com desconto.", "Uso estável e previsível de uma configuração específica."],
      ["Spot", "Capacidade ociosa da AWS com grande desconto, mas que pode ser interrompida com aviso curto.", "Cargas tolerantes a interrupção: processamento em lote, análise de dados, renderização."],
      ["Hosts dedicados", "Um servidor físico inteiro dedicado a você.", "Licenças por soquete ou núcleo, e requisitos de conformidade."],
    ] },
    { tipo: "alerta", titulo: "Spot não serve para tudo", texto: "A promessa de um grande desconto vem com o risco de a AWS recuperar a capacidade e interromper a instância. Use-a em trabalhos que podem ser retomados ou refeitos, e nunca para o único servidor de um banco de dados de produção. Quando a pergunta fala em \"tolerante a falhas\" e \"menor custo possível\", pense em Spot." },

    { tipo: "h3", texto: "Inicialização, metadados e acesso" },
    { tipo: "p", texto: "Duas ideias parecidas têm finalidades diferentes. O user data é um script que você fornece no lançamento e a instância executa na primeira inicialização, para instalar o que for preciso e iniciar a aplicação. Os metadados da instância são informações sobre ela mesma (o identificador, a rede, as credenciais temporárias da função IAM), consultadas por dentro da instância em um endereço local. A recomendação é usar a versão 2 do serviço de metadados (IMDSv2), que exige um token de sessão e protege contra certos ataques, e dar permissões à instância por meio de uma função IAM, nunca por chaves gravadas no user data." },
    { tipo: "codigo", linguagem: "bash", legenda: "Lançando uma instância pela CLI (exemplo)", texto: `# iniciar.sh: o user data, executado uma vez na primeira inicialização
#!/bin/bash
dnf install -y nginx
systemctl enable --now nginx

aws ec2 run-instances \\
    --image-id ami-0abcdef1234567890 \\
    --instance-type t3.micro \\
    --iam-instance-profile Name=funcao-da-aplicacao \\
    --metadata-options HttpTokens=required \\
    --user-data file://iniciar.sh \\
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=web-1}]'` },
    { tipo: "p", texto: "O identificador da AMI do exemplo é fictício (cada Região tem os seus), e o comando exige uma conta configurada e gera cobrança. Note HttpTokens=required, que ativa o IMDSv2, e o perfil de instância, que entrega as credenciais da função IAM à aplicação." },

    { tipo: "h", texto: "Auto Scaling e Elastic Load Balancing" },
    { tipo: "p", texto: "Uma única instância é um ponto de falha e tem um limite de capacidade. Para resolver as duas coisas, combinam-se dois serviços que a prova adora confundir. O Amazon EC2 Auto Scaling mantém um grupo de instâncias: você define a capacidade mínima, a desejada e a máxima, e ele cria ou remove instâncias para seguir a demanda (por métricas como o uso médio de CPU, por horário ou por previsão) e substitui as que falham, distribuindo-as entre as Zonas de Disponibilidade. O Elastic Load Balancing (ELB) distribui o tráfego recebido entre as instâncias saudáveis, verificando continuamente a saúde de cada uma." },
    { tipo: "tabela", legenda: "Quem faz o quê", cabecalho: ["Serviço", "Responsabilidade", "Palavra-chave"], linhas: [
      ["Auto Scaling", "Altera a quantidade de instâncias.", "Elasticidade, substituir instâncias com falha."],
      ["Application Load Balancer (ALB)", "Distribui tráfego HTTP/HTTPS, com regras por caminho ou domínio.", "Aplicações web, camada 7."],
      ["Network Load Balancer (NLB)", "Distribui tráfego TCP/UDP com desempenho muito alto e baixa latência.", "Camada 4, IPs estáticos."],
    ] },
    { tipo: "codigo", linguagem: "json", legenda: "politica-de-escala.json", texto: `{
  "TargetValue": 50.0,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ASGAverageCPUUtilization"
  }
}` },
    { tipo: "p", texto: "A configuração acima é uma política de rastreamento de metas (target tracking): o grupo adiciona instâncias quando a média de CPU passa de 50% e remove quando cai bem abaixo, como um termostato. Fica clara a divisão de papéis: o Auto Scaling cria e remove capacidade; o balanceador distribui as requisições entre o que existe." },

    { tipo: "h", texto: "Contêineres: ECS, EKS e Fargate" },
    { tipo: "p", texto: "Um contêiner empacota a aplicação com tudo de que ela precisa para rodar, o que a faz funcionar do mesmo jeito na máquina do desenvolvedor e em produção. Rodar muitos contêineres exige um orquestrador, que decide onde cada um roda, reinicia os que falham e escala. Na AWS, há duas opções. O Amazon ECS (Elastic Container Service) é o orquestrador próprio da AWS, mais simples e bem integrado. O Amazon EKS (Elastic Kubernetes Service) é o Kubernetes gerenciado, escolhido quando se quer compatibilidade com o ecossistema Kubernetes. O Amazon ECR guarda as imagens dos contêineres." },
    { tipo: "p", texto: "A segunda decisão é onde os contêineres rodam. Em instâncias EC2 que você administra, ou no AWS Fargate, que executa os contêineres sem que você gerencie servidores: você descreve a imagem, a CPU e a memória, e a AWS cuida da capacidade. A frase para guardar: ECS e EKS orquestram; o Fargate fornece a capacidade." },

    { tipo: "h", texto: "AWS Lambda e a computação serverless" },
    { tipo: "p", texto: "\"Serverless\" não quer dizer \"sem servidor\", e sim \"sem servidores para você administrar\". No AWS Lambda, você envia uma função, define o que a dispara (uma chamada HTTP, um arquivo enviado ao S3, uma mensagem em uma fila, um agendamento) e a AWS executa o código sob demanda, escalando de zero a milhares de execuções simultâneas. Você paga pelo número de requisições e pelo tempo de execução (considerando a memória configurada), e não paga nada quando a função não é chamada. Há limites que moldam o uso: o tempo máximo de uma execução é de 15 minutos, então tarefas muito longas pedem contêineres ou EC2, e a primeira chamada depois de um período parado pode ter uma latência extra de inicialização (cold start)." },
    { tipo: "p", texto: "O modelo de programação é simples: uma função que recebe um evento e um contexto. O código a seguir é um manipulador para um endpoint de API, testado localmente com eventos falsos, o que mostra uma vantagem prática: uma função Lambda é só código, e dá para testá-la como qualquer outro." },
    { tipo: "codigo", linguagem: "python", legenda: "lambda_function.py", texto: `import json


def lambda_handler(event: dict, context: object) -> dict:
    """Responde a uma chamada do API Gateway (integração proxy)."""
    params = event.get("queryStringParameters") or {}
    nome = params.get("nome", "mundo")
    if len(nome) > 50:
        return {"statusCode": 400, "body": json.dumps({"erro": "nome muito longo"})}
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"mensagem": f"Olá, {nome}!"}, ensure_ascii=False),
    }


class ContextoFalso:
    aws_request_id = "teste-123"


for evento in [{"queryStringParameters": {"nome": "Ana"}}, {}, {"queryStringParameters": {"nome": "x" * 60}}]:
    resposta = lambda_handler(evento, ContextoFalso())
    print(resposta["statusCode"], resposta["body"])` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `200 {"mensagem": "Olá, Ana!"}
200 {"mensagem": "Olá, mundo!"}
400 {"erro": "nome muito longo"}` },
    { tipo: "p", texto: "O manipulador valida a entrada (nome com no máximo 50 caracteres) e devolve um dicionário com statusCode, cabeçalhos e corpo, que é o formato esperado pela integração proxy do Amazon API Gateway. O API Gateway é o serviço que cria, publica e protege APIs: ele recebe as chamadas HTTP, cuida de autenticação, limites de taxa e estágios, e as encaminha para o Lambda (ou para outros destinos). Juntos, formam a base de uma API serverless." },
    { tipo: "h3", texto: "Outros serviços serverless que aparecem na prova" },
    { tipo: "lista", itens: [
      "AWS Step Functions: coordena os passos de um processo (sequência, paralelismo, decisões, tentativas e tratamento de erros) como um fluxo visual de estados.",
      "Amazon EventBridge: barramento de eventos que conecta serviços de forma desacoplada. Uma regra seleciona eventos por um padrão e os envia a destinos, e também serve para agendamentos.",
      "Amazon SQS e Amazon SNS: filas e notificações para desacoplar produtores e consumidores de mensagens.",
      "AWS Elastic Beanstalk: plataforma como serviço, em que você envia o código e a AWS provisiona e gerencia o ambiente (instâncias, balanceador, Auto Scaling).",
    ] },
    { tipo: "codigo", linguagem: "json", legenda: "padrao-de-evento.json", texto: `{
  "source": ["aws.ec2"],
  "detail-type": ["EC2 Instance State-change Notification"],
  "detail": {
    "state": ["stopped"]
  }
}` },
    { tipo: "p", texto: "Esse padrão de evento do EventBridge seleciona o aviso de que uma instância EC2 foi parada. Ligado a uma função Lambda, ele permite reagir a mudanças sem que um serviço chame o outro diretamente, o que é o espírito de uma arquitetura orientada a eventos." },

    { tipo: "h", texto: "Como escolher" },
    { tipo: "lista", itens: [
      "\"Controle total do sistema operacional\" ou \"software legado que precisa de uma máquina\": EC2.",
      "\"Cargas tolerantes a interrupção ao menor custo\": EC2 Spot. \"Uso estável por um a três anos\": Savings Plans ou instâncias reservadas.",
      "\"Capacidade que acompanha a demanda automaticamente\": Auto Scaling. \"Distribuir tráfego entre instâncias\": Elastic Load Balancing.",
      "\"Contêineres sem gerenciar servidores\": Fargate. \"Kubernetes\": EKS. \"Orquestração simples nativa da AWS\": ECS.",
      "\"Executar código em resposta a eventos, sem servidores, pagando só pelo uso\": Lambda.",
      "\"Expor uma função como API HTTP gerenciada\": API Gateway com Lambda.",
      "\"Enviar o código e deixar a AWS gerenciar o ambiente\": Elastic Beanstalk.",
    ] },
  ],
  questoes: [
    {
      enunciado: "Uma aplicação precisa de muita memória para manter grandes conjuntos de dados em um cache em memória. Qual família de instância EC2 é a mais indicada?",
      opcoes: ["Otimizada para computação (C)", "Computação acelerada (P ou G)", "Otimizada para memória (R ou X)", "Uso geral (T)"],
      correta: 2,
      explicacao: "As famílias otimizadas para memória oferecem muita RAM em relação à CPU, ideais para caches e bancos em memória. A família C prioriza CPU, e as P e G trazem GPUs.",
    },
    {
      enunciado: "Uma empresa roda um processamento em lote que pode ser interrompido e retomado, e quer o menor custo possível. Qual modelo de compra EC2 usar?",
      opcoes: ["Sob demanda", "Hosts dedicados", "Spot", "Savings Plans de três anos"],
      correta: 2,
      explicacao: "O Spot usa capacidade ociosa com grande desconto, mas com risco de interrupção. É ideal para cargas tolerantes a falhas e retomáveis.",
    },
    {
      enunciado: "Qual a diferença entre Auto Scaling e Elastic Load Balancing?",
      opcoes: ["São o mesmo serviço", "O balanceador cria instâncias; o Auto Scaling distribui o tráfego", "Ambos servem só para bancos de dados", "O Auto Scaling cria e remove instâncias conforme a demanda; o balanceador distribui o tráfego entre as instâncias saudáveis"],
      correta: 3,
      explicacao: "Auto Scaling muda a capacidade (quantidade de instâncias); o ELB distribui as requisições e verifica a saúde dos destinos. Eles se complementam.",
    },
    {
      enunciado: "Uma equipe quer executar contêineres sem gerenciar servidores nem instâncias EC2. Qual serviço fornece essa capacidade?",
      opcoes: ["AWS Fargate", "Amazon S3", "Amazon Route 53", "AWS Direct Connect"],
      correta: 0,
      explicacao: "O Fargate executa contêineres do ECS e do EKS sem que o cliente administre os servidores. O ECS e o EKS orquestram, e o Fargate fornece a capacidade.",
    },
    {
      enunciado: "Qual característica descreve melhor o AWS Lambda?",
      opcoes: ["Você administra o sistema operacional das instâncias", "Executa código sob demanda, escala automaticamente e cobra por requisições e tempo de execução", "É um banco de dados relacional", "Só funciona dentro de uma VPC privada"],
      correta: 1,
      explicacao: "No Lambda não há servidores para administrar: o código roda em resposta a eventos, a escala é automática e a cobrança é por uso (requisições e duração).",
    },
    {
      enunciado: "Uma tarefa de processamento de dados leva cerca de duas horas por execução. Por que o Lambda, sozinho, não é a melhor escolha?",
      opcoes: ["Porque o Lambda não processa dados", "Porque o Lambda só aceita Java", "Porque o tempo máximo de uma execução do Lambda é de 15 minutos", "Porque o Lambda não escala"],
      correta: 2,
      explicacao: "O limite de execução do Lambda é de 15 minutos. Processos longos pedem contêineres (por exemplo, Fargate) ou EC2, ou a divisão em etapas menores.",
    },
    {
      enunciado: "Qual serviço cria, publica e protege uma API HTTP que encaminha chamadas para funções Lambda?",
      opcoes: ["Amazon API Gateway", "AWS Shield", "Amazon EBS", "AWS Config"],
      correta: 0,
      explicacao: "O API Gateway recebe as requisições HTTP, aplica autenticação e limites de taxa e as encaminha ao Lambda (ou a outros destinos).",
    },
  ],
  desafio: {
    titulo: "Escolhendo a computação de três sistemas",
    enunciado: "Uma empresa tem três sistemas para levar à AWS: (A) um site institucional com picos de acesso em campanhas, (B) uma rotina noturna que processa arquivos e leva 40 minutos, e (C) um serviço de pagamentos em contêineres, que precisa estar sempre no ar. Faça um documento curto com a arquitetura de computação de cada um e uma estimativa qualitativa de custo. Não é preciso criar recursos na AWS.",
    requisitos: [
      "Para cada sistema, escolha o serviço de computação (EC2, contêineres com Fargate, Lambda ou outro) e justifique por operação, escala e custo.",
      "Defina para o sistema A o uso de Auto Scaling e de um balanceador, com capacidade mínima, desejada e máxima e a métrica escolhida.",
      "Escolha o modelo de compra para cada parte que usar EC2, explicando a escolha pelo padrão de uso.",
      "Para o sistema B, explique por que o Lambda sozinho tem um limite e proponha uma alternativa (ou uma divisão em etapas).",
      "Aponte, para cada sistema, quem é responsável pelo sistema operacional e pelos patches (AWS ou empresa).",
    ],
    criterios: [
      "Cada escolha é justificada por um requisito do sistema, e não por preferência.",
      "O texto mostra a diferença entre Auto Scaling (capacidade) e balanceador (tráfego).",
      "O limite de 15 minutos do Lambda é considerado onde cabe.",
      "A divisão de responsabilidades muda conforme o serviço escolhido.",
      "Você consegue explicar a decisão para alguém sem conhecimento técnico.",
    ],
    dica: "Responda a três perguntas para cada sistema: a carga é constante ou variável? Pode ser interrompida? Quanto do ambiente a equipe quer administrar? As respostas já apontam o serviço.",
  },
  referencias: [
    { titulo: "AWS: tipos de instância do Amazon EC2", url: "https://aws.amazon.com/ec2/instance-types/" },
    { titulo: "AWS: modelos de compra do Amazon EC2", url: "https://aws.amazon.com/ec2/pricing/" },
    { titulo: "AWS: o que é o AWS Lambda", url: "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html" },
    { titulo: "AWS: computação em contêineres", url: "https://aws.amazon.com/containers/" },
  ],
};
