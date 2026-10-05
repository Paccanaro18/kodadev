import type { Modulo } from "../tipos";

export const AWS_MODULO_6: Modulo = {
  tipo: "modulo",
  slug: "bancos-de-dados-rds-aurora-e-dynamodb",
  titulo: "Bancos de dados: RDS, Aurora, DynamoDB e outros",
  resumo: "Os serviços de banco de dados da AWS, quando usar cada um, como obter alta disponibilidade e escala de leitura, e o que muda na responsabilidade de quem opera.",
  nivel: "Iniciante",
  leitura: "50 min",
  objetivos: [
    "Diferenciar bancos relacionais e não relacionais e saber quando cada tipo é adequado.",
    "Explicar o que o Amazon RDS gerencia por você e o que continua sendo seu.",
    "Distinguir Multi-AZ (disponibilidade) de réplicas de leitura (desempenho).",
    "Descrever o Amazon Aurora, o DynamoDB e os bancos especializados (cache, grafo, documentos, análise).",
    "Escolher o serviço de banco de dados adequado a um cenário descrito.",
  ],
  preRequisitos: [
    "Ter feito os módulos de conceitos de nuvem, IAM, computação, armazenamento e redes.",
    "Saber o que é uma tabela e uma chave primária.",
  ],
  pontosChave: [
    "Um banco gerenciado tira do seu trabalho a instalação, os patches e os backups, mas não os dados nem as permissões.",
    "Multi-AZ existe para sobreviver a falhas; réplicas de leitura existem para ler mais rápido e em maior escala.",
    "O DynamoDB é serverless, chave-valor e escala quase sem limite, mas exige pensar nos padrões de acesso.",
    "Não existe um banco para tudo: a escolha parte do padrão de acesso aos dados.",
    "Banco de dados fica em sub-rede privada, com acesso restrito e criptografia.",
  ],
  blocos: [
    { tipo: "p", texto: "Nenhum sistema útil dispensa um banco de dados, e a AWS oferece mais de uma dezena deles, cada um desenhado para um tipo de uso. No exame, as perguntas costumam descrever um cenário (\"transações com junções\", \"milhões de leituras por segundo\", \"relatórios sobre petabytes\") e pedir o serviço adequado. O segredo é associar o padrão de acesso ao tipo de banco, e este módulo organiza o assunto exatamente assim: primeiro a divisão entre os tipos, depois cada serviço e o que ele resolve." },

    { tipo: "h", texto: "Relacional ou não relacional" },
    { tipo: "p", texto: "Os bancos relacionais organizam os dados em tabelas ligadas por chaves, com esquema definido e SQL como linguagem. Garantem transações com as propriedades ACID (atomicidade, consistência, isolamento e durabilidade), o que os torna a escolha natural para sistemas em que a integridade importa, como pedidos, cadastros e finanças. Escalam principalmente na vertical (uma máquina maior) e, para leitura, por réplicas. Os bancos não relacionais (NoSQL) abrem mão de parte dessa estrutura em troca de escala e flexibilidade: chave-valor, documentos, grafos, colunas. Cada um otimiza um padrão de acesso, e escalam na horizontal (mais máquinas)." },
    { tipo: "tabela", legenda: "Dois mundos", cabecalho: ["", "Relacional (SQL)", "Não relacional (NoSQL)"], linhas: [
      ["Modelo", "Tabelas, linhas e relacionamentos.", "Chave-valor, documentos, grafos, colunas."],
      ["Esquema", "Fixo e definido antes.", "Flexível."],
      ["Consultas", "SQL, junções e agregações variadas.", "Pelos padrões de acesso planejados."],
      ["Escala", "Vertical e réplicas de leitura.", "Horizontal, quase sem limite."],
      ["Serviços na AWS", "RDS, Aurora.", "DynamoDB, DocumentDB, Neptune, ElastiCache."],
    ] },
    { tipo: "p", texto: "Outra distinção cobrada é entre OLTP e OLAP. Sistemas transacionais (OLTP) fazem muitas operações pequenas e rápidas, como registrar um pedido, e usam bancos relacionais ou NoSQL. Sistemas analíticos (OLAP) fazem poucas consultas enormes, lendo e agregando muitos dados, como \"qual foi a venda por região nos últimos cinco anos?\", e usam um data warehouse, como o Amazon Redshift." },

    { tipo: "h", texto: "Amazon RDS: relacional gerenciado" },
    { tipo: "p", texto: "Instalar e administrar um banco de dados em uma instância EC2 dá trabalho: sistema operacional, instalação, atualizações de segurança, backups, replicação, monitoramento. O Amazon Relational Database Service (RDS) assume essa operação. Ele oferece os motores mais conhecidos (PostgreSQL, MySQL, MariaDB, Oracle, SQL Server e IBM Db2, além do Aurora), e a AWS cuida do hardware, da instalação, dos patches, dos backups automáticos e da recuperação de falhas. Você continua responsável pelo esquema, pelas consultas, pelos usuários e permissões, pela criptografia configurada e pelo dimensionamento. Em contrapartida, você não tem acesso ao sistema operacional do servidor, e não existe SSH em uma instância RDS." },
    { tipo: "codigo", linguagem: "bash", legenda: "Criando uma instância RDS pela CLI (exemplo)", texto: `aws rds create-db-instance \\
    --db-instance-identifier loja-prod \\
    --engine postgres \\
    --db-instance-class db.t4g.medium \\
    --allocated-storage 50 \\
    --storage-encrypted \\
    --multi-az \\
    --no-publicly-accessible \\
    --backup-retention-period 7 \\
    --db-subnet-group-name sub-redes-de-dados \\
    --vpc-security-group-ids sg-0123456789abcdef0 \\
    --manage-master-user-password` },
    { tipo: "p", texto: "Cada opção do comando corresponde a uma boa prática. --storage-encrypted criptografa os dados em repouso com o KMS. --multi-az mantém uma réplica em outra AZ para failover. --no-publicly-accessible mantém o banco sem endereço público, em sub-redes privadas. --backup-retention-period guarda backups automáticos por 7 dias, com restauração até um ponto no tempo. E --manage-master-user-password faz o RDS guardar a senha do administrador no AWS Secrets Manager, em vez de ela aparecer em um script. Os valores são ilustrativos, e o comando cria recursos pagos." },
    { tipo: "h3", texto: "Multi-AZ e réplicas de leitura" },
    { tipo: "p", texto: "Esta é uma das comparações mais cobradas, porque os dois recursos parecem fazer algo semelhante e servem a fins diferentes." },
    { tipo: "tabela", legenda: "Multi-AZ contra réplicas de leitura", cabecalho: ["", "Multi-AZ", "Réplica de leitura"], linhas: [
      ["Objetivo", "Alta disponibilidade e recuperação de falhas.", "Escalar o desempenho de leitura."],
      ["Replicação", "Síncrona, para uma instância em outra AZ.", "Assíncrona, para uma ou mais réplicas."],
      ["Quem atende as leituras", "Só a instância principal. A reserva espera, sem servir tráfego.", "As réplicas servem consultas de leitura."],
      ["Failover", "Automático: a reserva vira a principal, com o mesmo endereço.", "Manual: a réplica pode ser promovida, mas não é automático."],
      ["Outra Região", "Não: fica na mesma Região.", "Pode ficar em outra Região."],
    ] },
    { tipo: "dica", titulo: "Duas palavras-chave", texto: "Se a pergunta fala em \"sobreviver a uma falha de AZ\" ou \"failover automático\", é Multi-AZ. Se fala em \"muitas leituras\", \"relatórios que sobrecarregam o banco\" ou \"escalar leituras\", são réplicas de leitura. Para os dois ao mesmo tempo, usam-se ambos. (Existe também o Multi-AZ em cluster, com duas reservas que aceitam leitura; o modelo clássico, descrito na tabela, é o que o exame costuma tratar.)" },
    { tipo: "lista", itens: [
      "Backups automáticos: diários, com retenção de 1 a 35 dias, e permitem restaurar para qualquer instante do período (point-in-time recovery). Restaurar cria uma nova instância.",
      "Snapshots manuais: guardados até você apagar, bons para antes de mudanças arriscadas e para copiar para outra Região.",
      "Janela de manutenção: um horário em que a AWS aplica patches, que você escolhe.",
      "Armazenamento escalável: o espaço pode crescer automaticamente conforme o uso.",
    ] },

    { tipo: "h", texto: "Amazon Aurora" },
    { tipo: "p", texto: "O Amazon Aurora é um banco relacional criado pela AWS, compatível com o MySQL e o PostgreSQL, ou seja, as aplicações para esses motores funcionam nele sem mudanças. A diferença está na arquitetura: o armazenamento é separado do processamento e mantém seis cópias dos dados em três Zonas de Disponibilidade, cresce automaticamente em incrementos (até dezenas de terabytes) e se recupera de falhas muito mais rápido. Aceita até 15 réplicas de leitura com latência baixa, e o failover é rápido. A AWS divulga um desempenho várias vezes superior ao dos motores comuns, em condições específicas, e custa mais por hora do que um RDS equivalente, mas costuma compensar em cargas exigentes." },
    { tipo: "lista", itens: [
      "Aurora Serverless: ajusta automaticamente a capacidade conforme a demanda, e serve a cargas variáveis ou imprevisíveis.",
      "Aurora Global Database: replica o banco para outras Regiões, para leitura local de baixa latência e recuperação de desastres regional.",
      "Quando escolher: aplicações relacionais críticas, que precisam de alto desempenho, disponibilidade e escala de leitura.",
    ] },

    { tipo: "h", texto: "Amazon DynamoDB: chave-valor sem servidores" },
    { tipo: "p", texto: "O Amazon DynamoDB é um banco NoSQL de chave-valor e documentos, totalmente gerenciado e serverless: não há servidor para dimensionar nem patch para aplicar. Entrega latência de poucos milissegundos em qualquer escala, e distribui os dados automaticamente entre partições. A capacidade pode ser provisionada (você define as leituras e escritas por segundo) ou sob demanda (paga-se pelo uso e o serviço escala sozinho). É a escolha clássica para carrinhos de compra, sessões de usuário, perfis, catálogos de jogos e qualquer carga com acesso por chave e volume enorme." },
    { tipo: "p", texto: "A modelagem no DynamoDB é diferente da relacional: você parte das perguntas que o sistema fará e desenha as chaves para respondê-las, em vez de normalizar tabelas e juntá-las depois (não há junções). Cada item é identificado por uma chave primária, composta por uma chave de partição (que distribui os dados) e, opcionalmente, uma chave de ordenação (que ordena os itens da mesma partição). O primeiro exemplo mostra um item no formato JSON do DynamoDB, em que cada valor leva o seu tipo (S texto, N número, L lista, M mapa), e o segundo, a definição das chaves de uma tabela." },
    { tipo: "codigo", linguagem: "json", legenda: "item-de-pedido.json", texto: `{
  "pk": { "S": "CLIENTE#42" },
  "sk": { "S": "PEDIDO#2026-01-05#1001" },
  "total": { "N": "199.90" },
  "status": { "S": "PAGO" },
  "itens": {
    "L": [
      { "M": { "sku": { "S": "CAN-01" }, "qtd": { "N": "2" } } }
    ]
  }
}` },
    { tipo: "codigo", linguagem: "json", legenda: "chaves-da-tabela.json", texto: `{
  "AttributeDefinitions": [
    { "AttributeName": "pk", "AttributeType": "S" },
    { "AttributeName": "sk", "AttributeType": "S" }
  ],
  "KeySchema": [
    { "AttributeName": "pk", "KeyType": "HASH" },
    { "AttributeName": "sk", "KeyType": "RANGE" }
  ],
  "BillingMode": "PAY_PER_REQUEST"
}` },
    { tipo: "p", texto: "Com essas chaves, uma consulta eficiente é \"todos os pedidos do cliente 42\" (mesma chave de partição, qualquer chave de ordenação que comece por PEDIDO#), e os pedidos já saem ordenados por data. Já uma pergunta que não combina com as chaves (\"todos os pedidos pagos de qualquer cliente\") exigiria varrer a tabela inteira, o que é caro, ou criar um índice secundário. É o preço da escala: o desenho depende de conhecer os padrões de acesso." },
    { tipo: "lista", itens: [
      "DynamoDB Accelerator (DAX): cache em memória na frente do DynamoDB, que reduz a latência de milissegundos para microssegundos.",
      "Tabelas globais: replicação multirregional automática, com escrita em várias Regiões.",
      "TTL: expira e apaga itens automaticamente após um tempo, ideal para sessões.",
      "Streams: um fluxo das mudanças nos itens, que pode disparar funções Lambda.",
      "Backups sob demanda e recuperação até um ponto no tempo.",
    ] },

    { tipo: "h", texto: "Bancos especializados" },
    { tipo: "tabela", legenda: "Cada banco para o seu problema", cabecalho: ["Serviço", "Tipo", "Quando usar"], linhas: [
      ["Amazon ElastiCache", "Cache em memória (Redis OSS, Valkey ou Memcached)", "Acelerar leituras repetidas, guardar sessões, filas e placares, reduzindo a carga do banco principal."],
      ["Amazon MemoryDB", "Banco em memória compatível com Redis, durável", "Quando o dado em memória também precisa ser durável e consistente."],
      ["Amazon Redshift", "Data warehouse colunar (OLAP)", "Análises e relatórios sobre grandes volumes de dados históricos."],
      ["Amazon DocumentDB", "Documentos, compatível com o MongoDB", "Aplicações que já usam o MongoDB ou dados em documentos JSON."],
      ["Amazon Neptune", "Grafo", "Relações complexas: redes sociais, detecção de fraude, recomendações."],
      ["Amazon Keyspaces", "Colunas largas, compatível com o Cassandra", "Aplicações Cassandra sem administrar servidores."],
      ["Amazon Timestream", "Séries temporais", "Dados de sensores, métricas e eventos ao longo do tempo."],
    ] },
    { tipo: "p", texto: "Alguns serviços de apoio completam o quadro. O AWS Database Migration Service (DMS) migra bancos para a AWS com o mínimo de interrupção, inclusive entre motores diferentes, e o AWS Schema Conversion Tool ajuda a converter o esquema. O Amazon Athena consulta dados no S3 com SQL, sem servidores. E o Amazon QuickSight cria painéis a partir dos dados." },
    { tipo: "codigo", linguagem: "python", legenda: "escolher_banco.py", texto: `from dataclasses import dataclass


@dataclass(frozen=True)
class Necessidade:
    descricao: str
    relacional: bool = False
    chave_valor_em_escala: bool = False
    cache_em_memoria: bool = False
    analise_de_grandes_volumes: bool = False
    grafo: bool = False
    documentos_mongodb: bool = False


def escolher(n: Necessidade) -> str:
    if n.cache_em_memoria:
        return "Amazon ElastiCache"
    if n.analise_de_grandes_volumes:
        return "Amazon Redshift (data warehouse)"
    if n.grafo:
        return "Amazon Neptune"
    if n.documentos_mongodb:
        return "Amazon DocumentDB"
    if n.chave_valor_em_escala:
        return "Amazon DynamoDB"
    if n.relacional:
        return "Amazon RDS (ou Aurora)"
    return "avaliar melhor o requisito"


cenarios = [
    Necessidade("Sistema de pedidos com transações e junções", relacional=True),
    Necessidade("Carrinho de compras com milhões de acessos por segundo", chave_valor_em_escala=True),
    Necessidade("Acelerar leituras repetidas de um catálogo", cache_em_memoria=True),
    Necessidade("Relatórios sobre petabytes de histórico de vendas", analise_de_grandes_volumes=True),
    Necessidade("Rede social: quem conhece quem", grafo=True),
    Necessidade("Migrar uma aplicação que usa MongoDB", documentos_mongodb=True),
]

for cenario in cenarios:
    print(f"{cenario.descricao} -> {escolher(cenario)}")` },
    { tipo: "codigo", linguagem: "text", legenda: "Saída", texto: `Sistema de pedidos com transações e junções -> Amazon RDS (ou Aurora)
Carrinho de compras com milhões de acessos por segundo -> Amazon DynamoDB
Acelerar leituras repetidas de um catálogo -> Amazon ElastiCache
Relatórios sobre petabytes de histórico de vendas -> Amazon Redshift (data warehouse)
Rede social: quem conhece quem -> Amazon Neptune
Migrar uma aplicação que usa MongoDB -> Amazon DocumentDB` },
    { tipo: "p", texto: "O programa codifica, de forma simplificada, o raciocínio que o exame espera: parte-se da necessidade dominante (cache, análise, grafo, documentos, chave-valor em escala, relacional) e chega-se ao serviço. Na vida real, os requisitos se misturam, e é comum combinar bancos (o relacional como fonte da verdade, o cache na frente, o warehouse para os relatórios), mas, para a prova, procure a palavra-chave que aponta o serviço." },

    { tipo: "h", texto: "Segurança de bancos de dados na AWS" },
    { tipo: "lista", itens: [
      "Coloque o banco em sub-redes privadas, sem acesso público, com um grupo de segurança que só aceita conexões da aplicação.",
      "Criptografe em repouso (KMS) e em trânsito (TLS). Ative a criptografia na criação, já que mudá-la depois dá mais trabalho.",
      "Guarde as credenciais no AWS Secrets Manager, com rotação automática, e nunca no código.",
      "Controle o acesso à API de administração com o IAM, e, quando o motor permitir, a autenticação do banco com o IAM, sem senhas fixas.",
      "Registre as operações: o CloudTrail registra as chamadas de API, e o banco pode exportar logs de consultas e de auditoria para o CloudWatch.",
      "Pelo modelo de responsabilidade compartilhada, a AWS protege a infraestrutura e a plataforma do serviço; os dados, as permissões, a rede e a criptografia escolhida são seus.",
    ] },
  ],
  questoes: [
    {
      enunciado: "Uma empresa precisa de um banco relacional gerenciado, sem administrar o sistema operacional, os patches e os backups. Qual serviço atende?",
      opcoes: ["Amazon S3", "Amazon ElastiCache", "Amazon RDS", "AWS Snowball"],
      correta: 2,
      explicacao: "O RDS é o serviço de banco relacional gerenciado: a AWS cuida da instalação, dos patches e dos backups, enquanto o cliente cuida dos dados, do esquema e do acesso.",
    },
    {
      enunciado: "Qual recurso do RDS mantém uma cópia síncrona em outra Zona de Disponibilidade para failover automático?",
      opcoes: ["Réplica de leitura", "Snapshot manual", "Auto Scaling", "Multi-AZ"],
      correta: 3,
      explicacao: "O Multi-AZ replica de forma síncrona para uma instância em outra AZ e faz o failover automático. É voltado à disponibilidade, e não à escala de leitura.",
    },
    {
      enunciado: "Uma aplicação tem muitas leituras que sobrecarregam o banco principal. O que ajuda a escalar as leituras?",
      opcoes: ["Multi-AZ", "Réplicas de leitura", "Um segundo grupo de segurança", "Mais snapshots"],
      correta: 1,
      explicacao: "As réplicas de leitura atendem consultas de leitura e aliviam a instância principal. A reserva do Multi-AZ não atende tráfego.",
    },
    {
      enunciado: "Qual serviço é um banco NoSQL serverless de chave-valor, com latência de poucos milissegundos em qualquer escala?",
      opcoes: ["Amazon DynamoDB", "Amazon Redshift", "Amazon RDS para Oracle", "Amazon Neptune"],
      correta: 0,
      explicacao: "O DynamoDB é totalmente gerenciado, serverless e escala sem limite prático. O Redshift é um data warehouse, o Neptune é de grafos, e o RDS é relacional.",
    },
    {
      enunciado: "Qual serviço é indicado para análises e relatórios sobre grandes volumes de dados históricos (OLAP)?",
      opcoes: ["Amazon Redshift", "Amazon ElastiCache", "Amazon DynamoDB", "Amazon DocumentDB"],
      correta: 0,
      explicacao: "O Redshift é um data warehouse colunar, projetado para consultas analíticas pesadas. O ElastiCache é cache, e os demais são voltados a cargas transacionais.",
    },
    {
      enunciado: "Uma aplicação precisa acelerar a leitura repetida de dados muito acessados, reduzindo a carga do banco. Qual serviço usar?",
      opcoes: ["Amazon ElastiCache", "AWS Direct Connect", "Amazon Redshift", "AWS Backup"],
      correta: 0,
      explicacao: "O ElastiCache guarda dados em memória (Redis ou Memcached) para leituras muito rápidas, aliviando o banco principal.",
    },
    {
      enunciado: "Qual serviço é adequado para modelar e consultar relacionamentos complexos, como redes sociais e detecção de fraude?",
      opcoes: ["Amazon S3", "Amazon Neptune", "Amazon Aurora", "Amazon Keyspaces"],
      correta: 1,
      explicacao: "O Neptune é um banco de grafos, feito para dados altamente conectados e consultas sobre relacionamentos.",
    },
  ],
  desafio: {
    titulo: "Arquitetura de dados de um aplicativo de entregas",
    enunciado: "Um aplicativo de entregas tem: cadastro de clientes e restaurantes com pedidos e pagamentos (precisa de transações), acompanhamento em tempo real da posição dos entregadores (milhões de atualizações por minuto), um catálogo de cardápios muito lido e relatórios mensais sobre três anos de pedidos. Monte a arquitetura de dados na AWS e justifique cada escolha. Não é preciso criar recursos.",
    requisitos: [
      "Escolha o serviço de banco de dados para cada um dos quatro tipos de dado, justificando pelo padrão de acesso.",
      "Desenhe as chaves de uma tabela do DynamoDB para a posição dos entregadores (chave de partição e de ordenação) e diga qual consulta ela responde bem e qual não responde.",
      "Defina a estratégia de disponibilidade e de leitura do banco relacional: onde usar Multi-AZ e onde usar réplicas de leitura, e por quê.",
      "Descreva a proteção dos dados: rede, criptografia, segredos e backups, incluindo o tempo de retenção.",
      "Diga quem é responsável (AWS ou a empresa) por cada item da proteção, segundo o modelo de responsabilidade compartilhada.",
    ],
    criterios: [
      "Cada escolha parte do padrão de acesso, e não da popularidade do serviço.",
      "A justificativa distingue disponibilidade (Multi-AZ) de desempenho de leitura (réplicas).",
      "Nenhum banco fica acessível publicamente na proposta.",
      "O desenho do DynamoDB mostra consciência do que ele não faz bem (consultas fora das chaves).",
      "As responsabilidades de cada lado estão corretas e explicadas.",
    ],
    dica: "Liste, para cada tipo de dado, as três perguntas mais frequentes que o sistema fará (\"onde está o entregador X agora?\"). As perguntas ditam o tipo de banco e, no DynamoDB, as chaves.",
  },
  referencias: [
    { titulo: "AWS: o que é o Amazon RDS", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html" },
    { titulo: "AWS: o que é o Amazon DynamoDB", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html" },
    { titulo: "AWS: bancos de dados na AWS, como escolher", url: "https://aws.amazon.com/products/databases/" },
  ],
};
